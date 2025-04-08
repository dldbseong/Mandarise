const grid = document.querySelector('.grid');
const syncMap = {};
const colorSyncMap = {};

for (let i = 0; i < 9; i++) {
  const region = document.createElement('div');
  region.classList.add('region');
  grid.appendChild(region);

  for (let j = 0; j < 9; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('input-box');
    inputDiv.contentEditable = "true";
    // 이전 유효 텍스트 저장 (칸 제한을 위해)
    inputDiv.dataset.prev = '';

    let regionIndex = i + 1;
    let cellIndex = j + 1;
    let syncKey = `${regionIndex}-${cellIndex}`;

    // 동기화 매핑: 5번 구역의 대응 칸과 동기화 (단, 5번 구역의 5번 칸 제외)
    if (regionIndex !== 5 && cellIndex === 5) {
      let targetKey = `5-${regionIndex}`;
      syncMap[syncKey] = targetKey;
      syncMap[targetKey] = syncKey;
      colorSyncMap[syncKey] = targetKey;
      colorSyncMap[targetKey] = syncKey;
    }

    inputDiv.addEventListener('input', (e) => {
      let value = e.target.innerText;
      // 내용이 칸의 크기를 초과하면 이전 값으로 복구하고 흔들림 효과 적용
      if (e.target.scrollHeight > e.target.clientHeight) {
        e.target.innerText = e.target.dataset.prev;
        cell.classList.add('shake');
        setTimeout(() => cell.classList.remove('shake'), 300);
        return;
      } else {
        e.target.dataset.prev = value;
        if (syncMap[syncKey]) {
          let target = document.querySelector(`[data-key='${syncMap[syncKey]}']`);
          if (target) {
            target.innerText = value;
            target.dataset.prev = value;
          }
        }
      }
    });

    cell.addEventListener('mouseenter', () => {
      inputDiv.style.color = 'black';
    });
    cell.addEventListener('mouseleave', () => {
      inputDiv.style.color = '';
    });

    cell.appendChild(inputDiv);
    region.appendChild(cell);
    inputDiv.dataset.key = syncKey;

    // 색상 설정: 5번 구역의 중앙 칸은 3번째 색, 나머지는 2번째 색 적용
    if (regionIndex === 5 && cellIndex === 5) {
      cell.style.backgroundColor = 'lightcoral';
    } else if (regionIndex === 5 || cellIndex === 5) {
      cell.style.backgroundColor = 'lightblue';
    }
  }
}
