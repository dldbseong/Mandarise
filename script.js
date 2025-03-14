// 로그인 UI 생성 및 연동
const loginContainer = document.createElement('div');
loginContainer.style.position = 'absolute';
loginContainer.style.top = '10px';
loginContainer.style.left = '10px';
loginContainer.style.backgroundColor = 'rgba(255,255,255,0.95)';
loginContainer.style.padding = '10px';
loginContainer.style.border = '1px solid #ccc';
loginContainer.style.borderRadius = '5px';
loginContainer.style.zIndex = '1000';

const usernameInput = document.createElement('input');
usernameInput.type = 'text';
usernameInput.placeholder = 'Username';
usernameInput.style.marginBottom = '5px';
usernameInput.style.display = 'block';
usernameInput.style.width = '150px';

const passwordInput = document.createElement('input');
passwordInput.type = 'password';
passwordInput.placeholder = 'Password';
passwordInput.style.marginBottom = '5px';
passwordInput.style.display = 'block';
passwordInput.style.width = '150px';

const loginButton = document.createElement('button');
loginButton.innerText = 'Login';
loginButton.style.display = 'block';
loginButton.style.width = '150px';

loginContainer.appendChild(usernameInput);
loginContainer.appendChild(passwordInput);
loginContainer.appendChild(loginButton);
document.body.appendChild(loginContainer);

function loginUser() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    alert('아이디와 비밀번호를 모두 입력해 주세요.');
    return;
  }
  // 예시: 항상 로그인 성공 (실제 구현 시 서버 연동 필요)
  alert('로그인 성공!');
  loginContainer.style.display = 'none';
  loadMandarat();
}

// localStorage에 저장된 만다라트 데이터를 불러오는 함수
function loadMandarat() {
  const savedData = localStorage.getItem('mandaratData');
  if (savedData) {
    const mandaratData = JSON.parse(savedData);
    for (const key in mandaratData) {
      const element = document.querySelector(`[data-key="${key}"]`);
      if (element) {
        element.innerText = mandaratData[key];
        element.dataset.prev = mandaratData[key];
      }
    }
  } else {
    console.log('저장된 만다라트 데이터가 없습니다.');
  }
}

loginButton.addEventListener('click', loginUser);

// 만다라트 그리드 생성 (기존 코드)
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
    // 이전 유효 텍스트 저장 (칸 제한 기능을 위해)
    inputDiv.dataset.prev = '';

    let regionIndex = i + 1;
    let cellIndex = j + 1;
    let syncKey = `${regionIndex}-${cellIndex}`;

    // 동기화 매핑: 5번 구역의 대응 칸과 동기화 (5번 칸 제외)
    if (regionIndex !== 5 && cellIndex === 5) {
      let targetKey = `5-${regionIndex}`;
      syncMap[syncKey] = targetKey;
      syncMap[targetKey] = syncKey;
      colorSyncMap[syncKey] = targetKey;
      colorSyncMap[targetKey] = syncKey;
    }

    inputDiv.addEventListener('input', (e) => {
      let value = e.target.innerText;
      // 칸의 내용이 칸의 크기를 초과하는지 검사
      if (e.target.scrollHeight > e.target.clientHeight) {
        // 초과하면 이전 값으로 되돌리고 흔들림 효과 적용
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

    // 색상 설정: 5번 구역의 중앙 칸은 3번째 색, 5번 구역의 나머지 칸은 2번째 색 적용
    if (regionIndex === 5 && cellIndex === 5) {
      cell.style.backgroundColor = 'lightcoral';
    } else if (regionIndex === 5 || cellIndex === 5) {
      cell.style.backgroundColor = 'lightblue';
    }
  }
}
