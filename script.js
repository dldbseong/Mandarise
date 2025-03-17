const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginButton = document.getElementById('login-button');
const usernameInput = document.getElementById('username');
const saveButton = document.getElementById('save-button');
const logoutButton = document.getElementById('logout-button');

let currentUser = null;

// 로그인 함수
function loginUser() {
  const username = usernameInput.value.trim();
  if (!username) {
    alert('사용자 이름을 입력해 주세요.');
    return;
  }

  currentUser = username;
  localStorage.setItem('currentUser', username);

  loginContainer.style.display = 'none';
  appContainer.style.display = 'block';

  loadMandarat();
}

// 저장된 사용자 확인
function checkLoginStatus() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = savedUser;
    loginContainer.style.display = 'none';
    appContainer.style.display = 'block';
    loadMandarat();
  }
}

// 만다라트 데이터 저장
function saveMandarat() {
  if (!currentUser) return;
  
  const data = {};
  document.querySelectorAll('.input-box').forEach((input) => {
    data[input.dataset.key] = input.innerText;
  });

  localStorage.setItem(`mandarat_${currentUser}`, JSON.stringify(data));
  alert('저장되었습니다!');
}

// 만다라트 데이터 불러오기
function loadMandarat() {
  if (!currentUser) return;

  const savedData = localStorage.getItem(`mandarat_${currentUser}`);
  if (savedData) {
    const mandaratData = JSON.parse(savedData);
    document.querySelectorAll('.input-box').forEach((input) => {
      if (mandaratData[input.dataset.key]) {
        input.innerText = mandaratData[input.dataset.key];
      }
    });
  }
}

// 로그아웃
function logoutUser() {
  localStorage.removeItem('currentUser');
  currentUser = null;

  appContainer.style.display = 'none';
  loginContainer.style.display = 'flex';
}

// 로그인 버튼 이벤트
loginButton.addEventListener('click', loginUser);

// 저장 버튼 이벤트
saveButton.addEventListener('click', saveMandarat);

// 로그아웃 버튼 이벤트
logoutButton.addEventListener('click', logoutUser);

// 자동 로그인 확인
checkLoginStatus();

// 만다라트 그리드 생성
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
    inputDiv.dataset.prev = '';

    let regionIndex = i + 1;
    let cellIndex = j + 1;
    let syncKey = `${regionIndex}-${cellIndex}`;

    inputDiv.dataset.key = syncKey;
    cell.appendChild(inputDiv);
    region.appendChild(cell);

    if (regionIndex === 5 && cellIndex === 5) {
      cell.style.backgroundColor = 'lightcoral';
    } else if (regionIndex === 5 || cellIndex === 5) {
      cell.style.backgroundColor = 'lightblue';
    }
  }
}
