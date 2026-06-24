const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const store = { sites: [], schedules: [] };
async function readJson(bucket, key, fallback) {
  if (!supabase) return fallback;
  try {
    const { data, error } = await supabase.storage.from(bucket).download(key);
    if (error) return fallback;
    return JSON.parse(await data.text());
  } catch (e) { return fallback; }
}
async function writeJson(bucket, key, data) {
  if (!supabase) return false;
  const body = Buffer.from(JSON.stringify(data, null, 2));
  const { error } = await supabase.storage.from(bucket).upload(key, body, { contentType: 'application/json', upsert: true });
  return !error;
}
async function loadAll() {
  store.sites = await readJson('sites', 'data/sites.json', store.sites);
  store.schedules = await readJson('schedule', 'data/schedules.json', store.schedules);
}
async function persistAll() {
  await writeJson('sites', 'data/sites.json', store.sites);
  await writeJson('schedule', 'data/schedules.json', store.schedules);
}
function uid(prefix='id') { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); }
function toNumber(v){ return Number(String(v||'').replace(/[^0-9.-]/g,'')) || 0; }
function makeSchedulesFromSite(site) {
  const out = [];
  const add = (kind, start, end) => {
    if (!start) return;
    out.push({
      id: uid('sch'), siteId: site.id, siteName: site.name,
      type: kind, status: '예정', startDate: start, endDate: end || start,
      time: '09:00', title: `${site.name} ${kind}`, memo: site.memo || '',
      customerPhone: site.customerPhone || '', managerPhone: site.managerPhone || '', files: []
    });
  };
  add('선배관', site.pipeStart, site.pipeEnd);
  add('기계설치', site.machineStart, site.machineEnd);
  return out;
}
app.get('/api/health', (req,res)=>res.json({ok:true, supabase: !!supabase, version:'v12-field-production'}));
app.get('/api/sites', async (req,res)=>{ await loadAll(); res.json(store.sites); });
app.get('/api/schedules', async (req,res)=>{ await loadAll(); res.json(store.schedules); });
app.post('/api/sites', async (req,res)=>{
  await loadAll();
  const b = req.body || {};
  const id = b.id || uid('site');
  const site = { ...b, id, updatedAt: new Date().toISOString() };
  site.contractAmount = toNumber(site.contractAmount);
  site.equipmentCost = toNumber(site.equipmentCost);
  site.depositPaid = toNumber(site.depositPaid);
  site.discount = toNumber(site.discount);
  site.materialCost = toNumber(site.materialCost);
  site.laborCost = toNumber(site.laborCost);
  site.liftCost = toNumber(site.liftCost);
  site.outsourceCost = toNumber(site.outsourceCost);
  site.etcCost = toNumber(site.etcCost);
  site.totalCost = site.equipmentCost + site.materialCost + site.laborCost + site.liftCost + site.outsourceCost + site.etcCost;
  site.receivedAmount = site.depositPaid;
  site.balance = Math.max(0, site.contractAmount - site.receivedAmount - site.discount);
  site.profit = site.contractAmount - site.discount - site.totalCost;
  const idx = store.sites.findIndex(x=>x.id===id);
  if (idx >= 0) store.sites[idx] = site; else store.sites.unshift(site);
  store.schedules = store.schedules.filter(s => s.siteId !== id || (s.manual === true));
  store.schedules.unshift(...makeSchedulesFromSite(site));
  await persistAll();
  res.json({ok:true, site, schedules: store.schedules.filter(s=>s.siteId===id)});
});
app.delete('/api/sites/:id', async (req,res)=>{
  await loadAll();
  store.sites = store.sites.filter(x=>x.id!==req.params.id);
  store.schedules = store.schedules.filter(x=>x.siteId!==req.params.id);
  await persistAll();
  res.json({ok:true});
});
app.post('/api/upload/:bucket', upload.array('files'), async (req,res)=>{
  if (!supabase) return res.status(500).json({ok:false, message:'Supabase 환경변수가 설정되지 않았습니다.'});
  const bucket = req.params.bucket;
  const files = [];
  for (const f of req.files || []) {
    const safe = Buffer.from(f.originalname, 'latin1').toString('utf8').replace(/[\\/]/g,'_');
    const key = `${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safe}`;
    const { error } = await supabase.storage.from(bucket).upload(key, f.buffer, { contentType: f.mimetype, upsert: true });
    if (error) return res.status(500).json({ok:false, message:error.message});
    const { data } = supabase.storage.from(bucket).getPublicUrl(key);
    files.push({ name: safe, url: data.publicUrl, bucket, key, type: f.mimetype });
  }
  res.json({ok:true, files});
});
app.get('*', (req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT, ()=> console.log(`RAON ERP v12 field production running on port ${PORT}`));
