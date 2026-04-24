import Report from "../models/Report.js";
import fs from "fs";
import { uploadToIPFS } from "../services/ipfsService.js";
import { deployReportContract, addDoctorsToContract, syncDoctorsOnContract } from "../services/blockchainService.js"; // ✅ Import service
import Web3 from "web3";
import * as dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Initialize Web3 with Infura RPC URL
const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.INFURA_RPC_URL)
);
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.getChainId().then((id) => console.log("Connected to Chain ID:", id));

// Upload a report
const uploadReport = async (req, res) => {
  try {
    const report = new Report(req.body);
    const savedReport = await report.save();
    return res.status(201).json(savedReport);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Get all reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    return res.json(reports);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Upload prescription route
const uploadRx = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { doctor, patient, hospital, diagnosis, analysis, signature, reportType } =
      req.body;

    if (
      !doctor ||
      !patient ||
      !hospital ||
      !diagnosis ||
      !analysis ||
      !signature
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload to IPFS
    const { hash: ipfsHash, url: ipfsUrl } = await uploadToIPFS(file.path);
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    // Deploy smart contract via service
    const { contractAddress } = await deployReportContract(
      account.address,
      process.env.PRIVATE_KEY,
      patient,
      doctor,
      reportType || "Brain Tumor Report", // Default if not provided
      ipfsUrl,
      "",
      diagnosis,
      analysis,
      signature
    );

    // Save to DB
    const newReport = new Report({
      scan: ipfsUrl,
      doctor,
      patient,
      hospital,
      date: new Date(),
      contractAddress: contractAddress,
    });

    await newReport.save();

    return res.status(201).json({
      message: "Contract deployed and report uploaded",
      ipfsUrl: ipfsUrl,
      contractAddress: contractAddress,
    });
  } catch (err) {
    console.error("Upload Rx Error:", err);
    return res
      .status(500)
      .json({ error: "Failed to upload and deploy contract" });
  }
};

// Upload Laboratory Report
const uploadLabReport = async (req, res) => {
  try {
    const file = req.file;
    const { labWallet, patientWallet, hospital, reportType } = req.body;

    if (!file || !labWallet || !patientWallet || !hospital) {
      return res.status(400).json({ error: "Missing required fields or file" });
    }

    // Identify user and verify type on backend
    const labUser = await User.findOne({ wallet: { $regex: new RegExp(`^${labWallet}$`, "i") } });
    if (!labUser || labUser.user_type !== "laboratory") {
      return res.status(403).json({ error: "Only laboratories can upload reports" });
    }

    // Upload to IPFS
    const { url } = await uploadToIPFS(file.path);
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    // Deploy contract (doctor set to zero address initially)
    const { contractAddress } = await deployReportContract(
      account.address,
      process.env.PRIVATE_KEY,
      patientWallet,
      "0x0000000000000000000000000000000000000000",
      reportType || "Lab Report",
      url,
      "",
      "Laboratory Diagnosis",
      "Laboratory Analysis",
      "Lab-Signature-Pending"
    );

    // Save to DB
    const newReport = new Report({
      scan: url,
      doctors: [], // Initialize with empty array
      patient: patientWallet,
      labWallet: labWallet, // Save lab creator
      hospital,
      reportType: reportType || "Lab Report",
      date: new Date(),
      contractAddress,
    });

    await newReport.save();

    return res.status(201).json({
      message: "Lab report uploaded and contract deployed",
      ipfsUrl: url,
      contractAddress,
    });
  } catch (err) {
    console.error("Lab Upload Error:", err);
    return res.status(500).json({ error: "Failed to upload lab report" });
  }
};

// Get reports for a specific patient
const getPatientReports = async (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ error: "Patient wallet is required" });
    }

    // Authorization: Only the patient themselves can see their own reports (unless it's a doctor via a different route)
    if (req.user.user_type === 'patient' && req.user.wallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "Access denied: You can only view your own reports" });
    }

    // Find reports where the patient wallet matches (case-insensitive)
    const reports = await Report.find({
      patient: { $regex: new RegExp(`^${wallet}$`, "i") },
    }).sort({ date: -1 }).lean();

    // Enrich reports with doctor names
    const enrichedReports = await Promise.all(reports.map(async (report) => {
      const doctorInfos = await User.find({
        wallet: { $in: report.doctors.map(w => new RegExp(`^${w}$`, "i")) }
      }, 'name wallet').lean();

      // Map names back to the doctors array
      const doctorsWithNames = report.doctors.map(w => {
        const info = doctorInfos.find(d => d.wallet.toLowerCase() === w.toLowerCase());
        return { wallet: w, name: info ? info.name : "Unknown Doctor" };
      });

      return { ...report, doctors: doctorsWithNames };
    }));

    return res.json(enrichedReports);
  } catch (err) {
    console.error("Get Patient Reports Error:", err);
    return res.status(500).json({ error: "Failed to fetch patient reports" });
  }
};

// Get a single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).lean();
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Enrich with doctor names
    const doctorInfos = await User.find({
      wallet: { $in: report.doctors.map(w => new RegExp(`^${w}$`, "i")) }
    }, 'name wallet').lean();

    const doctorsWithNames = report.doctors.map(w => {
      const info = doctorInfos.find(d => d.wallet.toLowerCase() === w.toLowerCase());
      return { wallet: w, name: info ? info.name : "Unknown Doctor" };
    });

    return res.json({ ...report, doctors: doctorsWithNames });
  } catch (err) {
    console.error("Get Report By ID Error:", err);
    return res.status(500).json({ error: "Failed to fetch report details" });
  }
};

