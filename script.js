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