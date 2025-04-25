// Mandarate 그리드 생성 및 동기화 매핑
const syncMap = {};
const grid = document.getElementById('mandarat-grid');
for (let i = 0; i < 9; i++) {
  const region = document.createElement('div'); region.className = 'region';
  grid.appendChild(region);
  for (let j = 0; j < 9; j++) {
    const cell = document.createElement('div'); cell.className = 'cell';
    const inputDiv = document.createElement('div'); inputDiv.className = 'input-box'; inputDiv.contentEditable = true;
    inputDiv.dataset.prev = '';
    const regionIndex = i+1, cellIndex = j+1, key = `${regionIndex}-${cellIndex}`;
    inputDiv.dataset.key = key;
    cell.appendChild(inputDiv);
    region.appendChild(cell);
    // 중앙 동기화
    if (regionIndex !== 5 && cellIndex === 5) {
      const targetKey = `5-${regionIndex}`;
      syncMap[key] = targetKey;
      syncMap[targetKey] = key;
    }
    inputDiv.addEventListener('input', e => {
      const el = e.target;
      if (el.scrollHeight > el.clientHeight) {
        el.innerText = el.dataset.prev;
        el.parentElement.classList.add('shake');
        setTimeout(() => el.parentElement.classList.remove('shake'), 300);
      } else {
        el.dataset.prev = el.innerText;
        if (syncMap[key]) {
          const target = document.querySelector(`[data-key='${syncMap[key]}']`);
          if (target) target.innerText = el.innerText;
          target.dataset.prev = el.innerText;
        }
      }
    });
    cell.addEventListener('mouseenter', () => inputDiv.style.color = 'black');
    cell.addEventListener('mouseleave', () => inputDiv.style.color = '');

    // 색상 설정
    if (regionIndex === 5 && cellIndex === 5) cell.style.backgroundColor = 'lightcoral';
    else if (regionIndex === 5 || cellIndex === 5) cell.style.backgroundColor = 'lightblue';

    // 모달 열기 이벤트
    cell.addEventListener('click', () => openModal(regionIndex, cellIndex));
  }
}

// 저장 기능
async function saveMandarat() {
  const data = {};
  document.querySelectorAll('.input-box').forEach(el => data[el.dataset.key] = el.innerText);
  localStorage.setItem('mandaratData', JSON.stringify(data));
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFontSize(14);
  let y=40;
  doc.text('Mandarise 만다라트 저장 내용', 40, y);
  for (const key in data) {
    y += 20;
    if (y > 800) { doc.addPage(); y = 40; }
    doc.text(`${key}: ${data[key]}`, 40, y);
  }
  doc.save('mandarat.pdf');
  alert('만다라트가 저장되었고 PDF가 다운로드되었습니다!');
}

// 초기화 기능
function resetMandarat() {
  if (confirm('입력한 내용이 초기화 됩니다. 계속하시겠습니까?')) {
    document.querySelectorAll('.input-box').forEach(el => el.innerText = '');
    localStorage.removeItem('mandaratData');
  }
}

// 시작하기: 최상단 스크롤
function startNow() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FAQ 토글
document.querySelectorAll('.faq-item .faq-question').forEach(q => q.addEventListener('click', () => q.parentElement.classList.toggle('open')));

// 모달 구현 (생략)

window.saveMandarat = saveMandarat;
window.resetMandarat = resetMandarat;
window.startNow = startNow;


// 모달 참조
const overlay    = document.getElementById('cell-editor-overlay');
const btnClose   = overlay.querySelector('.modal-close');
const btnCancel  = document.getElementById('editor-cancel');
const btnSave    = document.getElementById('editor-save');
const fldMain    = document.getElementById('editor-main');
const fldDesc    = document.getElementById('editor-desc');
const fldDone    = document.getElementById('editor-done');
const colorBoxes = document.querySelectorAll('.color-picker-bar div');
const gridFull   = document.querySelector('.modal-grid-full');
const previewBox = document.querySelector('.modal-preview-box');

let currentCell, currentInput;

// 1) 모든 .cell 클릭 이벤트 (한 번 저장해도 계속 유지)
document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => {
    currentCell  = cell;
    currentInput = cell.querySelector('.input-box');

    // ▶ 그리드 풀 미리보기 갱신
    gridFull.innerHTML = '';
    document.querySelectorAll('.cell').forEach((c, idx) => {
      const d = document.createElement('div');
      // 현재 클릭 cell
      if (c === cell)       d.classList.add('current');
      // 연관 칸(같은 행 or 열)
      else if (c.dataset.zone === cell.dataset.zone || c.dataset.cell === cell.dataset.cell)
                            d.classList.add('related');
      gridFull.appendChild(d);
    });

    // ▶ 개별 미리보기 박스
    previewBox.innerText = currentInput.innerText;
    previewBox.style.backgroundColor = window.getComputedStyle(cell).backgroundColor;

    // ▶ 폼 필드 채우기
    fldMain.value = currentInput.dataset.main || '';
    fldDesc.value = currentInput.dataset.desc || '';
    fldDone.checked = currentInput.dataset.done === 'true';

    // ▶ 색상 팔레트 초기화
    colorBoxes.forEach(box => {
      box.style.background = box.dataset.color;
      box.onclick = () => {
        currentCell.style.backgroundColor = box.dataset.color;
        previewBox.style.backgroundColor = box.dataset.color;
      };
    });

    // 모달 열기
    overlay.classList.add('open');
  });
});

// 닫기
btnClose.onclick  = () => overlay.classList.remove('open');
btnCancel.onclick = () => overlay.classList.remove('open');

// 저장
btnSave.onclick = () => {
  // 데이터 속성에 저장
  currentInput.dataset.main = fldMain.value;
  currentInput.dataset.desc = fldDesc.value;
  currentInput.dataset.done = fldDone.checked;
  // 화면 미리보기에도 반영
  currentInput.innerText = fldMain.value;
  // 닫기
  overlay.classList.remove('open');
};
