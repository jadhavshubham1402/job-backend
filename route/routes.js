const {
  login,
  sendOtp,
  forgotPassword,
  otpVerify,
  createJobFields,
  updateJobfields,
  getJobField,
  createOneApplication,
  updateOneApplication,
  updateOneApplicationStatus,
  getApplication,
  createOneApplicationStatus,
  createResume,
  updateResume,
  getAllApplicationStatus,
  getOneAppForm,
} = require("../controller/controller");
const { authorize } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = require("express").Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Example limit of 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    // Check if file's mime type is in the allowed types
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error("Invalid file type"));
    }
  },
});

router.post("/createResume", upload.single("file"), authorize, createResume);
router.post("/updateResume", upload.single("file"), updateResume);
router.post("/sendOtp", sendOtp);
router.post("/login", login);
router.post("/otpverify", otpVerify);
router.post("/forgotPassword", forgotPassword);
router.post("/createJobFields", authorize, createJobFields);
router.post("/updateJobfields", authorize, updateJobfields);
router.get("/getJobField", authorize, getJobField);
router.post("/getApplication", authorize, getApplication);
router.post("/getOneAppForm", authorize, getOneAppForm);
router.post("/getAllApplicationStatus", authorize, getAllApplicationStatus);
router.post("/createOneApplication", authorize, createOneApplication);
router.post("/updateOneApplication", authorize, updateOneApplication);
router.post("/createApplicationStatus", authorize, createOneApplicationStatus);
router.post(
  "/updateOneApplicationStatus",
  authorize,
  updateOneApplicationStatus
);

module.exports = router;
