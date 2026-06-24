const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({limit:'25mb'}));
app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(req,res)=>res.json({ok:true,version:'12.2.0-full-preview'}));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`RAON ERP v12 full preview running on port ${PORT}`));
