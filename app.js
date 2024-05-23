const express=require('express')
const path=require('path')
const app=express();
require('dotenv').config()
const Order=require('./order.js')
const mails=require('./mail')
const port=process.env.PORT ||3000
const hbs=require('hbs');
const auth=require('./auth')
const User = require('./user');
const cookie=require('cookie-parser')
app.use(cookie());
const Product=require('./prod')
const tempurl=path.join(__dirname,'/template/views')
app.set('view engine','hbs')
app.use(express.urlencoded());
app.use(express.json())
app.set('views',tempurl)
const parturl=path.join(__dirname,'/template/partials')
console.log(parturl)
hbs.registerPartials(parturl)

const urll=path.join(__dirname,'/public')
app.use(express.static(urll))


require('./mongoose')
app.get('',async(req,res)=>{

const product=await Product.find({});

res.render('index',{
    notuser:1,
    product:product,
     sr:"http://localhost:3000/avator?id="
})


})



app.get('/signup',(req,res)=>{


res.render('signup',{
    msg:req.query.msg,
    notuser:1,
})


})

app.get('/message',(req,res)=>{

res.render('message',{
    msg:req.query.msg,
    notuser:1
})

})

app.post('/signup/data',async (req,res)=>{
    try{

        if(req.body.password!=req.body.cpassword){
            res.redirect('/signup?msg=Passwords are not matching');
            return;
        }
        
        const user=new User({
            email:req.body.email,
            password:req.body.password,
            active:0,
          
        })
        const tok=await user.genAuthToken();
        user.activeT=tok
mails.sendMailForActivation(tok,user.email);
await user.save();
res.redirect('/message?msg=Mail For activating Your account has been send to your email account')


    }
    catch(e){

        res.redirect('/signup')


    }
})


app.post('/forgot',async (req,res)=>{
    const user=await User.findOne({email:req.body.email})
    const token=await user.genAuthToken();
    mails.sendMailForReset(token,user.email)
    user.activeT=token;
    await user.save();
    res.redirect('/message?msg=Mail for reset your message is sent to your email account')

})
app.get('/passwordreset',async(req,res)=>{

const token=req.query.token
const user =await User.findOne({activeT:token})
if(!user){
    res.redirect('/login')
}


    res.redirect(`/login?reset=1&token=${token}`)
})
app.post('/reset/data',async (req,res)=>{
const user=await User.findOne({activeT:req.query.token})
if(!user){
    res.redirect('/login')
}
user.activeT=undefined
user.password=req.body.password
await user.save()
res.redirect('/login?msg=Password reset successfully')
})
app.get('/login',async(req,res)=>{

    if(req.query.reset){
res.render('login',{
    reset:1,
    token:req.query.token,
    notuser:1
})
        return
    }

if(req.query.forgot){
res.render('login',{
    forgot:1,
    notuser:1
})
return
}



res.render('login',{
    msg:req.query.msg,
    notuser:1,
})

})
const bcrypt=require('bcrypt')
app.post('/login/data',async (req,res)=>{

try{
    console.log(req.body.email,req.body.password)
const user=await User.findOne({email:req.body.email})
console.log('h1')
if(!user)throw new Error()
if(!user.active){
    res.redirect('/message?msg=Please Activate your account first')
    return;
}
console.log('h2')
const match=await bcrypt.compare(req.body.password,user.password)
console.log('h3')
if(!match)throw new Error()
console.log('h4')
const token=await user.genAuthToken();
console.log('h5')
user.tokens=user.tokens.concat({token})
console.log('h6')
res.cookie('jwt',token,()=>{})
console.log('h7')
await user.save()
console.log('h8')
res.redirect('/index')
}
catch(e){
res.redirect('/login?msg=Unable to login')
}


} )
app.get('/activating',async(req,res)=>{
    const token=req.query.token;
    try{
    const user=await User.findOne({activeT:token})
    if(!user){
        res.redirect('/message?msg=Unable to find the user')
    }
user.activeT=undefined
user.active=1;
await user.save()
res.redirect('/message?msg=Your account is activated')


}
catch(e){

}

})
app.get('/index',auth,async(req,res)=>{
const product=await Product.find({})
res.render('index',{
    product:product,
    sr:`http://localhost:3000/avator?id=`
})
})




