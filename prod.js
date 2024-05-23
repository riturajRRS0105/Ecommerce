const mongoose =require('mongoose')

const prodSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        trim:true,
        required:true
    },
    img:{
        type:Buffer,
       
    },
    disc:{
        type:String
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true

    }



})


const Product=mongoose.model('Prod',prodSchema)
module.exports=Product