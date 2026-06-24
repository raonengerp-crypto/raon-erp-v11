const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'raon-data-local.json');
const DATA_BUCKET = process.env.SUPABASE_DATA_BUCKET || 'schedule';
const DATA_KEY = 'db/raon-v12-data.json';

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

const emptyData = () => ({
  version: '12.0.0',
  updatedAt: new Date().toISOString(),
  sites: [], schedules: [], quotes: [], payments: [], expenses: [], materials: [], labor: [], asLogs: [], vendors: [], employees: [], files: []
});

async function readData(){
  if(supabase){
    try{
      const { data, error } = await supabase.storage.from(DATA_BUCKET).download(DATA_KEY);
      if(error) throw error;
      const txt = await data.text();
      return JSON.parse(txt);
    }catch(e){
      const base = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE,'utf8')) : seedData();
      await writeData(base);
      return base;
    }
  }
  if(fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));
  const base = seedData(); fs.writeFileSync(DATA_FILE, JSON.stringify(base,null,2)); return base;
}

async function writeData(data){
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2));
  if(supabase){
    const body = Buffer.from(JSON.stringify(data,null,2));
    const { error } = await supabase.storage.from(DATA_BUCKET).upload(DATA_KEY, body, { contentType:'application/json', upsert:true });
    if(error) throw error;
  }
  return data;
}

function uid(prefix='id'){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
function seedData(){
  const d = emptyData();
  d.sites = [
    {id:'site_1', name:'순천 신대지구 상가 신축공사', customer:'(주)신대상가개발', manager:'안수원', phone:'010-1234-5678', foreman:'김현장 소장', foremanPhone:'010-9876-5432', status:'기계설치', contractAmount:120000000, paidAmount:80000000, receivable:37000000, startDate:'2024-05-01', installDate:'2024-06-25', note:'선배관 작업 시 우천 대비 필요', files:[]},
    {id:'site_2', name:'여수 OO상가 리모델링', customer:'OO건설(주)', manager:'김현장', phone:'010-2222-3333', foreman:'박소장', foremanPhone:'010-3333-4444', status:'현장점검', contractAmount:85000000, paidAmount:73000000, receivable:12000000, startDate:'2024-06-01', installDate:'2024-06-30', note:'중간 점검 필요', files:[]}
  ];
  d.schedules = [
    {id:'sch_1', siteId:'site_1', siteName:'순천 신대지구 상가 신축공사', type:'기계설치', date:'2024-06-27', time:'09:00', memo:'기계설치 점검', customerPhone:'010-1234-5678', foremanPhone:'010-9876-5432', status:'예정', photos:[]},
    {id:'sch_2', siteId:'site_2', siteName:'여수 OO상가 리모델링', type:'현장방문', date:'2024-06-29', time:'11:00', memo:'리모델링 중간 점검', customerPhone:'010-2222-3333', foremanPhone:'010-3333-4444', status:'예정', photos:[]}
  ];
  d.payments = [{id:'pay_1', siteId:'site_1', siteName:'순천 신대지구 상가 신축공사', date:'2024-06-07', amount:10000000, payer:'(주)신대상가개발', memo:'계약금'}];
  d.expenses = [{id:'exp_1', siteId:'site_1', siteName:'순천 신대지구 상가 신축공사', date:'2024-06-07', category:'자재비', detail:'동배관 15/9 30M', amount:3100000, vendor:'OO자재상'}];
  d.quotes = [{id:'quo_1', siteName:'순천 신대지구 상가 신축공사', customer:'(주)신대상가개발', date:'2024-06-20', status:'견적확정', total:23980000, items:[{section:'A', name:'LG MULTI V S', qty:1, price:4800000}]}];
  d.vendors = [{id:'ven_1', name:'OO자재상', type:'자재상', manager:'김자재', phone:'010-5555-1111', bank:'국민은행', account:'123456-01-123456', holder:'OO자재상', bizFile:null}];
  d.employees = [{id:'emp_1', name:'안수원', phone:'010-0000-0000', role:'관리자', address:'순천', birth:'', safetyFile:null}];
  return d;
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.get('/api/health', (req,res)=>res.json({ok:true, version:'12.0.0', supabase: !!supabase}));
app.get('/api/data', async (req,res)=>{ try{ res.json(await readData()); } catch(e){ res.status(500).json({error:e.message}); }});
app.post('/api/data', async (req,res)=>{ try{ res.json(await writeData(req.body)); } catch(e){ res.status(500).json({error:e.message}); }});

app.post('/api/upload/:bucket', upload.single('file'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({error:'파일이 없습니다.'});
    const bucket = req.params.bucket;
    const safe = Buffer.from(req.file.originalname, 'latin1').toString('utf8').replace(/[\\/]/g,'_');
    const key = `${new Date().toISOString().slice(0,10)}/${Date.now()}_${safe}`;
    if(supabase){
      const { error } = await supabase.storage.from(bucket).upload(key, req.file.buffer, { contentType: req.file.mimetype, upsert:false });
      if(error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(key);
      return res.json({ bucket, key, url: data.publicUrl, name: safe, mime: req.file.mimetype, size: req.file.size });
    }
    const dir = path.join(__dirname, 'public', 'uploads', bucket, path.dirname(key));
    fs.mkdirSync(dir, {recursive:true});
    const localPath = path.join(__dirname, 'public', 'uploads', bucket, key);
    fs.writeFileSync(localPath, req.file.buffer);
    res.json({ bucket, key, url:`/uploads/${bucket}/${key}`, name:safe, mime:req.file.mimetype, size:req.file.size });
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.get('*', (req,res)=>res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log(`RAON E&G ERP v12 production running on port ${PORT}`));
