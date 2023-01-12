
const mongoose=require('mongoose')
const AuthSchema=new mongoose.Schema({
    fname: { 
        type:String,
        required:true,
        trim:true
    },
     lname: {
        type:String,
        required:true,
        trim:true
    }, 
     title: {
        type:String,
        required:true, 
        enum:['Mr', 'Mrs', 'Miss'],
        trim:true
    }, 
     email: {
        type: String,
        trim: true,
        unique:true,

        
    }, 
password: {type:String,required:true,trim:true} 
})

module.exports=mongoose.model('Project1Author',AuthSchema)