//const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const mid1 = async function (req, res, next) {
  try {
  let token=req.headers["x-api-key"]
  if(token==undefined){
    return res.status(403).send({status:false,msg:"autentication token missing"})
  }
  jwt.verify(token,"functionup-Project1",function(err,decoded){
    if(err){
     return res.status(400).send({status:false,msg:err.message})
    }else{
      return next()
    }
  })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports.mid1 = mid1;
