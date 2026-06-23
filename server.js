const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({limit:'20mb'}));
app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(req,res)=>res.json({ok:true,version:'11.0.1-light-ui'}));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`RAON ERP v11.0.1 Light UI running on port ${PORT}`));
