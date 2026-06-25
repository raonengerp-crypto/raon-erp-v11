const express=require('express');
const path=require('path');
const app=express();
const PORT=process.env.PORT||10000;
app.use(express.json({limit:'10mb'}));
app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(req,res)=>res.json({ok:true,version:'12.4.2'}));
app.listen(PORT,()=>console.log(`RAON ERP v12 master recovered all modules 12.4.2 running on port ${PORT}`));
