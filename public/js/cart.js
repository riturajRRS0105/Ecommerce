document.querySelector(".bbtt").addEventListener('click',function (){

fetch("/payment",{
method:'POST',
headers:{
    'Content-Type':'application/json'
},



}).then((res)=>{return res.json()}).then(({url})=>{
    console.log(url)
    window.location=url
}).catch((e)=>{console.log(e)})



})