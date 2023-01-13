const express = require('express');
const blogController=require('../controllers/blogController')
const router = express.Router();
const authController=require('../Controllers/authorController')
const { find } = require('../Models/BlogsModel');
const  auth=require("../middlewares/authentication");
//----------routes------------------------------------

router.post('/authors', authController.createAuthor)
router.post('/blogs',auth.mid1,blogController.createBlog)
router.get('/blogs', auth.mid1, blogController.getBlogData)
router.post('/login',authController.login)
router.put("/blogs/:blogId",auth.mid1,blogController.updateData)
router.delete("/blogs/:blogId",auth.mid1,blogController.deleteBlog)
router.delete("/blogs",auth.mid1,blogController.deleteByQuery)
router.all('/*',function(req,res){
    res.status(400).send({msg:"invalid request"})
})
module.exports=router