app.get('/addproduct',auth, async (req,res)=>{
try{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
    }
res.render('getproduct');


}
catch(e){
    res.redirect('/login?msg=Please Login')
    return
}




})

const multer=require('multer');

const upload=multer({
       
    limits:{
        fileSize:10000000
    },
    fileFilter(req,file,cb){

if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
    cb( new Error("upload image either jpg or jpeg or png form"))
}
cb(undefined,true)


    }
})

app.get('/avator',async (req,res)=>{

    try{
const prod=await Product.findById(req.query.id)

res.set('Content-Type','image/jpg')

res.send(prod.img)

    }
    catch(e){
        res.status(404).send(e)
    }
})

app.post('/product/data',upload.single('avator'),auth,async (req,res)=>{
    try{
        console.log(req.file)
      
const prod=new Product({
    name:req.body.name,
    disc:req.body.disc,
    price:req.body.price,
    img:req.file.buffer,
    owner:req.user._id
})
console.log('heelow2')

await prod.save();
console.log('heelow3')
res.redirect('/index')

    }
catch(e){
    console.log(e)
    res.redirect('/login?msg=Please Login')
    return
}
})

app.get('/adminproduct',auth,async(req,res)=>{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
    }
const product=await Product.find({owner:req.user._id})
if(product.length==0){
    res.render('admin',{
       msg:'No products......!'
    })
    return 
}
res.render('admin',{
    product:product,
    src:`http://localhost:3000/avator?id=`
})

})
app.get('/edit',auth,async (req,res)=>{
try{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
    }
res.render('edit',{
    id:req.query.id
})
}
catch(e){
    res.redirect('/adminproduct')
}

})
app.post('/editdata',auth,async(req,res)=>{

try{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
    }

    const update=Object.keys(req.body)
    console.log(update)
const id=req.query.id;
console.log("h1")
const prod=await Product.findById(id)
console.log("h2")
console.log(prod.owner)
console.log(req.user._id)
if(prod.owner.toString()!=req.user._id.toString()){
    throw new Error();
}
console.log("h3")
update.forEach((e)=>{prod[e]=req.body[e]||prod[e]})
console.log("h4")
await prod.save();
res.redirect('/adminproduct')
}
catch(e){
    res.redirect('/adminproduct')
}


})
app.get('/logout',auth,async(req,res)=>{

try{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
    }
    req.user.tokens=req.user.tokens.filter((e)=>e.token!=req.token)
    await req.user.save()
res.redirect('/')
}
catch(e){
    res.redirect('/login?msg=Please login')
    return
}


})
app.get('/cart',auth,async(req,res)=>{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
        
    }
let id=req.query.id


if(id!=undefined){
    const prod1=await Product.findById(id)

id=prod1._id
console.log(id)
console.log('hellow1')
let vv=0;
const hai=req.user.carts.find((e)=>{

if(id.equals(e.cid)){
let val=e.no
val=val+1
console.log('hellow2')
vv=1;
e.no=val
return true

}

return undefined

})
console.log(hai)
if(!vv){
req.user.carts=req.user.carts.concat({cid:id,no:1})
console.log('hellow3')}
console.log('hellow4')
await req.user.save();
}
let product=[]
let rem=[]
let price=0
  req.user.carts.forEach( async (e)=>{
    console.log(e.cid)
    console.log(e.no)
const prod=  await Product.findById(e.cid)
if(prod==undefined){
    rem.push(e.cid)
    return
}
const mon=prod.price * e.no;
price+=mon
  product.push({
name:prod.name,
price:prod.price,
tot:mon,
_id:prod._id,
owner:prod.owner,
disc:prod.disc,
    no:e.no
})

})
req.user.carts=req.user.carts.filter((e)=>{

let ss=rem.length
for(i=0;i<ss;i++){
    if(rem[i].equals(e.cid))return 0;
}
return 1;

})


if(req.user.carts.length==0){
    res.render('cart',{
        msg:'Your cart is empty!'
    })   
    return
}


await req.user.save();
 res.render('cart',{
    product:product,
    price:price
})
})

