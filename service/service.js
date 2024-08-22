const applicationSchema = require("../model/applicationSchema");
const jobfieldSchema = require("../model/jobfieldSchema");
const otpSchema = require("../model/otpSchema");
const userSchema = require("../model/userSchema");

//user CRUD
function getOneUser(data) {
  return userSchema.findOne(data);
}

function createUser(userData) {
  return userSchema.create(userData);
}

function updateUser(filter, update, options = {}) {
  return userSchema.findOneAndUpdate(filter, update, options);
}

//OTP cruds
function createOtp(data) {
  return otpSchema.create(data);
}

function getOtp(data, options = {}) {
  return otpSchema.findOne(data, options);
}

function updateOtp(filter, update) {
  return otpSchema.findOneAndUpdate(filter, update);
}

function deleteOtp(data) {
  return otpSchema.deleteOne(data);
}

//Application Crud
function createApplication(data) {
  return applicationSchema.create(data);
}

function updateApplication(filter, update, options = {}) {
  return applicationSchema.findOneAndUpdate(filter, update, (options = {}));
}

function getOneApplication(filter) {
  return applicationSchema.findOne(filter);
}

function getAllApplication(page,limit) {
  return applicationSchema
    .find()
    .skip((page - 1) * limit)
    .limit(limit);
}

//jobfieldSchema crud
function getJobFields() {
  return jobfieldSchema.find();
}

function createJobField(data) {
  return jobfieldSchema.create(data);
}

function updateJobfield(filter, update) {
  return jobfieldSchema.findOneAndUpdate(filter, update);
}

// application status
function getOneAppStatus(filter) {
  return applicationSchema.findById(filter);
}

function createApplicationStatus(data) {
  return applicationSchema.create(data);
}

function updateAppStatus(filter, update) {
  return applicationSchema.findOneAndUpdate(filter, update);
}

function updateManyAppStatus(filter, update) {
  return applicationSchema.updateMany(filter, update);
}

module.exports = {
  getOneUser,
  createUser,
  updateUser,
  createOtp,
  getOtp,
  updateOtp,
  deleteOtp,
  getAllApplication,
  createApplication,
  updateApplication,
  getOneApplication,
  getJobFields,
  createJobField,
  updateJobfield,
  getOneAppStatus,
  createApplicationStatus,
  updateAppStatus,
  updateManyAppStatus,
};
