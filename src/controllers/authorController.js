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








