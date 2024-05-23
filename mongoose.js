const mongoose=require('mongoose')

mongoose.connect(process.env.MONGOURL,{
    useNewUrlParser:true,
    
})