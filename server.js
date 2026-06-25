const express=require('express');
const path=require('path');
const app=express();
const PORT=process.env.PORT||10000;
app.use(express.json({limit:'25mb'}));
app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(req,res)=>res.json({ok:true,version:'12.6.0'}));
app.listen(PORT,()=>console.log('RAON ERP v12 quote master inserted 12.6.0 running on port '+PORT));
