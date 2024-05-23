const sgMail=require('@sendgrid/mail');
const { default: isEmail } = require('validator/lib/isEmail');


sgMail.setApiKey(process.env.SGAPI);


const sendMailForActivation=(token,email)=>{

sgMail.send({


to:email,
from:'prashantbhalla2016@gmail.com',
subject:"Activating the account",
html:`<h1>For Activating your account in Fitness Freak <a href=${`http://localhost:3000/activating?token=${token}`} >Click Here</a></h1>`



})


}
const sendMailForReset=(token,email)=>{
    sgMail.send({
        to:email,
from:'prashantbhalla2016@gmail.com',
subject:'Forgot password',

html:`<h1> For Resting your password <a href=${`http://localhost:3000/passwordreset?token=${token}`} >Click here</a> </h1>`
 

    
            })
        
}


module.exports={
    sendMailForActivation,
    sendMailForReset,
}