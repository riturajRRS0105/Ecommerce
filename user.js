require('./mongoose')
const mongoose=require('mongoose')





const userSchema=new mongoose.Schema({

email:{
 type:String,
 trim:true,
    required:true,
    unique:true
},
password:{
    type:String,
    required:true,
},
activeT:{
    type:String
},
active:{
    type:Boolean
},
tokens:[{
    token:{
        type:String
    }
}],
carts:[{
    cid:{
        type:mongoose.Schema.Types.ObjectId,

    },
    no:{
        type:Number
    }
}]


})


const bcrypt=require('bcrypt') 


userSchema.pre('save',async function(next){

const user=this
if(user.isModified('password'))
user.password=await bcrypt.hash(user.password,8)

next()
})
const jwt=require('jsonwebtoken')
userSchema.methods.genAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id},'thisismehellowbabyyo')

    return token

}



const User=mongoose.model('user',userSchema)
module.exports=User