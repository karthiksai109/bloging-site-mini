const blogModel = require("../Models/BlogsModel");
const authorModel = require("../Models/AuthorModel");
const mW = require("../middlewares/commonMiddleware");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const ObjectId = mongoose.Types.ObjectId;
const e = require("express");
const { findOneAndUpdate } = require("../Models/BlogsModel");

//-------------------------------------------login-----------------------------------------

const login = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;
    if (!data) {
      res
        .status(400)
        .send({ status: false, msg: "enter datat for logging in" });
    } else if (
      (email == undefined || email == "") &&
      (password != undefined || password != "")
    ) {
      res
        .status(400)
        .send({ status: false, msg: "email is requied for validation" });
    } else if (
      (email != undefined || email != "") &&
      (password == undefined || password == "")
    ) {
      res
        .status(400)
        .send({ status: false, msg: "password is requied for validation" });
    } else if (Object.keys(data).length > 2) {
      res
        .status(400)
        .send({
          status: false,
          msg: "plese check your details ones there is some invalid attribute",
        });
    } else {
      let verifyDetails = await authorModel.findOne(data);
      console.log(verifyDetails)
      if (verifyDetails == null) {
        res
          .status(400)
          .send({
            status: false,
            msg: "you dont have an account / entered invalid credentials",
          });
      } else {
        let id = verifyDetails["_id"];
        console.log(id);
        let createToken = jwt.sign({"userId":id}, "functionup-Project1");
        res.header("x-api-key", createToken);
        res.status(200).send({ "status": true, data: createToken });
      }
    }
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports.login = login;

//------------------------------END---------------------------------------------------------------

//------------------------------------create author with valid details-----------------------

const createAuthor = async function (req, res) {
  try {
    let data = req.body;
    let { fname, lname, title, email, password } = data;
    let reqArr = ["fname", "lname", "title", "email", "password"];
    if (data) {
      if (fname == "" || fname == null) {
        res.status(400).send({ status: false, error: "plese provide fname" });
      } else if (!mW.isValidName(fname)) {
        res
          .status(400)
          .send({ status: false, error: "plese provide valid fname" });
      } else if (lname == "" || lname == null) {
        res.status(400).send({ status: false, error: "plese provide lname" });
      } else if (!mW.isValidName(lname)) {
        res
          .status(400)
          .send({ status: false, error: "plese provide valid lname" });
      } else if (email == "" || email == null) {
        res.status(400).send({ status: false, error: "plese provide email" });
      } else if (title == null) {
        res.status(400).send({ status: false, error: "plese provide title" });
      } else if (password == null || password == "") {
        res
          .status(400)
          .send({ status: false, error: "plese provide password" });
      } else if (!mW.isValidPassword(password)) {
        res
          .status(400)
          .send({ status: false, error: "plese enter valid password" });
      } else {
        let createData = await authorModel.create(data);
        res.status(201).send({
          status: true,
          msg: "congradulations author created succesfully",
          data: createData,
        });
      }
    }
  } catch (err) {
    res.status(400).send({ status: false, msg: err.message });
  }
};
//----------------------------------------END------------------------------------------------

