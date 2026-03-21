import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  scan: { type: String, required: true },   // IPFS hash of the scan image
  doctors: { type: [String], default: [] }, // wallet addresses of doctors
  patient: { type: String, required: true }, // wallet address of patient
  labWallet: { type: String }, // wallet address of the laboratory who uploaded
  hospital: { type: String, required: true }, // hospital or lab name
  comments: [{
    doctorWallet: String,
    doctorName: String,
    content: String,
    date: { type: Date, default: Date.now }
  }],
  reportType: { type: String },
  date: { type: Date, default: Date.now },
  contractAddress: { type: String },
});

const Report = mongoose.model("Report", ReportSchema);

export default Report;
