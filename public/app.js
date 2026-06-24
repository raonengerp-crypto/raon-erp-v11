const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const fmt = n => (Number(n)||0).toLocaleString('ko-KR');
const today = new Date('2024-06-24');
let DB = null;
let current = 'dashboard';
let currentMonth = new Date('2024-06-01');
const colors = { '기계설치':'blue','선배관':'green','현장방문':'green','자재입고':'orange','AS':'purple','AS 방문':'purple','개인일정':'orange' };

function inRange(ds, start, end){
  if(!start) return false;
  const a=start, b=end||start;
  return ds>=a && ds<=b;
}
function eventsForDate(ds){
  const out=[];
  DB.schedules.forEach(e=>{
    if(e.date===ds) out.push(e);
    if(inRange(ds,e.pipeStart,e.pipeEnd)) out.push({...e, type:'선배관', _range:true});
    if(inRange(ds,e.installStart,e.installEnd)) out.push({...e, type:'기계설치', _range:true});
  });
  const seen=new Set();
  return out.filter(e=>{ const k=e.id+'|'+e.type+'|'+(e.date===ds?'base':'range'); if(seen.has(k)) return false; seen.add(k); return true; });
}

async function api(path, opts={}){
  const r = await fetch(path, opts);
  let j = null;
  try { j = await r.json(); } catch(e) { j = { error: await r.text() }; }
  if(!r.ok) throw new Error(j.error || `서버 오류 ${r.status}`);
  return j;
}
function normalizeDB(d){
  const keys=['sites','schedules','quotes','payments','expenses','materials','labor','asLogs','vendors','employees','files'];
  d = d && typeof d === 'object' ? d : {};
  keys.forEach(k=>{ if(!Array.isArray(d[k])) d[k]=[]; });
  return d;
}
async function load(){ DB = normalizeDB(await api('/api/data')); render(); }
async function save(){ DB = normalizeDB(await api('/api/data', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(DB)})); render(); return DB; }
function id(p){ return `${p}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }
function route(name){ current=name; render(); window.scrollTo(0,0); }

function shell(content){
  document.body.classList.add('compact');
  return `<header class="top"><div class="brand"><div class="mark">R</div>RAON E&G ERP</div><div class="title">${pageTitle()}</div><nav class="topnav">
  <button class="navbtn" onclick="route('schedule')">📅 일정관리</button><button class="navbtn" onclick="route('security')">🛡 보안센터</button><button class="navbtn" onclick="route('company')">🏢 회사정보</button><button class="navbtn" onclick="route('employees')">👥 직원관리</button><div class="profile"><div class="avatar">👤</div><b>관리자</b><span class="small">최고관리자</span></div><button class="navbtn" onclick="toggleDrawer()">☰</button></nav></header>${content}<div class="drawer" id="drawer"><h3>빠른 메뉴</h3>${['dashboard:대시보드','sites:현장관리','quotes:견적관리','tax:세무관리','schedule:일정관리','materials:자재관리','labor:인건비관리','as:AS관리','vendors:협력업체','employees:직원관리'].map(x=>{let [k,v]=x.split(':');return `<a onclick="route('${k}');toggleDrawer(false)">${v}</a>`}).join('')}</div><footer class="footer">RAON E&G ERP v12 · © 2026 RAON E&G</footer>`;
}
function pageTitle(){ return ({dashboard:'대시보드',sites:'현장관리',quotes:'견적관리',tax:'세무관리',schedule:'일정관리',materials:'자재관리',labor:'인건비관리',as:'AS관리',vendors:'협력업체',employees:'직원관리',security:'보안센터',company:'회사정보'})[current]||'대시보드'; }
function toggleDrawer(force){ $('#drawer')?.classList.toggle('show', force); }

function render(){
  const app = $('#app');
  const view = ({dashboard:dashboard, schedule:schedulePage, sites:sitesPage, quotes:quotesPage, tax:taxPage, materials:genericPage('자재관리','현장별 자재 주문/구매내역을 관리합니다.','materials'), labor:genericPage('인건비관리','직원/일당/엔지니어별 인건비를 등록합니다.','labor'), as:asPage, vendors:vendorsPage, employees:employeesPage, security:staticPage('보안센터'), company:staticPage('회사정보')})[current] || dashboard;
  app.innerHTML = shell(view());
}
function kpis(){
  const active = DB.sites.filter(s=>s.status!=='완료').length;
  const todayCnt = eventsForDate('2024-06-24').length;
  const receivable = DB.sites.reduce((a,s)=>a+(+s.receivable||Math.max(0,(+s.contractAmount||0)-(+s.paidAmount||0))),0);
  const due = DB.sites.reduce((a,s)=>a+(s.receivable? Math.min(+s.receivable, 19250000):0),0) || 19250000;
  return {active,todayCnt,receivable,due};
}
function dashboard(){ const k=kpis(); return `<main class="layout"><section class="hello"><h1>안녕하세요, 관리자님! 👋</h1><p>오늘도 모든 현장을 한눈에 확인하세요.</p></section><section class="grid kpi">
${kCard('진행 현장',`${k.active} 개`,'전체 현장','🏢','현장관리 바로가기 →','sites','blue')}
${kCard('오늘 일정',`${k.todayCnt} 건`,'예정된 일정','🗓️','일정관리 바로가기 →','schedule','green')}
${kCard('미수금',`${fmt(k.receivable)} 원`,'전체 미수금','📄','세무관리에서 확인 →','tax','orange')}
${kCard('입금 예정',`${fmt(k.due)} 원`,'7일 이내 입금 예정','💳','입금관리 바로가기 →','tax','purple')}
</section><section class="grid main"><div class="card section"><div class="section-head"><h2>오늘 일정 (2024년 6월)</h2><div class="tools"><button class="ghost">오늘</button><button class="ghost" onclick="moveMonth(-1)">‹</button><button class="ghost" onclick="moveMonth(1)">›</button><button class="primary" onclick="openScheduleModal()">일정 등록</button></div></div>${calendar('dashboard')}</div><aside class="sidecol"><div class="card section"><h2>입금 현황</h2>${paymentTable()}</div><div class="card section"><h2>현장 상태 요약</h2>${donut()}</div></aside></section><section class="grid bottom"><div class="card section"><h2>계약 / 입금 현황</h2><div class="quick">${['계약 등록','입금 등록','입금 내역','미수금 조회','계약 현황','입금 예정 조회','영수증 관리','입금 알림'].map(x=>`<button class="qbtn" onclick="route('tax')">${x}</button>`).join('')}</div></div><div class="card section"><h2>비용 / 손익 현황</h2><div class="quick">${['비용 등록','비용 내역','손익 현황','현장별 손익','비용 분류 관리','예산 관리','손익 보고서','차트 보고서'].map(x=>`<button class="qbtn" onclick="route('tax')">${x}</button>`).join('')}</div></div></section>${scheduleModal()}</main>`; }
function kCard(t,n,s,ic,link,to,c){return `<div class="card kcard"><div><h3>${t}</h3><div class="num ${c==='orange'?'orange':c==='purple'?'purple':''}">${n}</div><div class="small">${s}</div><span onclick="route('${to}')" class="link">${link}</span></div><div class="roundicon">${ic}</div></div>`}
function calendar(mode='full'){
  const y=currentMonth.getFullYear(), m=currentMonth.getMonth();
  const first = new Date(y,m,1); const start = new Date(first); start.setDate(1-first.getDay());
  let html='<div class="cal">'+['일','월','화','수','목','금','토'].map(d=>`<div class="cal-head">${d}</div>`).join('');
  for(let i=0;i<42;i++){ const d=new Date(start); d.setDate(start.getDate()+i); const ds=d.toISOString().slice(0,10); const evs=eventsForDate(ds); html+=`<div class="day ${d.getDay()===0?'sun':''}" ondblclick="openScheduleModal('${ds}')"><div class="date">${d.getDate()}</div>${evs.slice(0,2).map(e=>`<div class="evt" onclick="event.stopPropagation();openScheduleModal('${ds}','${e.id}')"><b>${e.time||''}</b><br>${e.siteName||e.title||'개인일정'}<br><span class="tag ${colors[e.type]||'blue'}">${e.type}</span></div>`).join('')}</div>`; }
  return html+'</div><div class="legend"><span><i class="dot"></i>기계설치</span><span><i class="dot" style="background:#16a34a"></i>현장 점검</span><span><i class="dot" style="background:#f97316"></i>자재 입고</span><span><i class="dot" style="background:#6d28d9"></i>AS 방문</span></div>';
}
function paymentTable(){return `<table class="table"><tr><th>구분</th><th>금액</th><th>건수</th></tr><tr><td>총 계약 금액</td><td>${fmt(DB.sites.reduce((a,s)=>a+(+s.contractAmount||0),0))}</td><td>${DB.sites.length}</td></tr><tr><td>총 입금 금액</td><td>${fmt(DB.sites.reduce((a,s)=>a+(+s.paidAmount||0),0))}</td><td>${DB.payments.length}</td></tr><tr><td>미수 금액</td><td style="color:#ef4444;font-weight:900">${fmt(kpis().receivable)}</td><td>${DB.sites.filter(s=>+s.receivable>0).length}</td></tr></table>`}
function donut(){ const counts={}; DB.sites.forEach(s=>counts[s.status]=(counts[s.status]||0)+1); return `<div class="donut"><div class="circle"></div><div>${Object.entries(counts).map(([k,v])=>`<p><b>${k}</b> ${v}개</p>`).join('')}</div></div>`; }
function schedulePage(){return `<main class="layout"><div class="page-title"><div><h1>일정관리</h1><p class="small">선배관·기계설치·AS·현장방문·개인일정을 관리합니다.</p></div><button class="primary" onclick="openScheduleModal()">+ 일정 등록</button></div><section class="grid kpi">${kCard('오늘 일정',eventsForDate('2024-06-24').length+' 건','2024-06-24 기준','🗓️','대시보드로 →','dashboard','blue')}${kCard('이번주 일정',DB.schedules.length+' 건','전날 17시 알림 대상','🔔','대시보드로 →','dashboard','green')}${kCard('AS 방문',DB.schedules.filter(s=>s.type.includes('AS')).length+' 건','현장 방문기록 연동','🎧','AS관리로 →','as','purple')}${kCard('미완료 일정',DB.schedules.filter(s=>s.status!=='완료').length+' 건','완료체크 필요','📌','대시보드로 →','dashboard','orange')}</section><section class="grid main"><div class="card section"><div class="section-head"><h2>4주 캘린더</h2><div class="tools"><button class="ghost" onclick="moveMonth(-1)">‹</button><b>2024년 6월</b><button class="ghost" onclick="moveMonth(1)">›</button></div></div>${calendar('schedule')}</div><aside class="sidecol"><div class="card section"><h2>전날 17시 알림 미리보기</h2><div class="notice">내일 일정이 있으면 전날 오후 5시에 알림/문자/카톡으로 확인할 수 있게 준비합니다.</div><ul><li>현장명 / 일정종류</li><li>고객 연락처 / 현장소장 연락처</li><li>특이사항 / 도면·사진</li></ul></div><div class="card section"><h2>빠른 등록</h2><div class="quick">${['기계설치','선배관','AS 방문','개인일정'].map(t=>`<button class="qbtn" onclick="openScheduleModal(null,null,'${t}')">${t}</button>`).join('')}</div></div></aside></section>${scheduleModal()}</main>`}
function moveMonth(delta){ currentMonth.setMonth(currentMonth.getMonth()+delta); render(); }
function scheduleModal(date='', schedId='', type='기계설치'){
  const s = schedId ? DB.schedules.find(x=>x.id===schedId) : null;
  const selectedSite = s?.siteId ? DB.sites.find(site=>site.id===s.siteId) : null;
  const siteInfo = selectedSite ? `고객 연락처: ${selectedSite.phone||'-'} / 현장소장: ${selectedSite.foreman||'-'} ${selectedSite.foremanPhone||''}` : '현장을 선택하면 고객/현장소장 연락처가 자동 표시됩니다.';
  return `<div class="modal" id="scheduleModal"><div class="modal-box"><div class="section-head"><h2>일정 ${s?'상세 / 수정':'등록'}</h2><button class="ghost" onclick="closeModal()">닫기</button></div><div class="detail-grid"><div class="field"><label>현장 선택</label><select id="schSite" onchange="syncScheduleSiteInfo()"><option value="">직접입력/개인일정</option>${DB.sites.map(site=>`<option value="${site.id}" ${s?.siteId===site.id?'selected':''}>${site.name}</option>`).join('')}</select><div class="small" id="schSiteInfo" style="margin-top:6px">${siteInfo}</div></div><div class="field"><label>일정종류</label><select id="schType">${['기계설치','선배관','AS 방문','현장방문','자재입고','개인일정'].map(x=>`<option ${((s?.type)||type)===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>대표 날짜</label><input class="input" type="date" id="schDate" value="${s?.date||date||'2024-06-24'}"></div><div class="field"><label>대표 시간</label><input class="input" id="schTime" value="${s?.time||'09:00'}"></div><div class="field"><label>선배관 작업 시작일</label><input class="input" type="date" id="schPipeStart" value="${s?.pipeStart||''}"></div><div class="field"><label>선배관 작업 종료일</label><input class="input" type="date" id="schPipeEnd" value="${s?.pipeEnd||''}"></div><div class="field"><label>기계설치 시작일</label><input class="input" type="date" id="schInstallStart" value="${s?.installStart||''}"></div><div class="field"><label>기계설치 종료일</label><input class="input" type="date" id="schInstallEnd" value="${s?.installEnd||''}"></div><div class="field"><label>현장명/일정명</label><input class="input" id="schName" value="${s?.siteName||''}" placeholder="현장을 직접 입력하거나 개인일정명을 입력"></div><div class="field"><label>상태</label><select id="schStatus"><option ${(!s||s?.status==='예정')?'selected':''}>예정</option><option ${s?.status==='진행중'?'selected':''}>진행중</option><option ${s?.status==='완료'?'selected':''}>완료</option></select></div></div><div class="field"><label>메모/특이사항</label><textarea id="schMemo" placeholder="방문 목적, 준비사항, 특이사항을 입력하세요">${s?.memo||''}</textarea></div><div class="field"><label>사진/도면 첨부</label><input class="input" id="schFile" type="file" multiple accept="image/*,.pdf"></div><div class="filegrid" id="schFiles">${(s?.photos||[]).map(f=>filePreview(f)).join('') || '<div class="small">등록된 첨부파일이 없습니다.</div>'}</div><div class="section-head" style="margin-top:16px"><div>${s?`<button class="danger" onclick="deleteSchedule('${s.id}')">삭제</button>`:''}</div><button class="primary" onclick="saveSchedule('${s?.id||''}')">저장</button></div></div></div>`;
}
function openScheduleModal(date='', id='', type='기계설치'){
  const old=$('#scheduleModal'); if(old) old.remove();
  document.body.insertAdjacentHTML('beforeend', scheduleModal(date,id,type));
  $('#scheduleModal').classList.add('show');
}
function syncScheduleSiteInfo(){
  const site=DB.sites.find(s=>s.id===$('#schSite')?.value);
  if($('#schSiteInfo')) $('#schSiteInfo').textContent = site ? `고객 연락처: ${site.phone||'-'} / 현장소장: ${site.foreman||'-'} ${site.foremanPhone||''}` : '현장을 선택하면 고객/현장소장 연락처가 자동 표시됩니다.';
  if(site && $('#schName') && !$('#schName').value) $('#schName').value = site.name;
}
function closeModal(){ $$('.modal').forEach(m=>m.classList.remove('show')); }
async function saveSchedule(existingId){
  try{
    const siteId=$('#schSite').value;
    const site=DB.sites.find(s=>s.id===siteId);
    let photos=[];
    const old=DB.schedules.find(s=>s.id===existingId);
    if(old) photos=[...(old.photos||[])];
    const files=$('#schFile')?.files || [];
    for(const f of files){
      const fd=new FormData();
      fd.append('file',f);
      const uploaded = await api('/api/upload/schedule',{method:'POST',body:fd});
      photos.push(uploaded);
    }
    const rec={
      id: existingId || id('sch'),
      siteId,
      siteName: site ? site.name : (($('#schName').value || '').trim() || '개인일정'),
      type: $('#schType').value,
      date: $('#schDate').value,
      time: $('#schTime').value,
      status: $('#schStatus').value,
      memo: $('#schMemo').value,
      pipeStart: $('#schPipeStart')?.value || '',
      pipeEnd: $('#schPipeEnd')?.value || '',
      installStart: $('#schInstallStart')?.value || '',
      installEnd: $('#schInstallEnd')?.value || '',
      customerPhone: site?.phone || '',
      foremanPhone: site?.foremanPhone || '',
      photos
    };
    if(!rec.date){ alert('날짜를 선택해주세요.'); return; }
    if(existingId) DB.schedules=DB.schedules.map(s=>s.id===existingId?rec:s); else DB.schedules.push(rec);
    await save();
    closeModal();
    alert('저장되었습니다.');
  }catch(e){
    console.error(e);
    alert('저장 실패: ' + e.message);
  }
}
async function deleteSchedule(idv){
  if(!idv) return closeModal();
  if(confirm('삭제하시겠습니까?')){
    try{
      DB.schedules=DB.schedules.filter(s=>s.id!==idv);
      await save();
      closeModal();
      alert('삭제되었습니다.');
    }catch(e){
      console.error(e);
      alert('삭제 실패: ' + e.message);
    }
  }
}
function filePreview(f){ const isImg=(f.mime||'').startsWith('image/')||/\.(jpg|png|jpeg|webp)$/i.test(f.url||''); return `<div class="filebox">${isImg?`<img src="${f.url}">`:`<a href="${f.url}" target="_blank">${f.name||'파일'}</a>`}</div>` }
function sitesPage(){ return `<main class="layout"><div class="page-title"><div><h1>현장관리</h1><p class="small">현장 상세, 일정, 계약/입금, 비용/손익, 도면/사진, AS 이력을 관리합니다.</p></div><button class="primary" onclick="openSiteModal()">+ 현장 등록</button></div>${siteDetail(DB.sites[0])}${siteModal()}</main>`; }
function siteDetail(s){ return `<section class="card section"><div class="section-head"><div><h2>${s.name} <span class="tag blue">${s.status}</span></h2><p class="small">담당자 ${s.manager} · 고객 ${s.customer} · 연락처 ${s.phone} · 현장소장 ${s.foreman} ${s.foremanPhone}</p></div><div><button class="ghost" onclick="openSiteModal('${s.id}')">수정</button></div></div><div class="tabs">${['기본 정보','일정 관리','계약 / 입금','비용 / 손익','도면 / 사진','AS 이력'].map((t,i)=>`<div class="tab ${i==0?'active':''}">${i+1}. ${t}</div>`).join('')}</div><div class="cols"><div class="card section"><h2>기본 정보</h2><table class="table"><tr><th>현장명</th><td>${s.name}</td></tr><tr><th>고객명</th><td>${s.customer}</td></tr><tr><th>고객 연락처</th><td>${s.phone}</td></tr><tr><th>현장소장</th><td>${s.foreman}</td></tr><tr><th>주소</th><td>${s.address||'-'}</td></tr><tr><th>특이사항</th><td>${s.note||'-'}</td></tr></table></div><div class="card section"><h2>일정 관리</h2><table class="table"><tr><th>구분</th><th>날짜</th><th>상태</th></tr>${DB.schedules.filter(x=>x.siteId===s.id).map(x=>`<tr><td>${x.type}</td><td>${x.date}${x.pipeStart?`<br>선배관 ${x.pipeStart}~${x.pipeEnd||x.pipeStart}`:''}${x.installStart?`<br>기계설치 ${x.installStart}~${x.installEnd||x.installStart}`:''}</td><td><span class="tag ${colors[x.type]||'blue'}">${x.status}</span></td></tr>`).join('')}</table></div><div class="card section"><h2>계약 / 입금</h2><p>계약금액 <b>${fmt(s.contractAmount)}원</b></p><p>실제 입금액 <b style="color:#2563eb">${fmt(s.paidAmount)}원</b></p><p>미수금 <b style="color:#ef4444;font-size:24px">${fmt(s.receivable)}원</b></p></div></div></section>`}
function openSiteModal(idv=''){ alert('현장 등록/수정은 다음 단계에서 상세 입력폼으로 확장합니다.'); }
function siteModal(){return ''}
function quotesPage(){return `<main class="layout"><div class="page-title"><h1>견적관리</h1><button class="primary">+ 견적 작성</button></div><section class="card section"><h2>견적서 상세</h2><table class="table"><tr><th>견적번호</th><th>현장명</th><th>고객</th><th>상태</th><th>총액</th></tr>${DB.quotes.map(q=>`<tr><td>${q.id}</td><td>${q.siteName}</td><td>${q.customer}</td><td>${q.status}</td><td>${fmt(q.total)}</td></tr>`).join('')}</table><div class="detail-grid" style="margin-top:14px"><div class="card section"><h2>A. 장비 내역</h2><table class="table"><tr><th>제품명</th><th>수량</th><th>단가</th></tr><tr><td>LG MULTI V S</td><td>1</td><td>4,800,000</td></tr></table></div><div class="card section"><h2>B. 설치비 / C. 추가비</h2><table class="table"><tr><td>4WAY 1대 기본 설치</td><td>1,800,000</td></tr><tr><td>동배관 15/9</td><td>850,000</td></tr></table></div></div></section></main>`}
function taxPage(){ const sales=DB.sites.reduce((a,s)=>a+(+s.contractAmount||0),0), expenses=DB.expenses.reduce((a,e)=>a+(+e.amount||0),0); return `<main class="layout"><div class="page-title"><h1>세무관리</h1><button class="primary">보고서 출력</button></div><section class="grid kpi">${kCard('매출(공급가액)',fmt(sales)+' 원','전월 대비 ▲ 12.5%','₩','상세 보기 →','tax','blue')}${kCard('매입(공급가액)',fmt(expenses)+' 원','자재/인건비/장비대','📦','상세 보기 →','tax','green')}${kCard('미수금 현황',fmt(kpis().receivable)+' 원','입금 확인 필요','📄','상세 보기 →','tax','orange')}${kCard('예상 부가세',fmt(Math.round((sales-expenses)*0.1))+' 원','이번 과세기간','🧾','상세 보기 →','tax','purple')}</section><section class="grid bottom"><div class="card section"><h2>매출 현황</h2><table class="table"><tr><th>현장</th><th>계약금액</th><th>미수금</th></tr>${DB.sites.map(s=>`<tr><td>${s.name}</td><td>${fmt(s.contractAmount)}</td><td>${fmt(s.receivable)}</td></tr>`).join('')}</table></div><div class="card section"><h2>매입/지출 현황</h2><table class="table"><tr><th>일자</th><th>구분</th><th>내용</th><th>금액</th></tr>${DB.expenses.map(e=>`<tr><td>${e.date}</td><td>${e.category}</td><td>${e.detail}</td><td>${fmt(e.amount)}</td></tr>`).join('')}</table></div></section></main>`}
function genericPage(title,desc,key){ return ()=>`<main class="layout"><div class="page-title"><div><h1>${title}</h1><p class="small">${desc}</p></div><button class="primary" onclick="addGeneric('${key}')">+ 등록</button></div><section class="card section"><table class="table"><tr><th>일자</th><th>현장</th><th>구분/내용</th><th>금액</th><th>관리</th></tr>${(DB[key]||[]).map(x=>`<tr><td>${x.date||'-'}</td><td>${x.siteName||x.name||'-'}</td><td>${x.category||x.detail||x.type||'-'}</td><td>${fmt(x.amount)}</td><td><button class="ghost">수정</button></td></tr>`).join('')}</table></section></main>`}
function addGeneric(key){ const amt=prompt('금액 입력'); if(!amt)return; DB[key].push({id:id(key),date:new Date().toISOString().slice(0,10),siteName:'테스트 현장',category:'등록항목',amount:+amt}); save(); }
function asPage(){ return genericPage('AS관리','AS 접수/방문/처리사진을 관리합니다.','asLogs')(); }
function vendorsPage(){ return genericPage('협력업체관리','자재상/LG/삼성/캐리어/사다리차/외주업체를 관리합니다.','vendors')(); }
function employeesPage(){ return genericPage('직원관리','직원정보와 기초안전보건교육 이수증을 관리합니다.','employees')(); }
function staticPage(title){ return ()=>`<main class="layout"><div class="page-title"><h1>${title}</h1></div><section class="card section"><p>실사용 설정 화면입니다. 다음 단계에서 상세 항목을 연결합니다.</p></section></main>`}
window.route=route; window.toggleDrawer=toggleDrawer; window.moveMonth=moveMonth; window.openScheduleModal=openScheduleModal; window.closeModal=closeModal; window.saveSchedule=saveSchedule; window.deleteSchedule=deleteSchedule; window.syncScheduleSiteInfo=syncScheduleSiteInfo; window.openSiteModal=openSiteModal; window.addGeneric=addGeneric;
load().catch(e=>{document.body.innerHTML='<pre style="padding:20px">오류: '+e.message+'</pre>';});
