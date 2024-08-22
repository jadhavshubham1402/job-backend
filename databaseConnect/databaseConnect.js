const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

const connectToDatabase = new Promise((resolve, reject) => {
  mongoose
    .connect(MONGO_URL, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    })
    .then((data) => {
      resolve(data);
      console.log("connected to mongodb");
    })
    .catch((err) => {
      reject();
      console.log(err);
    });
});

module.exports = connectToDatabase;
