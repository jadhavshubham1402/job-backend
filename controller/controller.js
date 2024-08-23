const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  getOneUser,
  createUser,
  createOtp,
  updateOtp,
  deleteOtp,
  createJobField,
  updateJobfield,
  getJobFields,
  createApplication,
  updateApplication,
  updateManyAppStatus,
  updateAppStatus,
  getOneApplication,
  getOneAppStatus,
  getAllApplication,
  createUserResume,
  createApplicationStatus,
  getAllAppStatus,
  getResume,
} = require("../service/service");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const client = new MongoClient(process.env.MONGO_URL);

// user login register forgotPassword

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Invalid Credentials");
    }
    let user = await getOneUser({
      email,
      //   otpVerify: true,
    }).lean();

    if (!user) {
      throw Error("User not found");
    }

    let compareResult = bcrypt.compare(password, user.password);

    if (compareResult) {
      const token = jwt.sign({ user }, process.env.PRIVATE_KEY, {
        expiresIn: "1d",
        algorithm: "HS256",
      });

      delete user.password;

      res.json({
        code: 200,
        user,
        token,
        message: "welcome",
      });
    } else {
      res.status(401).send({
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
}

async function sendOtp(req, res) {
  try {
    let { name, email, password, type } = req.body;

    let userData = await getOneUser({
      email,
    }).lean();

    if (userData && userData.otpVerify) {
      throw Error("User already exist");
    }

    if (!userData) {
      password = bcrypt.hashSync(password, 10);

      await createUser({
        name,
        email,
        password,
        type,
      });
    }

    // const sendMail = sendEmail(email);

    // if (sendMail) {
    res.json({
      code: 201,
      message: "User created",
    });
    // }

    // res.status(404)({
    //   message: "Otp not sent",
    // });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    let userData = await getOneUser({
      email,
    }).lean();

    if (!userData) {
      throw new Error("User Not Found");
    }
    const sendMail = await sendEmail(email);

    if (sendMail) {
      res.json({
        code: 200,
        message: "otp sent",
      });
    }

    res.status(404)({
      message: "Otp not sent",
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function sendEmail(email) {
  try {
    // Create a transporter object
    let otpModify;
    const otp = generateOTP();

    const getOneOtp = await getOtp({ email });

    if (getOneOtp && getOneOtp.attempt > 5) {
      await updateOtp({ email }, { attempt: 1 });
      throw new Error(
        "Maximum attempt has been done, Please try after 15 minutes"
      );
    } else if (getOneOtp && getOneOtp.expirationDate > new Date()) {
      throw new Error("Please try after Sometime");
    }

    if (
      getOneOtp &&
      getOneOtp.attempt <= 5 &&
      getOneOtp.expirationDate < new Date()
    ) {
      otpModify = await updateOtp(
        { email },
        {
          otp: otp,
          $inc: { attempts: 1 },
          expirationDate: new Date(Date.now() + 2 * 60 * 1000),
        }
      );
    }
    if (!getOneOtp) {
      const otpData = {
        email: email,
        otp: otp,
        expirationDate: new Date(Date.now() + 2 * 60 * 1000),
      };

      otpModify = await createOtp(otpData);
    }

    if (otpModify) {
      const transporter = nodemailer.createTransport({
        service: "gmail", // Specify the email service (Gmail, Outlook, etc.)
        auth: {
          user: "jadhav.shubham1402@gmail.com", // Your email address
          pass: "Shubham@1999", // Your email password or app-specific password
        },
      });

      const mailOptions = {
        from: "jadhav.shubham1402@gmail.com", // Sender address
        to: email, // List of recipients
        subject: "Hello from Job Posting", // Subject line
        text: "This is test job posting!", // Plain text body
        html: `<p>This is a test OTP is <strong>${otp}</strong>!</p>`, // HTML body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return false;
        }
        return true;
      });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
}

function generateOTP(length = 6) {
  // Ensure the length is a number and greater than 0
  if (isNaN(length) || length <= 0) {
    throw new Error("Length must be a positive number");
  }

  // Generate a random OTP
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Generate a random digit from 0 to 9
  }

  return otp;
}

const calculateRelevancyScore = (resume, jobPosting) => {
  let score = 0;
  const totalRequirements = jobPosting.length;

  // Count matches for skills
  const matchedSkills = resume.skills.filter((skill) =>
    jobPosting.includes(skill)
  );
  score += (matchedSkills.length / totalRequirements) * 100;

  // Additional scoring based on experience or other criteria can be added here

  return score;
};

async function otpVerify(req, res) {
  const session = client.startSession();
  try {
    session.startTransaction();
    let { email, otp, password } = req.body;

    const getOneOtp = await getOtp(
      {
        email,
        otp,
        expirationDate: { $gte: new Date() },
        attempts: { $lt: 5 },
      },
      { session }
    );

    if (!getOneOtp) {
      throw new Error("otp is not valid");
    }

    if (getOneOtp) {
      let update = { otpVerify: true };
      if (password) {
        update = { ...update, password: bcrypt.hashSync(password, 10) };
      }

      await updateUser({ email }, update, { session });
      await deleteOtp({ email }, { session });
    }
  } catch (error) {
    console.log(error);
    session.abortTransaction();
    res.status(404).send({ message: error.message });
  } finally {
    session.endSession();
  }
}

//jobField

async function createJobFields(req, res) {
  try {
    if (req.decoded.user.type != "admin") {
      throw new Error("You dont have access to this route");
    }
    const { jobTypes, jobCategories } = req.body;

    const createData = await createJobField({ jobCategories, jobTypes });

    if (!createData) {
      throw new Error("Data not added");
    }

    res.json({
      code: 201,
      message: "Data Added",
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function updateJobfields(req, res) {
  try {
    if (req.decoded.user.type != "admin") {
      throw new Error("You dont have access to this route");
    }
    const { id, jobTypes, jobCategories } = req.body;

    await updateJobfield(
      { _id: id },
      { $addToSet: { jobTypes: jobTypes, jobCategories: jobCategories } }
    );

    res.json({
      code: 200,
      message: "Data updated",
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function getJobField(req, res) {
  try {
    const data = await getJobFields();

    res.json({
      code: 200,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

//application

async function createOneApplication(req, res) {
  try {
    if (req.decoded.user.type != "admin") {
      throw new Error("You dont have access to this route");
    }
    const createData = await createApplication(req.body);

    if (!createData) {
      throw new Error("application not created");
    }

    res.json({
      code: 201,
      message: "Application created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function getApplication(req, res) {
  try {
    const getData = await getAllApplication(req.body);

    res.json({
      code: 200,
      data: getData,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function updateOneApplication(req, res) {
  try {
    if (req.decoded.user.type != "admin") {
      throw new Error("You dont have access to this route");
    }

    const { _id } = req.body;

    await updateApplication({ _id }, req.body);

    res.json({
      code: 200,
      message: "application updated",
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function getOneAppForm(req, res) {
  try {
    const getData = await getOneApplication(req.body);

    res.json({
      code: 200,
      data: getData,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function createOneApplicationStatus(req, res) {
  try {
    const userId = req.decoded.user._id;
    const { applicationId } = req.body;

    const getData = await getOneApplication({
      _id: applicationId,
      //   status: "active",
    });

    if (!getData) {
      throw new Error("application not found");
    }

    const getResumeData = await getResume({ userId });

    if (!getResumeData) {
      throw new Error("kindly upload your resume");
    }

    const getStatus = await getOneAppStatus({ applicationId, userId });

    if (getStatus) {
      throw new Error("Already Apply for given Post");
    }

    const score = calculateRelevancyScore(getResumeData, getData.skills);

    const transporter = nodemailer.createTransport({
      service: "gmail", // Specify the email service (Gmail, Outlook, etc.)
      auth: {
        user: "jadhav.shubham1402@gmail.com", // Your email address
        pass: "Shubham@1999", // Your email password or app-specific password
      },
    });

    const mailOptions = {
      from: "jadhav.shubham1402@gmail.com", // Sender address
      to: "recipient@example.com", // List of recipients
      subject: "Hello from NodeMailer", // Subject line
      html: `<p>Your Application is ${"pending"}</p>`, // HTML body
    };

    // const sendmail = transporter.sendMail(mailOptions, (error, info) => {
    // //   if (error) {
    // //     throw new Error("Email not sent");
    // //   }
    //   return true;
    // });

    // if (sendmail) {
    const createData = await createApplicationStatus({
      userId,
      applicationId,
      relevancyScore: score,
    });

    if (!createData) {
      throw new Error("application not created");
    }

    res.json({
      code: 200,
      mesage: "applied successfully",
    });
    // }
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function updateOneApplicationStatus(req, res) {
  const session = client.startSession();

  try {
    if (req.decoded.user.type != "admin") {
      throw new Error("You dont have access to this route");
    }
    session.startTransaction();
    const { id, status, reason } = req.body;

    const getData = await getOneAppStatus({ _id: id });

    if (!getData) {
      throw new Error("Application not found");
    }

    await updateAppStatus(
      {
        _id: id,
      },
      { status: status, reason: reason },
      { session }
    );

    if (status == "approved") {
      await updateApplication(
        { _id: getData.applicationId },
        { status: "inactive" },
        { session }
      );
      await updateManyAppStatus(
        {
          applicationId: getData.applicationId,
        },
        { status: "rejected" },
        { session }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail", // Specify the email service (Gmail, Outlook, etc.)
      auth: {
        user: "jadhav.shubham1402@gmail.com", // Your email address
        pass: "Shubham@1999", // Your email password or app-specific password
      },
    });

    const mailOptions = {
      from: "jadhav.shubham1402@gmail.com", // Sender address
      to: "recipient@example.com", // List of recipients
      subject: "Hello from NodeMailer", // Subject line
      html: `<p>Your Application is ${status}</p>`, // HTML body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error("Email not sent");
      }

      res.json({
        code: 200,
        message: "application updated successfully",
      });
    });
  } catch (error) {
    console.log(error);
    session.abortTransaction();
    res.status(404).send({ message: error.message });
  } finally {
    session.endSession();
  }
}

async function getAllApplicationStatus(req, res) {
  try {
    const getData = await getAllAppStatus(req.body);

    const data = [];

    for (const element of getData) {
      const getApp = await getOneApplication({ _id: element.applicationId });

      console.log(getApp, "here");

      const getUserData = await getResume({ userId: element.userId });

      data.push({
        _id: element._id,
        title: getApp?.title,
        description: getApp?.description,
        firstName: getUserData?.firstName,
        lastName: getUserData?.lastName,
        mobileNo: getUserData?.mobileNo,
        salary: getApp?.salary,
        currentSalary: getUserData?.currentSalary,
        expectedSalary: getUserData?.expectedSalary,
        relevancyScore: element?.relevancyScore,
        status: element?.status,
        reason: element?.reason,
        createdAt: element?.createdAt,
      });
    }

    res.json({
      code: 200,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

//resume
async function createResume(req, res) {
  try {
    console.log(req.file);
    req.body["resumeLink"] = req.file.path.replace(/\\/g, "/");

    req.body["userId"] = req.decoded.user._id;

    const createData = await createUserResume(req.body);

    if (!createData) {
      throw new Error("Resume not added");
    }

    res.json({
      code: 200,
      mesage: "data added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

async function updateResume(req, res) {
  try {
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: error.message });
  }
}

module.exports = {
  login,
  sendOtp,
  otpVerify,
  forgotPassword,
  createJobFields,
  updateJobfields,
  getJobField,
  createOneApplication,
  updateOneApplication,
  getOneAppForm,
  createOneApplicationStatus,
  updateOneApplicationStatus,
  getApplication,
  getAllApplicationStatus,
  createResume,
  updateResume,
};
