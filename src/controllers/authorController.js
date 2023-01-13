const blogModel = require("../Models/BlogsModel");
const authorModel = require("../Models/AuthorModel");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const ObjectId = mongoose.Types.ObjectId;
const e = require("express");
const { findOneAndUpdate } = require("../Models/BlogsModel");

//--------------------------------------------validations-------------------


const isValidName = function (name) {
  const fnameRegex = /^[A-Za-z]+$/;
  return fnameRegex.test(name.trim());
};

const isValidFullName = function (fullname) {
  let x=fullname.split('')
  x.forEach((y,i)=>{
      if(y==" "){
          x.splice(i,1)
      }
  })
  let reName=x.join('')
  const fnameRegex = /^[A-Za-z]+$/ ;
  return fnameRegex.test(reName.trim());
  
}


const isValidPassword = function (password) {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};




const isValidEmail = function (email) {
  const emailRegex =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i
  return emailRegex.test(email);
};
//-----------------------------------------------END-----------------------

//------------------------------------create author with valid details-----------------------

const createAuthor = async function (req, res) {
  try {
    let data = req.body;
    let { fname, lname, title, email, password } = data;
    let filteremail = await authorModel.findOne({ email: email });

    if (Object.keys(data).length > 0) {
      if (fname.trim() == "" || fname == undefined) {
        res.status(400).send({ status: false, error: "plese provide fname" });
      } else if (!isValidName(fname.trim())) {
        res
          .status(400)
          .send({ status: false, error: "plese provide valid fname" });
      } else if (lname.trim() == "" || lname == undefined) {
        res.status(400).send({ status: false, error: "plese provide lname" });
      } else if (!isValidName(lname.trim())) {
        res
          .status(400)
          .send({ status: false, error: "plese provide valid lname" });
     
        } else if (email.trim() == "" || email == null) {
        res.status(400).send({ status: false, error: "plese provide email" });

      } else if (!isValidEmail(email.trim())) {
        res.status(400).send({ status: false, msg: "plese enter valid email" });
      } else if (filteremail) {
        res
          .status(400)
          .send({ status: false, msg: "this emailid is already registered" });
      } else if (title == undefined || title.trim() == "") {
        res.status(400).send({ status: false, error: "plese provide title" });
      } else if (
        !(
          title.trim() == "Mr" ||
          title.trim() == "Ms" ||
          title.trim() == "Miss"
        )
      ) {
        res
          .status(400)
          .send({ status: false, error: "plese provide valid title" });
      } else if (password == undefined || password == "") {
        res
          .status(400)
          .send({ status: false, error: "plese provide password" });
      } else if (!isValidPassword(password)) {
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
    }else{
      res.status(400).send({status:false,message:"plese enter some data....."})
    }
  } catch (err) {
    res.status(400).send({ status: false, msg: err.message });
  }
};


module.exports.createAuthor = createAuthor;
//----------------------------------------END------------------------------------------------



//-------------------------------------------login-----------------------------------------

const login = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;
    if (Object.keys(data).length==0) {
      return res
        .status(400)
        .send({ status: false, msg: "enter data for logging in" });
    } else if (email == undefined || email == "") {
     return res
        .status(400)
        .send({ status: false, msg: "email is requied for validation" });
    } else if (!isValidEmail(email)) {
      return res.status(400).send({ status: false, msg: "plese enter valid email" });

    } else if (password == undefined || password == "") {
      return res
        .status(400)
        .send({ status: false, msg: "password is requied for validation" });
    } else if (!isValidPassword(password)) {
     return  res
        .status(400)
        .send({ status: false, msg: "plese enter valid password" });
    } else if (Object.keys(data).length > 2) {
      res.status(400).send({
        status: false,
        msg: "plese check your details ones there is some invalid attribute",
      });
    } else {
      let verifyDetails = await authorModel.findOne(data);
      console.log(verifyDetails);
      if (verifyDetails == null) {
        res.status(400).send({
          status: false,
          msg: "you dont have an account / entered invalid credentials",
        });
      } else {
        let id = verifyDetails["_id"];
        console.log(id);
        let createToken = jwt.sign({ userId: id }, "functionup-Project1");
        res.header("x-api-key", createToken);
       return res.status(200).send({ status: true, data: createToken });
      }
    }
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports.login = login;

//------------------------------END---------------------------------------------------------------








//------------------------------------------create a blog if authorId is valid----------------------------------------
const createBlog = async function (req, res) {
  try {
    let data1 = req.body;
    if(Object.keys(data1).length==0){
      return res.status(400).send({status:false,msg:"plese eneter some data in order to create"})
    }
    let authorId=req.body["authorId"]
    if(authorId==undefined || authorId.trim()==""){
      return res.status(400).send({status:false,msg:"authorId is manditory feild"})
    }
    let x=req.headers['x-api-key']
    let tokenv=jwt.verify(x,"functionup-Project1")
    if(!(authorId==tokenv["userId"])){
      return res.status(403).send({status:false,msg:"you are not authenthorized to create blog with this authorId"})
    }
    
let {title,body,category,tags,subcategory}=data1
    // let data2 = ObjectId(data1["authorId"]);
    // let book = await authorModel.findOne({ _id: data2 });

    if (title == undefined || title.trim() == "") {
      res
      .status(400)
      .send({ status: false, error: "plese enter title" });
    }else if(!isValidFullName(title.trim())){
      res
      .status(400)
      .send({ status: false, error: "plese enter a valid name" });

    
    } else if (body == undefined || body.trim() == "") {
      res
      .status(400)
      .send({ status: false, error: "plese enter body" });
    } else if (category == undefined || category.trim() == "") {
      res
      .status(400)
      .send({ status: false, error: "plese enter category" });
    } else if (subcategory == undefined) {
      res
      .status(400)
      .send({ status: false, error: "plese enter subcategory" });
    } else if (tags == undefined || tags.length==0 || tags[0].trim()=="" ) {
      res
      .status(400)
      .send({ status: false, error: "plese enter tags" });

    }else if (subcategory == undefined || subcategory.length==0 || subcategory[0].trim()=="" ) {
      res
      .status(400)
      .send({ status: false, error: "plese enter subcategory" });
    } else {
        data1["title"] = title.trim();
        data1["body"] = body.trim();
        data1["category"] = category.trim();
      let books = await blogModel.create(data1);
      res.status(201).send({ status: true, data: books });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
//---------------------------------END-------------------------------------------------

//----------------------------update blog data for given blogId in path params-------------------------------------
const updateData = async function (req, res) {
  try {
    let head = req.headers["x-api-key"];
    let tokenx = jwt.verify(head, "functionup-Project1");
   
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
        let { title, body, tags, category, subcategory } = params;
        let checkArr = ["title", "body", "tags", "category", "subcategory"];

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
              $push: { tags: tags, subcategory: subcategory },
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
        return res.status(401).send({
          status: false,
          msg: "authenticatin failed!",
        });
      }
    } else {
      return res.status(400).send({
        status: false,
        msg: "incorrect blogId recheck it",
      });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
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
    let ar=[]
    blog.forEach((x,i) => {
      if (x["authorId"] != authorId) {
        ar.push(x)
        blog.splice(i, 1);
      }
    });
    console.log(ar)
    console.log("------------------------blogs-------------------")
    console.log(blog)

    if (blog.length == 0)
      return res.status(404).send({ msg: "Document is already Deleted " });
      queryParams["authorId"]=authorId
      console.log(queryParams)
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

module.exports.createBook = createBlog;
module.exports.updateData = updateData;
