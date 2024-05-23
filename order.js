const mongoose=require('mongoose')


const orderSchema=new mongoose.Schema({
    userData:{
        email:{
            type:String
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId
        }
    },
    products:[{
        
            type:Object,
            
            }],
})

const Order=mongoose.model('order',orderSchema)

module.exports=Order