import express from "express";
import multer from "multer";
import reportController from "../controllers/reportController.js";
import { protect, authorize, validateReportAccess } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
// @route   POST /api/reports
router.post("/", protect, reportController.uploadReport);

// @route   GET /api/reports
router.get("/", protect, reportController.getAllReports);

// @route   POST /api/reports/uploadRx
router.post("/uploadRx", protect, upload.single("file"), reportController.uploadRx);

// @route   POST /api/reports/labUpload
router.post("/labUpload", protect, upload.single("file"), reportController.uploadLabReport);

// @route   GET /api/reports/patient/:wallet
router.get("/patient/:wallet", protect, reportController.getPatientReports);

// @route   GET /api/reports/:id
router.get("/:id", protect, validateReportAccess, reportController.getReportById);

// @route   POST /api/reports/assign-doctors
router.post("/assign-doctors", protect, authorize("patient"), reportController.assignDoctors);

// @route   GET /api/reports/doctor/:wallet
router.get("/doctor/:wallet", protect, authorize("doctor"), reportController.getDoctorReports);

// @route   POST /api/reports/add-comment
router.post("/add-comment", protect, authorize("doctor"), validateReportAccess, reportController.addDoctorComment);

export default router;