app.get('/delete',auth,async(req,res)=>{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
    }
const prod=await Product.findById(req.query.id)
const idd=prod._id
req.user.carts=req.user.carts.filter((e)=>{return !e.cid.equals(idd)})
await req.user.save();
res.redirect('/cart')

})
app.get('/del',auth,async(req,res)=>{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
    }
    const id=req.query.id;
const prod=await Product.findById(id);
if(prod.owner.equals(req.user._id)){
    await prod.remove();
}
res.redirect('/adminproduct')

})


const stripe=require('stripe')(process.env.stripeAPI)

app.post('/payment',auth, async(req,res)=>{
    if(!req.user){
        res.redirect('/login?msg=Please Login')
    }
console.log('h1')
let product=[]
const ll=req.user.carts.length
for(i=0;i<ll;i++){
    const e=req.user.carts[i]
    const prod=  await Product.findById(e.cid)
   
   if(prod==undefined)continue
    const mon=prod.price * e.no;

      product.push({
    name:prod.name,
    price:prod.price,
    tot:mon,
    _id:prod._id,
    owner:prod.owner,
    disc:prod.disc,
        no:e.no
    })
}
  
    console.log(product)
const linee= product.map(   (e)=>{
     
    return {
        price_data:{
            currency:'INR',
            product_data:{
                name:e.name
            },
            unit_amount:e.price
        },
        quantity:e.no
    }
})
console.log(linee)
const session= await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode:'payment',
    line_items:linee,
    
    success_url:`http://localhost:3000/success`,
    cancel_url:'http://localhost:3000/cancel',
   
})
console.log('h4')
console.log(session)
console.log(session.url)
res.json({url:session.url})




})

app.get('/success',auth,async(req,res)=>{
try{
    if(!req.user){
        res.redirect('/login?msg=PLease Login')
        return
    }
    let product=[]
    const ll=req.user.carts.length
    for(i=0;i<ll;i++){
        const e=req.user.carts[i]
        const prod=  await Product.findById(e.cid)
       
       if(prod==undefined)continue
        const mon=prod.price * e.no;
    
          product.push({
        name:prod.name,
        price:prod.price,
        tot:mon,
        _id:prod._id,
        owner:prod.owner,
        disc:prod.disc,
            no:e.no
        })
    }
    console.log(product)
    req.user.carts=[];
const order=new Order({
    userData:{
        email:req.user.email,
        owner:req.user._id

},
products:product

})


req.user.carts=[];
await order.save()
await req.user.save()
res.redirect('/order')

}
catch(e){

}


})
app.get('/order',auth,async(req,res)=>{
try{

    const order=await Order.find({'userData.owner':req.user._id})
    console.log('start')
console.log(order)
//const product=order[0].products
/*
let product=[]
 for(i=0;i<order.length;i++){

    product.push({
        email:order[i].userData.email,
        id:order[i].id,


    })


 }*/

 if(order.length==0){
    res.render('order',{
        msg:'Nothing is Ordered !'
    })
    return
    }
 

res.render('order',{
    order:order
})
}
catch(e){

}

})

const PDFDocument = require('pdfkit');
const fs=require('fs')
app.get('/invoice',auth,async(req,res)=>{
try{



    const order=await Order.findById(req.query.id)
if(!order.userData.owner.equals(req.user._id)){
    throw new Error()
}


//---------------
const invoiceName = 'invoice-' + order._id + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);
      const pdfDoc= new PDFDocument();
      console.log(invoiceName);
      console.log(invoicePath);
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','inline;filename=" ' + invoiceName +'" ');

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text(`INVOICE`,{underline:true});
      pdfDoc.text('---------------------------');
      let totalPrice = 0;
      order.products.forEach(prod =>{
         totalPrice += prod.price * prod.no;
         pdfDoc.fontSize(16).text( prod.name + ' - ' + prod.no + ' X ' + 'Rs.'+ prod.price);
      });

      pdfDoc.text('---------------------------');
      
    
      pdfDoc.fontSize(20).text('TOTALPRICE' + ' - ' + totalPrice);
      pdfDoc.end();
}
catch(e){
res.redirect('/login?msg=Please login')
}
})

app.listen(port,()=>{
    console.log('Server is on ' , port)
})