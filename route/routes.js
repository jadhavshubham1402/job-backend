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
} = require("../controller/controller");
const { authorize } = require("../middleware/auth");
const router = require("express").Router();

router.post("/sendOtp", sendOtp);
router.post("/login", login);
router.post("/otpverify", otpVerify);
router.post("/forgotPassword", forgotPassword);
router.post("/createJobFields", authorize, createJobFields);
router.post("/updateJobfields", authorize, updateJobfields);
router.get("/getJobField", authorize, getJobField);
router.post("/getApplication", authorize, getApplication);
router.post("/createOneApplication", authorize, createOneApplication);
router.post("/updateOneApplication", authorize, updateOneApplication);
router.post("/createApplicationStatus", authorize, createOneApplicationStatus);
router.post(
  "/updateOneApplicationStatus",
  authorize,
  updateOneApplicationStatus
);

module.exports = router;
