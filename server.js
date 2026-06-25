import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename=fileURLToPath(import.meta.url); const __dirname=path.dirname(__filename);
const app=express(); const PORT=process.env.PORT||10000;
app.use(express.json({limit:'10mb'}));
app.use(express.static(path.join(__dirname,'public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`RAON ERP v13 modular base running on port ${PORT}`));
