import { renderDashboard } from '../dashboard/dashboard.js';
import { renderField } from '../field/field.js';
import { renderQuote } from '../quote/quote.js';
import { renderTax } from '../tax/tax.js';
import { renderMaterial } from '../material/material.js';

const app=document.getElementById('app');
export const state={products:[],panels:[],options:[],sites:[],quotes:[],tax:{sales:[],purchases:[],payments:[],labor:[],cards:[]},materials:[]};
const sampleSites=[
 {id:'s1',name:'여수 OO상가',status:'기계설치',customer:'김OO',phone:'010-0000-0000',manager:'박소장',address:'전남 여수시',amount:18500000,paid:10000000,cost:12300000,pipeStart:'2026-06-24',pipeEnd:'2026-06-25',installStart:'2026-06-28',installEnd:'2026-06-29',memo:'배관 재사용 확인 필요'},
 {id:'s2',name:'순천 푸르지오',status:'선배관',customer:'이OO',phone:'010-1111-2222',manager:'최소장',address:'전남 순천시',amount:32000000,paid:16000000,cost:21000000,pipeStart:'2026-06-26',pipeEnd:'2026-06-27',installStart:'2026-07-02',installEnd:'2026-07-03',memo:'선배관 완료 후 사진 저장'},
 {id:'s3',name:'광양 XX카페',status:'계약완료',customer:'최OO',phone:'010-3333-4444',manager:'',address:'전남 광양시',amount:9800000,paid:3000000,cost:5700000,pipeStart:'',pipeEnd:'',installStart:'2026-06-30',installEnd:'2026-06-30',memo:''}
];
function loadLocal(){state.sites=JSON.parse(localStorage.getItem('raonSites')||'null')||sampleSites;state.quotes=JSON.parse(localStorage.getItem('raonQuotes')||'[]');state.tax=JSON.parse(localStorage.getItem('raonTax')||'null')||{sales:[],purchases:[],payments:[],labor:[],cards:[]};state.materials=JSON.parse(localStorage.getItem('raonMaterials')||'[]');}
export function save(){localStorage.setItem('raonSites',JSON.stringify(state.sites));localStorage.setItem('raonQuotes',JSON.stringify(state.quotes));localStorage.setItem('raonTax',JSON.stringify(state.tax));localStorage.setItem('raonMaterials',JSON.stringify(state.materials));}
export function money(n){return (Number(n)||0).toLocaleString('ko-KR')+'원'}
export function floor1000(n){return Math.floor((Number(n)||0)/1000)*1000}
export function uid(prefix='id'){return prefix+Date.now()+Math.floor(Math.random()*999)}
export function modal(html,onBind){const back=document.createElement('div');back.className='modal-back';back.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(back);back.addEventListener('click',e=>{if(e.target===back)back.remove()});onBind?.(back,()=>back.remove());return back;}
export function byId(id){return document.getElementById(id)}

async function loadData(){loadLocal();const [p,pan,o]=await Promise.all([fetch('/data/product_db.json').then(r=>r.json()),fetch('/data/panel_rules.json').then(r=>r.json()).catch(()=>[]),fetch('/data/option_db.json').then(r=>r.json()).catch(()=>[])]);state.products=p;state.panels=pan;state.options=o;}
function layout(page){app.innerHTML=`<header class="topbar"><div class="brand">RAON E&G ERP v13 Gold</div><nav class="nav">${['dashboard:대시보드','field:현장관리','quote:견적관리','tax:세무관리','material:자재관리','as:AS관리','vendor:협력업체','setting:설정'].map(x=>{const [k,t]=x.split(':');return `<button data-route="${k}" class="${page===k?'active':''}">${t}</button>`}).join('')}</nav></header><main class="wrap" id="view"></main>`;document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>go(b.dataset.route));}
export function go(page='dashboard'){layout(page);const view=byId('view');if(page==='dashboard')renderDashboard(view,state,go);else if(page==='field')renderField(view,state,go);else if(page==='quote')renderQuote(view,state,go);else if(page==='tax')renderTax(view,state,go);else if(page==='material')renderMaterial(view,state,go);else view.innerHTML=`<h1 class="page-title">${page}</h1><div class="card">모듈 준비중입니다.</div>`;}
loadData().then(()=>go('dashboard')).catch(e=>{app.innerHTML='<div class="wrap"><div class="card"><b>DB 로딩 오류</b><br>'+e.message+'</div></div>'});
