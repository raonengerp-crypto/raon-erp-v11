import { save, modal, uid, money } from '../../app.js';
const DB={
 '배관':['직관 6','직관 9','직관 12','직관 15','직관 19','직관 22','직관 28','직관 34','직관 41','연관 6/9','연관 12/6','연관 15/6','연관 15/9','연관 19/9','연관 22/9'],
 '배관보온제':['6mm 9T','6mm 13T','6mm 19T','9mm 9T','9mm 13T','9mm 19T','12mm 9T','12mm 13T','12mm 19T','15mm 9T','15mm 13T','15mm 19T','19mm 19T','22mm 19T','28mm 19T','34mm 19T','41mm 19T'],
 '동부속':['6 동엘보 90도','9 동엘보 90도','12 동엘보 90도','15 동엘보 90도','19 동엘보 90도','22 동엘보 90도','28 동엘보 90도','34 동엘보 90도','41 동엘보 90도','6 동소켓','9 동소켓','12 동소켓','15 동소켓','19 동소켓','22 동소켓','28 동소켓','34 동소켓','41 동소켓'],
 'PVC':['드레인배관 25','드레인배관 40'],
 'PVC부속':['25 엘보','25 T','25 소켓','40 엘보','40 T','40 소켓','25/40 이경티','40/25 레듀샤','40/40 T'],
 '행거':['원터치행거 50A','원터치행거 65A','원터치행거 80A','원터치행거 100A','사이트행거 50A','사이트행거 65A','사이트행거 80A','사이트행거 100A','멀티행거 소','멀티행거 중','멀티행거 대'],
 '전산대/소모품':['전산대 2.5M','전산대 3M','실리콘','폼건','은박테이프','EPDM 테이프'],
 '통신선':['0.75/2P','1.0/2P','1.0/2P 실드','1.0/4P','VCTF 2.5/3P','1.0/4P 고무전선'],
 '전원선':['2.5 IV선','4.0/4P','6.0/4P','2.5/4P','4.0/3P','6.0/3P'],
 '냉매':['R22','R32','R410A','R407C'],
 '드레인펌프':['벽걸이 4M','벽걸이 6M','벽걸이 9M','스탠드 4M','스탠드 6M','스탠드 9M'],
 '멀티부자재':['분지관 PBL-1601H2','분지관 PBL-3501H2','분지관 PBL-7001H2','분지관 PBL-8701H2','T분지관 PCN-11600H2','T분지관 PCN-17400H2'],
 '제어/옵션':['AC Ez PCS-Z150S0','AC Ez touch PACEZB000','AC Smart IV PACS5A000','ACP V PACP5A000','AC manager V PACMV5A000','공기청정키트 PAH-TGP0M','공기청정키트 PAH-TUP0M','공기청정키트 PAH-TUP1M','공기청정키트 PAH-TTP1M','공기청정키트 PAH-TAP1MW','무선리모컨 PWLSSC41C','무선리모컨 PWLSSC41H','유선리모컨 PREMTB200','유선리모컨 PREMTA211'],
 '추가비':['1단 바닥앵글','2단 앵글','실외기 받침대 520','실외기 받침대 730','실외기 받침대 930','실외기 받침대 1240','실외기 받침대 1640','싱글형 에어가이드','멀티형 에어가이드','크레인','스카이','지게차','전기작업','냉매보충']
};
function classify(line){for(const [cat,items] of Object.entries(DB)){for(const it of items){const key=it.replace(/직관 |연관 |드레인배관 /g,'').split(' ')[0];if(line.replace(/\s/g,'').includes(key.replace(/\s/g,'')))return {category:cat,item:it};}}if(/주유|식당/.test(line))return {category:'기타',item:line};return {category:'미분류',item:line};}
export function renderMaterial(view,state){function paste(){modal(`<div class="page-head"><h2>자재내역 붙여넣기</h2><button class="btn light" id="close">닫기</button></div><label>현장<select id="site"><option value="">선택없음</option>${state.sites.map(s=>`<option>${s.name}</option>`).join('')}</select></label><textarea id="raw" placeholder="15/9 배관 2롤\n25엘보 30개\nR410A 1통" style="margin-top:10px"></textarea><div class="summary" style="margin-top:12px"><button class="btn" id="parse">분석 저장</button></div>`,(back,close)=>{back.querySelector('#close').onclick=close;back.querySelector('#parse').onclick=()=>{const site=back.querySelector('#site').value;const rows=back.querySelector('#raw').value.split(/\n+/).map(x=>x.trim()).filter(Boolean).map(line=>{const c=classify(line);const qty=(line.match(/(\d+(?:\.\d+)?)/g)||[]).pop()||1;return {id:uid('m'),date:new Date().toISOString().slice(0,10),site,line,category:c.category,item:c.item,qty:+qty,amount:0};});state.materials.unshift(...rows);save();alert('저장되었습니다.');close();draw();};});}
 function draw(){view.innerHTML=`<div class="page-head"><h1 class="page-title">자재관리</h1><button class="btn" id="pasteBtn">자재내역 붙여넣기</button></div><div class="two-col"><section class="card"><h3>자재 DB</h3><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${Object.entries(DB).map(([cat,items])=>`<div><b>${cat}</b><p class="muted">${items.slice(0,12).join(', ')}${items.length>12?' ...':''}</p></div>`).join('')}</div></section><aside class="card"><h3>최근 자재 사용내역</h3><table class="table"><thead><tr><th>현장</th><th>구분</th><th>품목</th><th>수량</th></tr></thead><tbody>${state.materials.slice(0,12).map(r=>`<tr><td>${r.site||'-'}</td><td>${r.category}</td><td>${r.item}</td><td>${r.qty}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">내역 없음</td></tr>'}</tbody></table></aside></div>`;view.querySelector('#pasteBtn').onclick=paste;}
 draw();}
