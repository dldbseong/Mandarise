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
    cell.dataset.zone = regionIndex;
    cell.dataset.cell = cellIndex;
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

async function saveMandarat() {
  // 1) 캡처할 DOM 요소 선택
  const gridEl = document.getElementById('mandarat-grid');
  // 2) html2canvas로 캔버스 생성
  const canvas = await html2canvas(gridEl, { backgroundColor: null, scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  // 3) jsPDF로 PDF 문서 생성
  const { jsPDF } = window.jspdf;
  // A4용지 기준 가로/세로 단위(포인트)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });
  // 페이지 폭/높이 계산
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  // 캔버스 크기 비율 계산 (A4 폭에 맞추고 비율 유지)
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth  = pageWidth - 40; // 좌우 여백 20pt씩
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  // 4) PDF에 이미지 삽입
  pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
  // 5) 다운로드
  pdf.save('mandarat_capture.pdf');
}

function resetMandarat() {
  if (!confirm('입력한 모든 내용과 색상이 초기화 됩니다. 계속하시겠습니까?')) return;

  document.querySelectorAll('.cell').forEach(cell => {
    const input = cell.querySelector('.input-box');
    // 1) 텍스트, 설명, 완료 플래그 초기화
    input.innerText = '';
    delete input.dataset.main;
    delete input.dataset.desc;
    delete input.dataset.done;

    // 2) .done 클래스 제거 (체크표시 초기화)
    cell.classList.remove('done');

    // 3) 배경색 기본값으로 초기화
    const zone = parseInt(cell.dataset.zone, 10);
    const idx  = parseInt(cell.dataset.cell, 10);
    if (zone === 5 && idx === 5) {
      cell.style.backgroundColor = 'lightcoral';
    } else if (zone === 5 || idx === 5) {
      cell.style.backgroundColor = 'lightblue';
    } else {
      cell.style.backgroundColor = 'white';
    }
  });

  // 4) 로컬 스토리지 초기화
  localStorage.removeItem('mandaratData');
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
const fldColor   = document.getElementById('editor-color');
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

// 셀 데이터를 동기화할 헬퍼 함수
function syncCellData(zoneIdx, cellIdx, main, desc, done, color) {
  const selector = `.input-box[data-key="${zoneIdx}-${cellIdx}"]`;
  const input = document.querySelector(selector);
  if (!input) return;

  // 1) 데이터 속성
  input.dataset.main = main;
  input.dataset.desc = desc;
  input.dataset.done = done;

  // 2) 화면 표시
  input.innerText = main;
  const cellEl = input.parentElement;
  cellEl.style.backgroundColor = color;

  // 3) 완료 표시 스타일 토글
  if (done) cellEl.classList.add('done');
  else      cellEl.classList.remove('done');
}

btnSave.onclick = () => {
  if (!currentCell) return;

  // 1) 입력값 수집
  const main  = fldMain.value;
  const desc  = fldDesc.value;
  const done  = fldDone.checked;
  // 모달 미리보기 박스의 실제 배경색을 가져옵니다
  const color = window.getComputedStyle(previewBox).backgroundColor;

  // 2) 현재 칸 정보
  const zone0 = parseInt(currentCell.dataset.zone, 10);
  const cell0 = parseInt(currentCell.dataset.cell, 10);

  // 3) 주체 칸 업데이트
  syncCellData(zone0, cell0, main, desc, done, color);

  // 4) 동기화 대상 업데이트
  // 1) 내가 5번 칸(각 구역의 중앙)이라면 -> 5번 구역의 cell0번 칸
  if (cell0 === 5 && zone0 !== 5) {
    syncCellData(5, zone0, main, desc, done, color);
  }
  // 2) 내가 5번 구역의 칸(cell0번)이라면 -> cell0 구역의 5번 칸
  else if (zone0 === 5 && cell0 !== 5) {
    syncCellData(cell0, 5, main, desc, done, color);
  }

  // 5) 모달 닫기
  overlay.classList.remove('open');
};
