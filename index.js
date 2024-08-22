require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connectToDatabase = require("./databaseConnect/databaseConnect");
const router = require("./route/routes");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(express.json());

connectToDatabase.then(() => {
  //health check routes
  app.get("/", (req, res) => {
    res.json("health check");
  });

  app.use("/api/", router);

  //error handler
  app.use(function (err, req, res, next) {
    res.status(500);
    res.send({
      message: "something went wrong",
      error: err?.message || err,
      code: err.code,
    });
  });

  app.listen(process.env.PORT, () => {
    console.log(`Server is running at port 5000`);
  });
});

module.exports = app;