//------------------------------------------create a blog if authorId is valid----------------------------------------
const createBlog = async function (req, res) {
  try {
    let data1 = req.body;
    let data2 = ObjectId(data1["authorId"]);
    let book = await authorModel.findOne({ _id: data2 });

    if (book != null) {
      let books = await blogModel.create(data1);
      res.status(201).send({ status: true, data: books });
    } else {
      res.status(404).send({ status: false, error: "Invalid authorId" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};
//---------------------------------END-------------------------------------------------

//----------------------------update blog data for given blogId in path params-------------------------------------
const updateData = async function (req, res) {
  try {
    let head = req.headers["x-api-key"];
    let tokenx = jwt.verify(head, "functionup-Project1");
    if (!tokenx) {
      res
        .status(401)
        .send({ status: false, error: "unautenticated user check your token" });
    }
    const data2 = req.params;
    if (data2 == null) {
      return res.status(400).send({ status: false, error: "must give blogId" });
    }
    let id = data2["blogId"];
    let upDateBolg = await blogModel.findOne({
      _id: { $eq: id },
      isDeleted: false,
    });

    if (upDateBolg != null) {
      if (upDateBolg["authorId"] == tokenx["userId"]) {
        let params = req.body;
        let { title, body, tags, category, subCategory } = params;
        let checkArr = ["title", "body", "tags", "category", "subCategory"];

        let p = Object.keys(params);
        if (p.length > 0) {
          console.log(p);
          p.forEach((x) => {
            if (!checkArr.includes(x)) {
              res.status(400).send({
                status: false,
                msg: `you can only change valid attributes i.e ${checkArr}`,
              });
            }
          });
          let q = await blogModel.findOneAndUpdate(
            { _id: id },
            {
              $push: { tags: tags, subcategory: subCategory },
              $set: {
                title: title,
                body: body,
                category: category,
                isPublished: true,
                publishedAt: Date.now(),
              },
            },
            { new: true }
          );
          return res.status(200).send({
            status: true,
            msg: "your blog is succesfully updated",
            data: q,
          });
        } else {
          res.status(400).send({
            status: false,
            msg: "plese enter some data to make changes ",
          });
        }
      } else {
        return res.status(403).send({
          status: false,
          msg: "you can only update on your authorized blog!",
        });
      }
    } else {
      return res.status(400).send({
        status: false,
        msg: "incorrect blogId recheck it",
      });
    }
  } catch (err) {
    res.status(400).send({ status: false, error: err.message });
  }
};

//----------------------------update END-----------------------------------------------

//----------------delete blog---------------------------------------------
const deleteBlog = async (req, res) => {
  try {
    let blog = req.params["blogId"];
    let t = req.headers["x-api-key"];
    let tokenv = jwt.verify(t, "functionup-Project1");
    if (!tokenv) {
      res.status(401).send({ status: false, error: "invalid token" });
    }
    let authorId = tokenv["userId"];
    console.log(authorId);
    if (!blog) {
      return res.status(400).send({
        status: false,
        msg: "blogId must be present in order to delete it",
      });
    }
    let blogFound = await blogModel.findOne({ _id: blog });
    if (!blogFound) {
      return res.status(400).send({
        status: false,
        msg: "No blog exists with this Blog Id, please provide another one",
      });
    }
    if (blogFound.authorId != authorId) {
      return res.status(401).send({
        status: false,
        msg: "You are trying to perform an Unauthorized action",
      });
    }
    if (blogFound.isDeleted === true) {
      return res
        .status(404)
        .send({ status: false, msg: "this blog has been deleted by You" });
    }
    let deletedBlog = await blogModel.findOneAndUpdate(
      { _id: blog },
      { $set: { isDeleted: true, isPublished: false, DeletedAt: Date.now() } },
      { new: true, upsert: true }
    );
    return res.status(200).send({
      status: true,
      msg: "Your Blog has been successfully deleted",
      deletedData: deletedBlog,
    });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports.deleteBlog = deleteBlog;

//-----------------delete by querry----------------------------------
const deleteByQuery = async (req, res) => {
  try {
    const queryParams = req.query;
    console.log(queryParams);
    if (queryParams["isPublished"] == "false") {
      queryParams["isPublished"] = false;
    }
    let t = req.headers["x-api-key"];
    let tokenv = jwt.verify(t, "functionup-Project1");
    let authorId = tokenv["userId"];
    if (queryParams.length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter some data in the body" });

    const blog = await blogModel.find({
      $and: [queryParams, { isDeleted: false }],
    });
    blog.forEach((x, i) => {
      if (x.authorId != authorId) {
        blog.splice(i, 1);
      }
    });
    if (blog.length == 0)
      return res.status(404).send({ msg: "Document is already Deleted " });

    const updatedBlog = await blogModel.updateMany(
      queryParams,
      { $set: { isDeleted: true, isPublished: false, deletedAt: Date.now() } },
      { new: true }
    );

    return res.status(200).send({ status: true, data: updatedBlog });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

module.exports.deleteByQuery = deleteByQuery;
module.exports.createAuthor = createAuthor;
module.exports.createBook = createBlog;
module.exports.updateData = updateData;
