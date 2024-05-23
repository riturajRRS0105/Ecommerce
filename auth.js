const cookieparser=require('cookie-parser');
const User = require('./user');
const jwt=require('jsonwebtoken')
const auth=async (req,res,next)=>{
    try{
const token=req.cookies.jwt;
if(!token){
    throw new Error();
    next()
    return;
}
const data=jwt.verify(token,'thisismehellowbabyyo')
const user=await User.findOne({_id:data._id,'tokens.token':token})

if(!user){
    throw new Error();
    next();
    return 
}
req.user=user
req.token=token

next();}
catch(e){
    next()
}
}
module.exports=auth;