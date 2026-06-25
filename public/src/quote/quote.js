import { money, floor1000 } from '../shared/app.js';

function uniq(arr) {
  return [...new Set(arr.filter(v => v !== undefined && v !== null && String(v).trim() !== ''))];
}
function hpVal(v) {
  const n = parseFloat(String(v || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function labelFor(p) {
  if (p['제품구분'] === '싱글형') return `싱글 ${p['형식'] || '장비'}`;
  if (p['구분'] === '실외기') return p['세부타입'] ? `${p['세부타입']} 실외기` : '멀티 실외기';
  if (p['구분'] === '판넬') return '전용 판넬';
  return `${p['형식'] || '멀티'} 실내기`;
}
function discounted(p, quoteType, outDc, inDc) {
  let dc = 0;
  if (quoteType === 'multi') dc = p['구분'] === '실외기' ? outDc : inDc;
  return floor1000((Number(p['공급가']) || 0) * (1 - dc / 100));
}
function optionText(p, quoteType, outDc, inDc) {
  const hp = p['마력'] ? `${p['마력']}HP` : '-';
  const area = p['평형'] ? `${p['평형']}평` : '-';
  const price = money(discounted(p, quoteType, outDc, inDc));
  return `${p['모델명']} · ${hp} · ${area} · ${price}`;
}

export function renderQuote(view, state) {
  let quoteType = 'single';
  let qitems = [];
  let outDc = 30;
  let inDc = 30;

  const products = () => state.products.filter(p =>
    quoteType === 'single' ? p['제품구분'] === '싱글형' : p['제품구분'] === '멀티형'
  );
  const total = () => qitems.reduce((a, it) => a + it.price * it.qty, 0);
  const multiSummary = () => {
    if (quoteType !== 'multi') return '';
    const out = qitems.filter(x => x.kind === '실외기').reduce((a, x) => a + hpVal(x.hp) * x.qty, 0);
    const ind = qitems.filter(x => x.kind === '실내기').reduce((a, x) => a + hpVal(x.hp) * x.qty, 0);
    const rate = out ? Math.round((ind / out) * 100) : 0;
    const cls = rate > 130 ? 'bad' : rate > 100 ? 'warn' : 'ok';
    return `<span class="pill ${cls}">연결률 ${rate || 0}% ${rate > 130 ? '등록불가' : rate > 100 ? '경고' : ''}</span>`;
  };

  function draw() {
    view.innerHTML = `
      <div class="quote-head">
        <h1 class="page-title">견적관리</h1>
        <div class="seg">
          <button class="${quoteType === 'single' ? 'active' : ''}" id="singleBtn">싱글형 견적서</button>
          <button class="${quoteType === 'multi' ? 'active' : ''}" id="multiBtn">멀티형 견적서</button>
        </div>
      </div>
      <section class="card">
        <h3>고객 / 제출 업체 정보</h3>
        <div class="form-grid compact">
          <label>고객명<input id="cust" placeholder="고객명"></label>
          <label>연락처<input placeholder="010-"></label>
          <label>현장명<input placeholder="현장명"></label>
          <label>상호<input value="라온이앤지"></label>
          <label>담당<input value="안수원"></label>
        </div>
      </section>
      <section class="card quote-select" style="margin-top:12px">
        <div class="row between"><h3>장비 선택</h3><span id="modelCount" class="pill muted">0개 모델</span></div>
        ${quoteType === 'multi' ? `<div class="summary">
          <span class="pill">실외기 DC <select id="outDc">${Array.from({ length: 21 }, (_, i) => 30 + i).map(v => `<option ${v === outDc ? 'selected' : ''}>${v}</option>`).join('')}</select>%</span>
          <span class="pill">실내기/판넬 DC <select id="inDc">${Array.from({ length: 21 }, (_, i) => 30 + i).map(v => `<option ${v === inDc ? 'selected' : ''}>${v}</option>`).join('')}</select>%</span>
          <span class="pill muted">DC율은 내부용, 고객 견적서 미표시</span>
        </div>` : '<p class="muted">싱글형은 무선리모컨 기본 포함, 유선리모컨은 선택 구매입니다.</p>'}
        <div class="form-grid compact" style="margin-top:10px">
          <label>용도<select id="usage"></select></label>
          <label>구분<select id="part"></select></label>
          <label>형식<select id="type"></select></label>
          <label>모델명<select id="model"></select></label>
          <label>수량<input id="qty" type="number" min="1" value="1"></label>
        </div>
        <div style="margin-top:10px"><button class="btn" id="addEq">장비 추가</button> <a class="btn light" href="/data/RAON_Product_DB_v2.xlsx" download>제품 DB 엑셀</a></div>
      </section>
      <section class="card" style="margin-top:12px">
        <h3>견적 항목</h3>
        <table class="table"><thead><tr><th>품목</th><th>제품명</th><th>수량</th><th>단가</th><th>금액</th><th></th></tr></thead>
        <tbody>${qitems.map((it, i) => `<tr><td>${it.item}</td><td>${it.model}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${money(it.price * it.qty)}</td><td><button class="btn light" data-edit="${i}">수정</button> <button class="btn red" data-del="${i}">삭제</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">장비를 추가하세요.</td></tr>'}</tbody></table>
        <div class="summary" style="margin-top:10px">${multiSummary()}<span class="pill">공급가 ${money(total())}</span><span class="pill">VAT ${money(floor1000(total() * 0.1))}</span><span class="pill ok">총액 ${money(total() + floor1000(total() * 0.1))}</span></div>
      </section>`;
    bind();
  }

  function setOptions(sel, values, formatter = v => v) {
    const prev = sel.value;
    sel.innerHTML = values.map(v => `<option value="${String(v).replace(/"/g, '&quot;')}">${formatter(v)}</option>`).join('');
    sel.value = values.includes(prev) ? prev : (values[0] || '');
  }
  function fillUse() {
    const base = products();
    setOptions(view.querySelector('#usage'), uniq(base.map(p => p['용도'])));
    fillPart();
  }
  function fillPart() {
    const usage = view.querySelector('#usage').value;
    const base = products().filter(p => p['용도'] === usage);
    setOptions(view.querySelector('#part'), uniq(base.map(p => p['구분'])));
    fillType();
  }
  function fillType() {
    const usage = view.querySelector('#usage').value;
    const part = view.querySelector('#part').value;
    const base = products().filter(p => p['용도'] === usage && p['구분'] === part);
    setOptions(view.querySelector('#type'), uniq(base.map(p => p['형식'])));
    fillModel();
  }
  function fillModel() {
    const usage = view.querySelector('#usage').value;
    const part = view.querySelector('#part').value;
    const type = view.querySelector('#type').value;
    const base = products().filter(p => p['용도'] === usage && p['구분'] === part && p['형식'] === type);
    const modelSel = view.querySelector('#model');
    modelSel.innerHTML = base.map(p => `<option value="${String(p['모델명']).replace(/"/g, '&quot;')}">${optionText(p, quoteType, outDc, inDc)}</option>`).join('');
    view.querySelector('#modelCount').textContent = `${base.length}개 모델`;
  }
  function selectedProduct() {
    const model = view.querySelector('#model').value;
    const usage = view.querySelector('#usage').value;
    const part = view.querySelector('#part').value;
    const type = view.querySelector('#type').value;
    return products().find(p => p['모델명'] === model && p['용도'] === usage && p['구분'] === part && p['형식'] === type);
  }
  function autoPanel(p) {
    const m = p['모델명'] || '';
    if (m.includes('RNQ02') || m.includes('RNQ023') || m.includes('RNQ032') || m.includes('RNQ040')) return m.includes('1C2SP') ? 'PFP-XU0UW' : 'PFP-WU2SW';
    if (m.includes('RNQ052') || m.includes('RNQ060') || m.includes('RNQ072')) return m.includes('1C2SP') ? 'PFP-XT0UW' : 'PFP-WT2SW';
    if (m.startsWith('RNW') && p['형식'] === '2Way') return 'PFP-WS0SW';
    if (m.startsWith('RNW') && p['형식'] === '4WAY') return p['세부타입'] === '싱글베인' ? 'PFP-WM5SW' : 'PFP-WA4CW';
    if (m.startsWith('RNW') && String(p['형식']).includes('원형')) return 'PFP-WV0SW';
    return '';
  }

  function bind() {
    view.querySelector('#singleBtn').onclick = () => { quoteType = 'single'; qitems = []; draw(); };
    view.querySelector('#multiBtn').onclick = () => { quoteType = 'multi'; qitems = []; draw(); };
    view.querySelector('#usage').onchange = fillPart;
    view.querySelector('#part').onchange = fillType;
    view.querySelector('#type').onchange = fillModel;
    if (quoteType === 'multi') {
      view.querySelector('#outDc').onchange = e => { outDc = Number(e.target.value); draw(); };
      view.querySelector('#inDc').onchange = e => { inDc = Number(e.target.value); draw(); };
    }
    fillUse();
    view.querySelector('#addEq').onclick = () => {
      const p = selectedProduct();
      if (!p) return alert('모델을 선택하세요.');
      const qty = Number(view.querySelector('#qty').value) || 1;
      const price = discounted(p, quoteType, outDc, inDc);
      qitems.push({ item: labelFor(p), model: p['모델명'], qty, price, hp: p['마력'], kind: p['구분'] });
      if (quoteType === 'multi' && p['구분'] === '실내기') {
        const panel = autoPanel(p);
        if (panel) qitems.push({ item: '전용 판넬', model: panel, qty, price: 0, hp: 0, kind: '판넬' });
      }
      draw();
    };
    view.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (confirm('삭제하시겠습니까?')) { qitems.splice(Number(b.dataset.del), 1); draw(); } });
    view.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => { const i = Number(b.dataset.edit); const q = prompt('수량', qitems[i].qty); if (q) { qitems[i].qty = Number(q) || 1; draw(); } });
  }
  draw();
}
