const mongoose = require("mongoose");
const blogModel = require("../Models/BlogsModel");
const ObjectId = mongoose.Types.ObjectId;
const jwt = require("jsonwebtoken");
const AuthorModel = require("../Models/AuthorModel");
const BlogsModel = require("../Models/BlogsModel");

//--------------------Get data based on given querry params--------------------
const getBlogData = async function (req, res) {
  try {
    console.log(req.query);
    let query = req.query;
    let filter = { ...query };
    filter["isDeleted"] = false;
    filter["isPublished"] = true;
    let queryAttributes = Object.keys(query);
    const blogs = await BlogsModel.find({ ...filter });
    if (blogs.length > 0 && queryAttributes.length != 0) {
      res
        .status(200)
        .send({ status: true, msg: "here is your filtered data", data: blogs });
    } else if (blogs.length > 0 && queryAttributes.length == 0) {
      res
        .status(200)
        .send({
          status: true,
          msg: "these are all the documents which are not deleted and published",
          data: blogs,
        });
    } else if (blogs.length == 0 && queryAttributes.length != 0) {
      res
        .status(404)
        .send({
          status: false,
          msg: "sorry! there exist no document with your given filters",
        });
    } else if (blogs.length == 0 && queryAttributes.length == 0) {
      res
        .status(404)
        .send({ status: false, msg: "sorry! no document is present in db " });
    } else{
      res.status(400).send({ status: false, msg: "bad request " });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};


module.exports.getBlogData = getBlogData;