// Assign multiple doctors to a report
const assignDoctors = async (req, res) => {
  try {
    const { reportId, doctorWallets } = req.body;

    if (!reportId || !doctorWallets || !Array.isArray(doctorWallets)) {
      return res.status(400).json({ error: "Report ID and an array of doctor wallets are required" });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // 1. Update Blockchain (Overwrite)
    await syncDoctorsOnContract(
      report.contractAddress,
      account.address,
      process.env.PRIVATE_KEY,
      doctorWallets
    );

    // 2. Update MongoDB (Overwrite completely as requested)
    report.doctors = doctorWallets;
    await report.save();

    return res.json({ message: "Doctors updated successfully", doctors: doctorWallets });
  } catch (err) {
    console.error("Assign Doctors Error:", err);
    return res.status(500).json({ error: "Failed to assign doctors" });
  }
};

// Get reports for a specific doctor
const getDoctorReports = async (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) return res.status(400).json({ error: "Doctor wallet is required" });

    // Authorization: Only the doctor themselves can see reports assigned to them
    if (req.user.user_type === 'doctor' && req.user.wallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "Access denied: You can only view reports assigned to you" });
    }

    // Find reports where the doctor wallet is in the doctors array
    const reports = await Report.find({
      doctors: { $regex: new RegExp(`^${wallet}$`, "i") },
    }).sort({ date: -1 }).lean();

    const patientWallets = [...new Set(reports.map(r => r.patient))];
    const patientInfos = await User.find({
      wallet: { $in: patientWallets.map(w => new RegExp(`^${w}$`, "i")) }
    }, 'name wallet').lean();

    // Privacy Filter & Enrich: Remove comments by other doctors, attach patientName
    const filteredReports = reports.map(report => {
      const pInfo = patientInfos.find(p => p.wallet.toLowerCase() === report.patient.toLowerCase());
      report.patientName = pInfo ? pInfo.name : null;

      report.comments = (report.comments || []).filter(c =>
        c.doctorWallet.toLowerCase() === wallet.toLowerCase()
      );
      return report;
    });

    return res.json(filteredReports);
  } catch (err) {
    console.error("Get Doctor Reports Error:", err);
    return res.status(500).json({ error: "Failed to fetch doctor reports" });
  }
};

// Add a comment to a report by a doctor
const addDoctorComment = async (req, res) => {
  try {
    const { reportId, doctorWallet, doctorName, content } = req.body;

    if (!reportId || !doctorWallet || !content) {
      return res.status(400).json({ error: "Report ID, wallet, and content are required" });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Verify doctor is assigned
    if (!report.doctors.some(w => w.toLowerCase() === doctorWallet.toLowerCase())) {
      return res.status(403).json({ error: "Access denied: You are not assigned to this report" });
    }

    // Add to MongoDB
    report.comments.push({
      doctorWallet,
      doctorName,
      content,
      date: new Date()
    });

    await report.save();

    return res.json({ message: "Comment added successfully", comments: report.comments.filter(c => c.doctorWallet.toLowerCase() === doctorWallet.toLowerCase()) });
  } catch (err) {
    console.error("Add Doctor Comment Error:", err);
    return res.status(500).json({ error: "Failed to add comment" });
  }
};

// Get reports uploaded by a specific laboratory
const getLabReports = async (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) return res.status(400).json({ error: "Lab wallet is required" });

    // Authorization
    if (req.user.user_type === 'laboratory' && req.user.wallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "Access denied: You can only view reports you uploaded" });
    }

    const reports = await Report.find({
      labWallet: { $regex: new RegExp(`^${wallet}$`, "i") },
    }).sort({ date: -1 }).lean();

    const patientWallets = [...new Set(reports.map(r => r.patient))];
    const patientInfos = await User.find({
      wallet: { $in: patientWallets.map(w => new RegExp(`^${w}$`, "i")) }
    }, 'name wallet').lean();

    const enrichedReports = reports.map(report => {
      const pInfo = patientInfos.find(p => p.wallet.toLowerCase() === report.patient.toLowerCase());
      report.patientName = pInfo ? pInfo.name : null;
      return report;
    });

    return res.json(enrichedReports);
  } catch (err) {
    console.error("Get Lab Reports Error:", err);
    return res.status(500).json({ error: "Failed to fetch lab reports" });
  }
};

// Change the assigned patient of a report (For Lab Users)
const changeReportPatient = async (req, res) => {
  try {
    const { reportId, newPatientWallet } = req.body;
    if (!reportId || !newPatientWallet) {
      return res.status(400).json({ error: "Report ID and new patient wallet are required" });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Verify ownership
    if (report.labWallet.toLowerCase() !== req.user.wallet.toLowerCase()) {
      return res.status(403).json({ error: "Access denied: You did not upload this report" });
    }

    report.patient = newPatientWallet;
    await report.save();

    return res.json({ message: "Assigned patient changed successfully", patient: newPatientWallet });
  } catch (err) {
    console.error("Change Patient Error:", err);
    return res.status(500).json({ error: "Failed to change patient" });
  }
};

export default {
  uploadReport,
  getAllReports,
  uploadRx,
  uploadLabReport,
  getPatientReports,
  assignDoctors,
  getDoctorReports,
  addDoctorComment,
  getReportById,
  getLabReports,
  changeReportPatient,
};
