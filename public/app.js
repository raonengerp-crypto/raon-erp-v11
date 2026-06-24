
const $ = (q)=>document.querySelector(q); const $$=(q)=>Array.from(document.querySelectorAll(q));
const money=n=> (Number(n)||0).toLocaleString('ko-KR')+'원';
const todayISO=()=>new Date().toISOString().slice(0,10);
const store={
  get(k,d){try{return JSON.parse(localStorage.getItem(k)) ?? d}catch(e){return d}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};
const master={
  products:[
    {system:'멀티형', category:'4WAY', brand:'LG', model:'TW1450A9SR', hp:'5HP', pyeong:'40평', price:3500000, type:'냉난방'},
    {system:'멀티형', category:'원형', brand:'LG', model:'PW0600R2SF', hp:'2HP', pyeong:'18평', price:1650000, type:'냉난방'},
    {system:'멀티형', category:'1WAY', brand:'LG', model:'PW0200C2SF', hp:'0.6HP', pyeong:'5평', price:554400, type:'냉난방'},
    {system:'가정용', category:'스탠드', brand:'LG', model:'PQ0900T2SF', hp:'3HP', pyeong:'25평', price:1264000, type:'냉방전용'},
    {system:'싱글형', category:'4WAY', brand:'LG', model:'TNW1100A2UR', hp:'4HP', pyeong:'32평', price:3100000, type:'냉난방'},
    {system:'상업용 스탠드', category:'스탠드', brand:'LG', model:'PQ2300F9SF', hp:'8HP', pyeong:'63평', price:4186000, type:'냉방전용'}
  ],
  install:['설치 인건비','냉매배관비','드레인배관 작업','통신선 작업','유선리모컨선 작업','시운전 및 마감'],
  extra:['동배관 추가','바닥앵글','2단앵글','배수펌프','코어타공','냉매보충','전기작업','크레인','스카이','지게차'],
  pipes:['6/9','12/6','15/9','19/9','22/9'],
  materials:{
    '배관':['직관 6','직관 9','직관 12','직관 15','직관 19','직관 22','직관 28','직관 34','직관 41','연관 6/9','연관 12/6','연관 15/6','연관 15/9','연관 19/9','연관 22/9'],
    '배관보온제':['6mm 9T','6mm 13T','6mm 19T','9mm 9T','9mm 13T','9mm 19T','12mm 9T','12mm 13T','12mm 19T','15mm 9T','15mm 13T','15mm 19T','19mm 9T','19mm 13T','19mm 19T','22mm 9T','22mm 13T','22mm 19T','28mm 9T','28mm 13T','28mm 19T','34mm 9T','34mm 13T','34mm 19T','41mm 9T','41mm 13T','41mm 19T'],
    '동부속':['6 90도 동엘보','9 90도 동엘보','12 90도 동엘보','15 90도 동엘보','19 90도 동엘보','22 90도 동엘보','28 90도 동엘보','34 90도 동엘보','41 90도 동엘보','6 동소켓','9 동소켓','12 동소켓','15 동소켓','19 동소켓','22 동소켓','28 동소켓','34 동소켓','41 동소켓'],
    'PVC':['드레인배관 25','드레인배관 40'],
    'PVC부속':['25 엘보','25 T','25 소켓','40 엘보','40 T','40 소켓','25/40 이경티','40/25 레듀샤','40/40 T'],
    '행거':['원터치행거 50A','원터치행거 65A','원터치행거 80A','원터치행거 100A','사이트행거 50A','사이트행거 65A','사이트행거 80A','사이트행거 100A','멀티행거 소','멀티행거 중','멀티행거 대'],
    '전산대/소모품':['전산대 2.5M','전산대 3M','실리콘','폼건','은박테이프','EPDM 테이프'],
    '통신선':['0.75/2P','1.0/2P','1.0/2P 실드','1.0/4P','VCTF 2.5/3P','1.0/4P 고무전선'],
    '전원선':['2.5 IV선','4.0/4P','6.0/4P','2.5/4P','4.0/3P','6.0/3P'],
    '냉매':['R22','R32','R410A','R407C'],
    '드레인펌프':['벽걸이 4M','벽걸이 6M','벽걸이 9M','스탠드 4M','스탠드 6M','스탠드 9M']
  }
};
let state={page:'dashboard', selectedSite:null, fieldTab:'basic'};
function seed(){
 if(!store.get('sites',null)){
  const sites=[
   {id:uid(), name:'여수 OO상가 리모델링', status:'기계설치', customer:'김대표', phone:'010-1234-5678', manager:'현장소장 박', managerPhone:'010-5555-3333', address:'전남 여수시 학동', memo:'기존 배관 재사용 검토, 실외기 옥상 설치', contract:8500000, equipmentCost:4200000, depositPaid:4200000, balancePaid:3800000, discount:300000, materialCost:780000, laborCost:1200000, machineCost:450000, outsourceCost:300000, etcCost:150000, pipeStart:'2026-06-24', pipeEnd:'2026-06-26', machineStart:'2026-06-30', machineEnd:'2026-07-01', photos:[]},
   {id:uid(), name:'순천 푸르지오 104동', status:'선배관', customer:'이민수', phone:'010-3333-2222', manager:'관리사무소', managerPhone:'061-000-0000', address:'전남 순천시', memo:'선배관 완료 후 기계설치 별도 협의', contract:6200000, equipmentCost:3400000, depositPaid:3000000, balancePaid:0, discount:0, materialCost:520000, laborCost:800000, machineCost:0, outsourceCost:0, etcCost:90000, pipeStart:'2026-06-25', pipeEnd:'2026-06-27', machineStart:'2026-07-03', machineEnd:'2026-07-03', photos:[]},
   {id:uid(), name:'광양 XX카페', status:'계약완료', customer:'최사장', phone:'010-7777-8888', manager:'최사장', managerPhone:'010-7777-8888', address:'전남 광양시 중동', memo:'천장고 낮음, 드레인 경사 주의', contract:4300000, equipmentCost:2100000, depositPaid:0, balancePaid:0, discount:0, materialCost:260000, laborCost:450000, machineCost:180000, outsourceCost:0, etcCost:40000, pipeStart:'2026-06-28', pipeEnd:'2026-06-28', machineStart:'2026-07-05', machineEnd:'2026-07-05', photos:[]}
  ]; store.set('sites',sites); state.selectedSite=sites[0].id;
 }
 if(!store.get('quotes',null)) store.set('quotes',[]);
 if(!store.get('materials',null)) store.set('materials',[]);
 if(!store.get('taxCards',null)) store.set('taxCards',[]);
 if(!store.get('vendors',null)) store.set('vendors',[{id:uid(),name:'순천자재상',type:'자재상',phone:'061-111-2222',bank:'농협 123-4567-8901 예금주 순천자재상',biz:'123-45-67890'}]);
}
function uid(){return 'id'+Math.random().toString(36).slice(2,10)}
function toast(msg){const t=$('.toast')||document.body.appendChild(Object.assign(document.createElement('div'),{className:'toast'}));t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
function nav(page){state.page=page; render()}
function header(){
 const menus=['dashboard:대시보드','field:현장관리','quote:견적관리','material:자재관리','tax:세무관리','as:AS관리','vendor:협력업체','settings:설정'];
 return `<div class="topbar"><div class="brand"><div class="logo">R</div><div><h1>RAON E&G ERP</h1><span>v12 Full Preview · UI LOCK</span></div></div><div class="nav">${menus.map(m=>{let [p,n]=m.split(':');return `<button onclick="nav('${p}')" class="${state.page==p?'active':''}">${n}</button>`}).join('')}</div><div class="top-actions"><button class="hide-sm">🔔 알림</button><button>관리자</button></div></div>`
}
function render(){
 seed(); const app=$('#app'); app.innerHTML=`<div class="app">${header()}<main class="shell responsive-scale">${page()}</main><div class="toast"></div></div>`; afterRender();
}
function page(){return ({dashboard,field,quote,material,tax,as:asPage,vendor,settings}[state.page]||dashboard)()}
function getSites(){return store.get('sites',[])}
function saveSites(s){store.set('sites',s)}
function calcSite(s){let actual=(+s.depositPaid||0)+(+s.balancePaid||0);let realSales=(+s.contract||0)-(+s.discount||0);let unpaid=Math.max(0,realSales-actual);let cost=(+s.equipmentCost||0)+(+s.materialCost||0)+(+s.laborCost||0)+(+s.machineCost||0)+(+s.outsourceCost||0)+(+s.etcCost||0);let profit=realSales-cost;let margin=realSales?Math.round(profit/realSales*100):0;return{actual,realSales,unpaid,cost,profit,margin}}
function makeEvents(){
 const ev=[]; getSites().forEach(s=>{ if(s.pipeStart) ev.push({date:s.pipeStart,title:s.name+' 선배관 시작',type:'pipe',site:s.id}); if(s.pipeEnd&&s.pipeEnd!==s.pipeStart) ev.push({date:s.pipeEnd,title:s.name+' 선배관 종료',type:'pipe',site:s.id}); if(s.machineStart) ev.push({date:s.machineStart,title:s.name+' 기계설치',type:'machine',site:s.id}); }); return ev;
}
function dashboard(){
 const sites=getSites(); const sums=sites.reduce((a,s)=>{let c=calcSite(s);a.unpaid+=c.unpaid;a.depositDue+=Math.max(0,(+s.equipmentCost||0)-(+s.depositPaid||0));a.active+=(s.status!=='시공완료');return a},{unpaid:0,depositDue:0,active:0});
 const todayEvents=makeEvents().filter(e=>e.date===todayISO());
 return `<div class="page-head"><div class="page-title"><h2>대시보드</h2><p>현장·일정·미수·세무 흐름을 한 화면에서 확인합니다.</p></div><button class="btn blue" onclick="openSiteModal()">+ 현장 등록</button></div>
 <section class="grid kpis">
  ${kpi('진행 중 현장',sums.active+'건','현장관리로 이동','🏗️','field')}
  ${kpi('오늘 일정',todayEvents.length+'건','캘린더에서 확인','📅','dashboard')}
  ${kpi('미수금',money(sums.unpaid),'세무관리 입금/미수','💰','tax')}
  ${kpi('입금 예정',money(sums.depositDue),'계약금 기준','🏦','tax')}
 </section>
 <section class="grid dashboard-layout" style="margin-top:14px">
  <div class="card calendar-card"><div class="card-title"><h3>월간 캘린더</h3><div class="status-line"><span class="badge blue">선배관</span><span class="badge green">기계설치</span><button class="btn small light" onclick="openScheduleQuick()">+ 일정 등록</button></div></div>${calendar()}</div>
  <div class="grid side-stack">
   <div class="card"><div class="card-title"><h3>빠른 이동</h3></div><div class="quick-grid">${['현장 등록','견적 작성','자재 붙여넣기','세무 확인','AS 접수','협력업체'].map((n,i)=>`<button class="quick" onclick="nav('${['field','quote','material','tax','as','vendor'][i]}')"><b>${n}</b><span>${['현장 기본정보와 비용 등록','A/B/C 견적 시트','자재내역 자동 분석','미수·VAT·카드내역','AS 사진/처리 이력','전화·계좌·사업자증'][i]}</span></button>`).join('')}</div></div>
   <div class="card"><div class="card-title"><h3>계약/입금 · 비용/손익</h3></div><div class="donut-wrap"><div><div class="donut">${sites.length}건</div><p class="muted">계약/입금 현황</p></div><div><div class="donut" style="background:conic-gradient(#16a34a 0 58%, #dfe8f5 58% 100%)">손익</div><p class="muted">비용/손익 현황</p></div></div></div>
   <div class="card"><div class="card-title"><h3>최근 등록 현장</h3><button class="btn small light" onclick="nav('field')">더보기</button></div>${siteRows(sites.slice(0,4))}</div>
  </div>
 </section>`;
}
function kpi(label,value,sub,icon,page){return `<div class="card kpi" onclick="nav('${page}')" style="cursor:pointer"><div><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div><div class="ico">${icon}</div></div>`}
function calendar(){
 const d=new Date(); const y=d.getFullYear(), m=d.getMonth(); const first=new Date(y,m,1); const start=new Date(first); start.setDate(1-first.getDay()); const ev=makeEvents(); let html='<div class="calendar-grid">'+['일','월','화','수','목','금','토'].map(x=>`<div class="dow">${x}</div>`).join('');
 for(let i=0;i<35;i++){let cur=new Date(start);cur.setDate(start.getDate()+i);let iso=cur.toISOString().slice(0,10);let list=ev.filter(e=>e.date===iso);let cls=iso===todayISO()?' today':'';html+=`<div class="day${cls}"><div class="day-num">${cur.getDate()}</div>${list.map(e=>`<span class="event ${e.type}" onclick="state.selectedSite='${e.site}';nav('field')">${e.title}</span>`).join('')}</div>`}
 return html+'</div>';
}
function siteRows(sites){return `<table class="table"><thead><tr><th>현장</th><th>상태</th><th>미수</th></tr></thead><tbody>${sites.map(s=>`<tr onclick="state.selectedSite='${s.id}';nav('field')"><td>${s.name}</td><td><span class="badge blue">${s.status}</span></td><td>${money(calcSite(s).unpaid)}</td></tr>`).join('')}</tbody></table>`}
function field(){
 const sites=getSites(); if(!state.selectedSite && sites[0]) state.selectedSite=sites[0].id; const s=sites.find(x=>x.id===state.selectedSite)||sites[0];
 if(!s) return empty('현장관리','등록된 현장이 없습니다.','현장 등록', 'openSiteModal()'); const c=calcSite(s);
 return `<div class="page-head"><div class="page-title"><h2>현장관리</h2><p>한 현장을 한 화면에서 관리합니다. 저장 시 대시보드·세무·자재에 반영됩니다.</p></div><div><button class="btn blue" onclick="openSiteModal()">+ 현장 등록</button> <button class="btn light" onclick="openSiteModal('${s.id}')">수정</button> <button class="btn red" onclick="deleteSite('${s.id}')">삭제</button></div></div>
 <section class="grid field-layout">
  <aside class="card site-list"><div class="card-title"><h3>현장 목록</h3></div>${sites.map(x=>`<div class="site-item ${x.id===s.id?'active':''}" onclick="state.selectedSite='${x.id}';render()"><strong>${x.name}</strong><small>${x.status} · ${x.customer}</small></div>`).join('')}</aside>
  <div>
   <div class="hero"><div class="hero-top"><div><h2>${s.name}</h2><p class="muted">${s.memo||'특이사항 없음'}</p></div><span class="badge orange">${s.status}</span></div><div class="meta"><div><span>고객</span>${s.customer}</div><div><span>고객 연락처</span>${s.phone}</div><div><span>현장소장</span>${s.manager}</div><div><span>주소</span>${s.address}</div></div></div>
   <div class="grid field-kpis">${mini('총 계약금',money(s.contract))}${mini('입금 완료',money(c.actual))}${mini('미수금',money(c.unpaid),'red')}${mini('예상 순익',money(c.profit),c.profit>=0?'green':'red')}${mini('마진율',c.margin+'%')}</div>
   <div class="tabs">${['basic:기본정보','schedule:일정','payment:계약/입금','cost:비용/손익','photo:도면/사진','as:AS'].map(t=>{let[a,b]=t.split(':');return `<button class="tab ${state.fieldTab===a?'active':''}" onclick="state.fieldTab='${a}';render()">${b}</button>`}).join('')}</div>
   ${fieldTab(s,c)}
   <div class="grid accordion" style="margin-top:12px">${['기본정보','일정','계약/입금 관리','비용/손익','도면/사진 관리','AS 관리'].map((h,i)=>`<div class="acc"><h4>${h}</h4><p>${['고객·현장소장·주소·특이사항 확인','선배관·기계설치 시작/종료일 자동 캘린더 반영','장비비 기준 계약금·잔금·할인·미수 계산','장비비·자재비·인건비·장비대·외주비 집계','도면, 시공 전/후, 배관 재사용 사진 저장','시공완료일 기준 2년 AS 이력 관리'][i]}</p></div>`).join('')}</div>
  </div>
 </section>`
}
function mini(label,val,color=''){return `<div class="card mini-kpi"><span>${label}</span><b class="${color}">${val}</b></div>`}
function fieldTab(s,c){
 if(state.fieldTab==='schedule') return `<div class="card"><div class="form-grid"><label>선배관 시작일<input value="${s.pipeStart||''}" onchange="updateSite('${s.id}','pipeStart',this.value)" type="date"></label><label>선배관 종료일<input value="${s.pipeEnd||''}" onchange="updateSite('${s.id}','pipeEnd',this.value)" type="date"></label><label>기계설치 시작일<input value="${s.machineStart||''}" onchange="updateSite('${s.id}','machineStart',this.value)" type="date"></label><label>기계설치 종료일<input value="${s.machineEnd||''}" onchange="updateSite('${s.id}','machineEnd',this.value)" type="date"></label></div></div>`;
 if(state.fieldTab==='payment') return `<div class="card"><div class="form-grid three">${numField(s,'contract','총 계약금')}${numField(s,'equipmentCost','장비비/계약금 기본')}${numField(s,'depositPaid','계약금 실제입금')}${numField(s,'balancePaid','잔금 실제입금')}${numField(s,'discount','할인금액')}<label>미수금<input readonly value="${money(c.unpaid)}"></label></div></div>`;
 if(state.fieldTab==='cost') return `<div class="card"><div class="form-grid three">${numField(s,'materialCost','자재비')}${numField(s,'laborCost','인건비')}${numField(s,'machineCost','장비대')}${numField(s,'outsourceCost','외주비')}${numField(s,'etcCost','기타비')}<label>총비용<input readonly value="${money(c.cost)}"></label></div></div>`;
 if(state.fieldTab==='photo') return `<div class="card"><h3>도면/사진</h3><input type="file" multiple onchange="mockFiles(this)"><p class="muted">Preview Build에서는 파일명을 저장 표시합니다. 정식 Supabase 연결 시 원본 파일 저장.</p><div id="filePreview">${(s.photos||[]).map(p=>`<span class="badge blue">${p}</span>`).join(' ')}</div></div>`;
 if(state.fieldTab==='as') return `<div class="card"><h3>AS 이력</h3><p>시공완료일 기준 2년. AS 접수, 사진, 처리내용은 AS관리에서 상세 입력.</p><button class="btn blue" onclick="nav('as')">AS 접수</button></div>`;
 return `<div class="card"><div class="form-grid"><label>현장명<input value="${s.name}" onchange="updateSite('${s.id}','name',this.value)"></label><label>상태<select onchange="updateSite('${s.id}','status',this.value)">${['계약완료','선배관','기계설치','시공완료','AS'].map(x=>`<option ${s.status===x?'selected':''}>${x}</option>`).join('')}</select></label><label>고객명<input value="${s.customer}" onchange="updateSite('${s.id}','customer',this.value)"></label><label>고객 연락처<input value="${s.phone}" onchange="updateSite('${s.id}','phone',this.value)"></label><label>현장소장<input value="${s.manager}" onchange="updateSite('${s.id}','manager',this.value)"></label><label>현장소장 연락처<input value="${s.managerPhone}" onchange="updateSite('${s.id}','managerPhone',this.value)"></label><label style="grid-column:1/-1">주소<input value="${s.address}" onchange="updateSite('${s.id}','address',this.value)"></label><label style="grid-column:1/-1">특이사항<textarea onchange="updateSite('${s.id}','memo',this.value)">${s.memo||''}</textarea></label></div></div>`
}
function numField(s,key,label){return `<label>${label}<input type="number" value="${s[key]||0}" onchange="updateSite('${s.id}','${key}',this.value)"></label>`}
function updateSite(id,key,val){let sites=getSites();let s=sites.find(x=>x.id===id); if(!s)return; s[key]= key.includes('Cost')||['contract','depositPaid','balancePaid','discount','equipmentCost'].includes(key)?Number(val||0):val; saveSites(sites); toast('저장되었습니다.'); render()}
function openSiteModal(id){const sites=getSites();const s=sites.find(x=>x.id===id)||{id:'',name:'',status:'계약완료',customer:'',phone:'',manager:'',managerPhone:'',address:'',memo:'',contract:0,equipmentCost:0}; openModal(`<div class="modal-head"><h3>${id?'현장 수정':'현장 등록'}</h3><button class="btn light" onclick="closeModal()">닫기</button></div><div class="form-grid"><label>현장명<input id="mName" value="${s.name||''}"></label><label>상태<select id="mStatus">${['계약완료','선배관','기계설치','시공완료','AS'].map(x=>`<option ${s.status===x?'selected':''}>${x}</option>`).join('')}</select></label><label>고객명<input id="mCustomer" value="${s.customer||''}"></label><label>고객 연락처<input id="mPhone" value="${s.phone||''}"></label><label>현장소장<input id="mManager" value="${s.manager||''}"></label><label>현장소장 연락처<input id="mManagerPhone" value="${s.managerPhone||''}"></label><label style="grid-column:1/-1">주소<input id="mAddress" value="${s.address||''}"></label><label>총 계약금<input id="mContract" type="number" value="${s.contract||0}"></label><label>장비비<input id="mEquip" type="number" value="${s.equipmentCost||0}"></label><label style="grid-column:1/-1">특이사항<textarea id="mMemo">${s.memo||''}</textarea></label></div><div style="margin-top:16px;text-align:right"><button class="btn blue" onclick="saveSiteModal('${id||''}')">저장</button></div>`)}
function saveSiteModal(id){let sites=getSites();let obj={id:id||uid(),name:$('#mName').value,status:$('#mStatus').value,customer:$('#mCustomer').value,phone:$('#mPhone').value,manager:$('#mManager').value,managerPhone:$('#mManagerPhone').value,address:$('#mAddress').value,memo:$('#mMemo').value,contract:+$('#mContract').value||0,equipmentCost:+$('#mEquip').value||0,depositPaid:0,balancePaid:0,discount:0,materialCost:0,laborCost:0,machineCost:0,outsourceCost:0,etcCost:0,photos:[]}; if(id){let i=sites.findIndex(x=>x.id===id); sites[i]={...sites[i],...obj,id};}else sites.unshift(obj); saveSites(sites); state.selectedSite=obj.id; closeModal(); toast('저장되었습니다.'); render()}
function deleteSite(id){if(!confirm('삭제하시겠습니까?'))return; saveSites(getSites().filter(x=>x.id!==id)); state.selectedSite=null; toast('삭제되었습니다.'); render()}
function mockFiles(input){let files=[...input.files].map(f=>f.name);let sites=getSites();let s=sites.find(x=>x.id===state.selectedSite);s.photos=[...(s.photos||[]),...files];saveSites(sites);toast('파일명이 저장되었습니다.');render()}
function quote(){
 return `<div class="page-head"><div class="page-title"><h2>견적관리</h2><p>Quote Master v1.3 FINAL · A 장비 / B 설치비 / C 추가비</p></div><div><a class="btn light" href="/raon_quote_template.xlsx" download>라온 견적서 양식</a> <button class="btn blue" onclick="addQuoteRow('equip')">+ 장비</button></div></div>
 <div class="card"><div class="card-title"><h3>A. 장비</h3><span class="muted">제품구분/품명은 내부 필터용, 출력 견적서에서는 숨김</span></div>${quoteTable('equip')}</div>
 <div class="card" style="margin-top:12px"><div class="card-title"><h3>B. 설치비</h3><button class="btn small blue" onclick="addQuoteRow('install')">+ 설치비</button></div>${quoteTable('install')}</div>
 <div class="card" style="margin-top:12px"><div class="card-title"><h3>C. 추가비</h3><button class="btn small blue" onclick="addQuoteRow('extra')">+ 추가비</button></div>${quoteTable('extra')}</div>
 <div class="totals"><div class="total-box">장비합계<br><b id="qEquipTotal">0원</b></div><div class="total-box">설치합계<br><b id="qInstallTotal">0원</b></div><div class="total-box">추가비합계<br><b id="qExtraTotal">0원</b></div><div class="total-box">총 견적금액<br><b id="qGrand">0원</b></div></div>`
}
function quoteTable(type){
 if(type==='equip') return `<div class="sheet"><table id="equipTable"><thead><tr><th>제품구분</th><th>품명</th><th>브랜드</th><th>모델명</th><th>마력</th><th>평형</th><th>수량</th><th>단가</th><th>금액</th><th></th></tr></thead><tbody></tbody></table></div>`;
 if(type==='install') return `<div class="sheet"><table id="installTable"><thead><tr><th>설치비 내역</th><th>수량</th><th>단가</th><th>금액</th><th></th></tr></thead><tbody></tbody></table></div>`;
 return `<div class="sheet"><table id="extraTable"><thead><tr><th>항목</th><th>규격</th><th>수량</th><th>단가</th><th>금액</th><th></th></tr></thead><tbody></tbody></table></div>`;
}
function afterRender(){ if(state.page==='quote'){['equip','install','extra'].forEach(t=>addQuoteRow(t)); calcQuote();} }
function addQuoteRow(type){let tb=$(`#${type}Table tbody`); if(!tb)return; let tr=document.createElement('tr');
 if(type==='equip'){tr.innerHTML=`<td><select onchange="filterProduct(this)">${['싱글형','멀티형','가정용','상업용 스탠드'].map(x=>`<option>${x}</option>`)}</select></td><td><select onchange="filterProduct(this)">${['1WAY','2WAY','4WAY','원형','벽걸이','스탠드','상업용 천정형'].map(x=>`<option>${x}</option>`)}</select></td><td><select><option>LG</option><option>삼성</option><option>캐리어</option></select></td><td><select onchange="setProduct(this)">${master.products.map(p=>`<option value="${p.model}">${p.model}</option>`).join('')}</select></td><td><input readonly></td><td><input readonly></td><td><input type="number" value="1" oninput="calcQuote()"></td><td><input type="number" value="0" oninput="calcQuote()"></td><td><input readonly></td><td><button class="btn small red" onclick="this.closest('tr').remove();calcQuote()">삭제</button></td>`}
 if(type==='install'){tr.innerHTML=`<td><select>${master.install.map(x=>`<option>${x}</option>`)}</select></td><td><input type="number" value="1" oninput="calcQuote()"></td><td><input type="number" value="0" oninput="calcQuote()"></td><td><input readonly></td><td><button class="btn small red" onclick="this.closest('tr').remove();calcQuote()">삭제</button></td>`}
 if(type==='extra'){tr.innerHTML=`<td><select onchange="toggleSpec(this)">${master.extra.map(x=>`<option>${x}</option>`)}</select></td><td><select>${master.pipes.map(x=>`<option>${x}</option>`)}</select></td><td><input type="number" value="1" oninput="calcQuote()"></td><td><input type="number" value="0" oninput="calcQuote()"></td><td><input readonly></td><td><button class="btn small red" onclick="this.closest('tr').remove();calcQuote()">삭제</button></td>`}
 tb.appendChild(tr); if(type==='equip') setProduct(tr.querySelector('select:nth-of-type(4)')); calcQuote(); }
function setProduct(sel){let p=master.products.find(x=>x.model===sel.value)||master.products[0];let tr=sel.closest('tr');tr.children[0].querySelector('select').value=p.system;tr.children[1].querySelector('select').value=p.category;tr.children[2].querySelector('select').value=p.brand;tr.children[4].querySelector('input').value=p.hp;tr.children[5].querySelector('input').value=p.pyeong;tr.children[7].querySelector('input').value=p.price;calcQuote()}
function filterProduct(){}
function toggleSpec(sel){let spec=sel.closest('tr').children[1].querySelector('select'); spec.disabled = sel.value!=='동배관 추가';}
function calcQuote(){let sums={equip:0,install:0,extra:0}; ['equip','install','extra'].forEach(t=>{$$(`#${t}Table tbody tr`).forEach(tr=>{let inputs=tr.querySelectorAll('input');let qty=+inputs[inputs.length-3]?.value||+inputs[0]?.value||1;let price=+inputs[inputs.length-2]?.value||0;let amt=qty*price;inputs[inputs.length-1].value=money(amt);sums[t]+=amt})}); ['Equip','Install','Extra'].forEach(k=>{let el=$(`#q${k}Total`); if(el) el.textContent=money(sums[k.toLowerCase()])}); let g=$('#qGrand'); if(g) g.textContent=money(sums.equip+sums.install+sums.extra);}
function material(){
 const cats=Object.keys(master.materials);
 return `<div class="page-head"><div class="page-title"><h2>자재관리</h2><p>Material Master v1.3 FINAL · 자재내역 붙여넣기 자동분석</p></div><button class="btn blue" onclick="parseMaterials()">분석하기</button></div>
 <section class="parse-box"><div class="card"><h3>자재내역 붙여넣기</h3><label>현장 선택<select id="matSite">${getSites().map(s=>`<option value="${s.id}">${s.name}</option>`)}</select></label><textarea id="matPaste" class="paste-area" placeholder="예)\n15/9 배관 2롤 258000\n25엘보 30개 30000\nR410A 1통 180000\n벽걸이 4M 드레인펌프 1개 80000"></textarea><button class="btn blue" onclick="parseMaterials()">자동 분석</button></div><div class="card"><h3>분석 결과</h3><div id="matResult">붙여넣기 후 분석하기를 누르세요.</div></div></section>
 <div class="card" style="margin-top:12px"><div class="card-title"><h3>자재 DB</h3></div><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${cats.map(c=>`<div class="acc"><h4>${c}</h4><p>${master.materials[c].join(', ')}</p></div>`).join('')}</div></div>`
}
function parseMaterials(){let txt=$('#matPaste')?.value||'';let rows=txt.split(/\n+/).filter(Boolean).map(line=>{let category='기타', item=line, qty=(line.match(/(\d+(?:\.\d+)?)\s*(개|롤|통|M|m|본)/)||[])[0]||'', amount=Number((line.match(/(\d{4,})\s*$/)||[])[1]||0); Object.entries(master.materials).forEach(([cat,list])=>{if(list.some(x=>line.replace(/\s/g,'').includes(x.replace(/\s/g,'')))|| (cat==='냉매'&&/R22|R32|R410A|R407C/.test(line)) || (cat==='PVC부속'&&/엘보|소켓|레듀샤|이경티/.test(line))) category=cat;}); return {category,item,qty,amount};}); let html=`<table class="table"><thead><tr><th>구분</th><th>품목</th><th>수량</th><th>금액</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.category}</td><td>${r.item}</td><td>${r.qty}</td><td>${money(r.amount)}</td></tr>`).join('')}</tbody></table><button class="btn green" onclick='saveParsedMaterials(${JSON.stringify(rows).replace(/'/g,"&#39;")})'>현장 자재비로 저장</button>`; $('#matResult').innerHTML=html;}
function saveParsedMaterials(rows){let id=$('#matSite').value;let sum=rows.reduce((a,r)=>a+(+r.amount||0),0);let sites=getSites();let s=sites.find(x=>x.id===id);s.materialCost=(+s.materialCost||0)+sum;saveSites(sites);store.set('materials',[...store.get('materials',[]),...rows.map(r=>({...r,site:id,date:todayISO()}))]);toast('자재내역이 저장되었습니다.');}
function tax(){return `<div class="page-head"><div class="page-title"><h2>세무관리</h2><p>Tax Master v1 FINAL · 입금관리/인건비 통합 · 카드사용내역 포함</p></div><button class="btn blue" onclick="window.open('https://www.hometax.go.kr')">홈택스 열기</button></div><div class="tabs">${['sales:매출','buy:매입','pay:입금/미수','labor:인건비','card:카드사용내역','vat:VAT/홈택스'].map((t,i)=>`<button class="tab ${i===0?'active':''}" onclick="showTaxTab('${t.split(':')[0]}',this)">${t.split(':')[1]}</button>`).join('')}</div><div class="card" id="taxBody">${taxSales()}</div>`}
function showTaxTab(tab,btn){$$('.tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$('#taxBody').innerHTML=({sales:taxSales,buy:taxBuy,pay:taxPay,labor:taxLabor,card:taxCard,vat:taxVat}[tab])()}
function taxSales(){let sites=getSites();return `<h3>매출</h3><table class="table"><thead><tr><th>현장</th><th>공급가</th><th>VAT</th><th>총액</th><th>세금계산서</th></tr></thead><tbody>${sites.map(s=>{let supply=Math.round((+s.contract||0)/1.1);return `<tr><td>${s.name}</td><td>${money(supply)}</td><td>${money((+s.contract||0)-supply)}</td><td>${money(s.contract)}</td><td><span class="badge orange">미발행</span></td></tr>`}).join('')}</tbody></table>`}
function taxBuy(){let rows=store.get('materials',[]);return `<h3>매입</h3><table class="table"><thead><tr><th>날짜</th><th>구분</th><th>품목</th><th>총액</th><th>VAT</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.date}</td><td>${r.category}</td><td>${r.item}</td><td>${money(r.amount)}</td><td>${money(Math.round((+r.amount||0)/11))}</td></tr>`).join('')||'<tr><td colspan="5">자재관리에서 저장하면 표시됩니다.</td></tr>'}</tbody></table>`}
function taxPay(){return `<h3>입금/미수</h3>${siteRows(getSites())}`}
function taxLabor(){return `<h3>인건비</h3><div class="form-grid three"><label>직원명<input id="laborName"></label><label>공수<input id="laborDay" type="number" value="1"></label><label>단가<input id="laborPrice" type="number" value="180000"></label></div><p>저장 기능은 다음 단계에서 직원관리와 연결됩니다.</p>`}
function taxCard(){return `<h3>카드사용내역</h3><textarea id="cardPaste" class="paste-area" placeholder="[국민카드] 06/24 순천자재상 550,000원 승인\nGS칼텍스 88,000원"></textarea><button class="btn blue" onclick="parseCard()">카드내역 분석</button><div id="cardResult"></div>`}
function parseCard(){let lines=$('#cardPaste').value.split(/\n+/).filter(Boolean);let rows=lines.map(l=>{let amt=Number((l.replace(/,/g,'').match(/(\d+)원?\s*(승인)?$/)||[])[1]||0);let cat=/자재|철물|공구|배관/.test(l)?'자재비':/식당|국밥|카페|도시락/.test(l)?'식비':/주유|GS|SK|S-OIL|칼텍스/.test(l)?'유류비':/크레인|스카이|지게차|사다리/.test(l)?'장비대':'기타';return{line:l,amt,cat}});$('#cardResult').innerHTML=`<table class="table"><thead><tr><th>사용내역</th><th>분류</th><th>총액</th><th>공급가</th><th>VAT</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.line}</td><td>${r.cat}</td><td>${money(r.amt)}</td><td>${money(Math.round(r.amt/1.1))}</td><td>${money(r.amt-Math.round(r.amt/1.1))}</td></tr>`).join('')}</tbody></table>`;}
function taxVat(){let sales=getSites().reduce((a,s)=>a+(+s.contract||0),0);let buy=store.get('materials',[]).reduce((a,r)=>a+(+r.amount||0),0);let sv=sales-Math.round(sales/1.1), bv=buy-Math.round(buy/1.1);return `<h3>VAT/홈택스</h3><div class="grid kpis"><div class="card mini-kpi"><span>매출 VAT</span><b>${money(sv)}</b></div><div class="card mini-kpi"><span>매입 VAT</span><b>${money(bv)}</b></div><div class="card mini-kpi"><span>예상 납부세액</span><b>${money(sv-bv)}</b></div><div class="card mini-kpi"><span>보고기간</span><b>반기</b></div></div><button class="btn blue" onclick="window.open('https://www.hometax.go.kr')">홈택스 열기</button>`}
function asPage(){return empty('AS관리','AS 접수, 증상, 사진, 유상/무상, 처리 이력 관리 메뉴입니다.','AS 접수','toast("AS 접수 기능은 다음 단계에서 상세 구현")')}
function vendor(){let rows=store.get('vendors',[]);return `<div class="page-head"><div class="page-title"><h2>협력업체</h2><p>자재상·LG·삼성·캐리어·사다리차·스카이·크레인·전기업체·외주업체</p></div><button class="btn blue" onclick="toast('협력업체 등록 모달은 다음 단계')">+ 업체 등록</button></div><div class="card"><table class="table"><thead><tr><th>업체명</th><th>구분</th><th>연락처</th><th>사업자번호</th><th>계좌복사</th></tr></thead><tbody>${rows.map(v=>`<tr><td>${v.name}</td><td>${v.type}</td><td>${v.phone}</td><td>${v.biz}</td><td><button class="btn small light" onclick="navigator.clipboard.writeText('${v.bank}');toast('복사되었습니다')">복사</button></td></tr>`).join('')}</tbody></table></div>`}
function settings(){return empty('설정','회사정보, 보안센터, 직원관리, 로고/직인 설정 영역입니다.','회사정보 수정','toast("설정 기능은 다음 단계")')}
function empty(title,msg,btn,act){return `<div class="page-head"><div class="page-title"><h2>${title}</h2><p>${msg}</p></div><button class="btn blue" onclick="${act}">${btn}</button></div><div class="card"><p>${msg}</p></div>`}
function openScheduleQuick(){openModal(`<div class="modal-head"><h3>간편 일정 등록</h3><button class="btn light" onclick="closeModal()">닫기</button></div><p>일정은 현장관리의 선배관/기계설치 기간에서 자동 생성됩니다.</p><button class="btn blue" onclick="nav('field');closeModal()">현장관리로 이동</button>`) }
function openModal(html){let m=$('.modal')||document.body.appendChild(Object.assign(document.createElement('div'),{className:'modal'}));m.innerHTML=`<div class="modal-box">${html}</div>`;m.classList.add('show')}
function closeModal(){let m=$('.modal'); if(m)m.classList.remove('show')}
window.nav=nav; window.openSiteModal=openSiteModal; window.saveSiteModal=saveSiteModal; window.deleteSite=deleteSite; window.updateSite=updateSite; window.openScheduleQuick=openScheduleQuick; window.addQuoteRow=addQuoteRow; window.setProduct=setProduct; window.filterProduct=filterProduct; window.toggleSpec=toggleSpec; window.calcQuote=calcQuote; window.parseMaterials=parseMaterials; window.saveParsedMaterials=saveParsedMaterials; window.showTaxTab=showTaxTab; window.parseCard=parseCard; window.closeModal=closeModal; window.mockFiles=mockFiles;
render();
