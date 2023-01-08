//const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const mid1 = async function (req, res, next) {
  try {
    let ex = req.headers["x-api-key"];
    if (ex) {
      let tokenv = jwt.verify(ex, "functionup-Project1");
      if (tokenv) {
        next();
      } else {
        res.status(401).send({ status: false, msg: "autention fail" });
      }
    } else {
      res.status(400).send({ status: false, msg: "token required" });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports.mid1 = mid1;
