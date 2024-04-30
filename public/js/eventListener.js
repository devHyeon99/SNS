import { registerUser, loginUser } from './apiRequests.js';

// 회원가입 버튼 클릭 이벤트 처리
export function signBtn() {
  const button = document.querySelector('#signBtn');
  button.addEventListener('click', () => {
    console.log('회원가입');
    const email = document.getElementById("emailInput").value;
    const nickname = document.getElementById("nicknameInput").value;
    const password = document.getElementById("passwordInput").value;
    console.log(email, nickname, password);

    if (validateInputs(email, nickname, password)) {
      const userData = {
        Email: email,
        ID: nickname,
        Password: password
      };
      registerUser(userData);
    }
  });

  // 입력값 검증
  function validateInputs(email, nickname, password) {
    if (email.trim() === "" || nickname.trim() === "" || password.trim() === "") {
      console.log("빈칸");
      return false;
    }
    return true;
  }
}

// 회원가입 인풋 형식 체크 이벤트 처리
export function verifyInput() {
  const emailInput = document.getElementById('emailInput');
  const nicknameInput = document.getElementById('nicknameInput');
  const passwordInput = document.getElementById('passwordInput');
  const signBtn = document.getElementById('signBtn');

  emailInput.addEventListener('input', validateEmail);
  nicknameInput.addEventListener('input', validateNickname);
  passwordInput.addEventListener('input', validatePassword);

  // 이메일 형식 체크
  function validateEmail() {
    const email = emailInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    updateValidity(emailInput, emailPattern.test(email));
    checkValidity();
  }

  // 닉네임 형식 체크
  function validateNickname() {
    const nickname = nicknameInput.value;
    const koreanEnglishRegex = /^[가-힣a-zA-Z0-9]+$/;
    const byteCount = getByteLength(nickname);

    const isValid = byteCount >= 4 && koreanEnglishRegex.test(nickname);
    updateValidity(nicknameInput, isValid);
    checkValidity();
  }

  // 비밀번호 형식 체크
  function validatePassword() {
    const password = passwordInput.value;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const isValid = password.length >= 6 && hasNumber && hasLetter;

    updateValidity(passwordInput, isValid);
    checkValidity();
  }

  // 입력 형식 검증 함수
  function updateValidity(inputElement, isValid) {
    inputElement.classList.toggle('is-valid', isValid);
    inputElement.classList.toggle('is-invalid', !isValid);
  }

  // 회원가입 버튼 활성화 함수 및 팝오버로 형식 알려주는 함수
  function checkValidity() {
    const elementsToCheck = [
      { input: emailInput, popoverSelector: '[data-bs-toggle="popover"]' },
      { input: nicknameInput, popoverSelector: '[data-bs-toggle="popover2"]' },
      { input: passwordInput, popoverSelector: '[data-bs-toggle="popover3"]' },
    ];

    elementsToCheck.forEach(({ input, popoverSelector }) => {
      const isInputValid = input.classList.contains('is-valid');
      const isInputInvalid = input.classList.contains('is-invalid');
      const activeElement = document.activeElement;

      if (activeElement === input && isInputInvalid) {
        activatePopover(popoverSelector);
      } else {
        const existingPopover = bootstrap.Popover.getInstance(input);
        if (existingPopover && isInputValid) {
          existingPopover.hide();
        }
      }
    });

    const isEmailValid = emailInput.classList.contains('is-valid');
    const isNicknameValid = nicknameInput.classList.contains('is-valid');
    const isPasswordValid = passwordInput.classList.contains('is-valid');

    signBtn.disabled = !(isEmailValid && isNicknameValid && isPasswordValid);
  }

  // 팝오버 활성화 함수
  function activatePopover(selector) {
    const popoverTriggerList = Array.from(document.querySelectorAll(selector));
    popoverTriggerList.forEach((popoverTriggerEl) => {
      const isInvalid = popoverTriggerEl.classList.contains('is-invalid');
      const existingPopover = bootstrap.Popover.getInstance(popoverTriggerEl);

      if (isInvalid && !existingPopover) {
        const popover = new bootstrap.Popover(popoverTriggerEl);
        popover.show(); // 팝오버 보이기
      }
    });
  }

  // 영문 + 한글 바이트 사이즈 호출 함수
  function getByteLength(str) {
    return new Blob([str], { type: 'text/plain; charset=utf-8' }).size;
  }
}

// 로그인 버튼 클릭 이벤트 처리
export function loginBtn() {
  const button = document.querySelector('#loginBtn');
  button.addEventListener('click', () => {
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    if (validateInputs(emailInput.value, passwordInput.value)) {
      const userData = {
        Email: emailInput.value,
        Password: passwordInput.value
      };
      loginUser(userData);
    }
  });

  // 입력값 검증
  function validateInputs(email, password) {
    if (email.trim() === "" || password.trim() === "") {
      console.log("빈칸");
      return false;
    }
    return true;
  }
}