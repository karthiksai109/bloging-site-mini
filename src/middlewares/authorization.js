const jwt = require("jsonwebtoken");
const blogModel = require("../Models/BlogsModel");
const AuthorModel = require("../Models/AuthorModel");
const mongoose = require("mongoose");
const { query } = require("express");
const ObjectId = mongoose.Types.ObjectId;
const autherization = async function (req, res, next) {
  try {
    let body = req.body["authorId"];
    let param = req.params["authorId"];
    let querry = req.query["authorId"];
    console.log(querry);
    let filter = { body, param, querry };
    let x = req.headers["x-api-key"];
    console.log(x);
    let tokenv = jwt.verify(x, "functionup-Project1");
    let id = ObjectId(tokenv["userId"]);
    console.log(id);
    console.log(filter);
    if (body == undefined && param == undefined && querry != undefined) {
      if (id == filter["querry"]) {
        next();
      } else {
        res
          .status(403)
          .send({
            status: false,
            error: "invalid authorId Authorization fail",
          });
      }
    } else if (body == undefined && param != undefined && querry == undefined) {
      if (id == filter["param"]) {
        next();
      } else {
        res
          .status(403)
          .send({
            status: false,
            error: "invalid authorId Authorization fail",
          });
      }
    } else if (body != undefined && param == undefined && querry == undefined) {
      if (id == filter["body"]) {
        next();
      } else {
        res
          .status(403)
          .send({
            status: false,
            error: "invalid authorId Authorization fail",
          });
      }
    } else {
      res
        .status(400)
        .send({ status: false, error: "missing authorId it is manditory" });
    }
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
};
module.exports.autherization = autherization;
