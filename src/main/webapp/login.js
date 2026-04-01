const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');
const loginBtn = document.getElementById('loginBtn');

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginEmailError = document.getElementById('loginEmailError');
const loginPasswordError = document.getElementById('loginPasswordError');
const loginGlobalError = document.getElementById('loginGlobalError');
const forgetPasswordLink = document.getElementById('forgetPasswordLink');
const rememberMe = document.getElementById('rememberMe');

const adminEntryBtn = document.getElementById('adminEntryBtn');

const registerBtn = document.getElementById('registerBtn');

const registerName = document.getElementById('registerName');
const registerStudentNo = document.getElementById('registerStudentNo');
const registerMajor = document.getElementById('registerMajor');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');

const registerNameError = document.getElementById('registerNameError');
const registerStudentNoError = document.getElementById('registerStudentNoError');
const registerMajorError = document.getElementById('registerMajorError');
const registerEmailError = document.getElementById('registerEmailError');
const registerPasswordError = document.getElementById('registerPasswordError');
const registerConfirmPasswordError = document.getElementById('registerConfirmPasswordError');

const registerGlobalError = document.getElementById('registerGlobalError');
const registerSuccessMsg = document.getElementById('registerSuccessMsg');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach((item) => item.classList.remove('active'));
    contents.forEach((item) => item.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(`${target}-content`).classList.add('active');

    clearLoginErrors();
    clearRegisterErrors();
  });
});

function setFieldError(inputEl, errorEl, message) {
  if (!inputEl || !errorEl) return;
  inputEl.classList.add('input-error');
  inputEl.classList.remove('input-success');
  errorEl.textContent = message;
}

function setFieldSuccess(inputEl, errorEl) {
  if (!inputEl || !errorEl) return;
  inputEl.classList.remove('input-error');
  inputEl.classList.add('input-success');
  errorEl.textContent = '';
}

function clearFieldState(inputEl, errorEl) {
  if (!inputEl || !errorEl) return;
  inputEl.classList.remove('input-error', 'input-success');
  errorEl.textContent = '';
}

function clearLoginErrors() {
  clearFieldState(loginEmail, loginEmailError);
  clearFieldState(loginPassword, loginPasswordError);
  if (loginGlobalError) {
    loginGlobalError.textContent = '';
    loginGlobalError.classList.add('hidden');
  }
}

function clearRegisterErrors() {
  clearFieldState(registerName, registerNameError);
  clearFieldState(registerStudentNo, registerStudentNoError);
  clearFieldState(registerMajor, registerMajorError);
  clearFieldState(registerEmail, registerEmailError);
  clearFieldState(registerPassword, registerPasswordError);
  clearFieldState(registerConfirmPassword, registerConfirmPasswordError);

  if (registerGlobalError) {
    registerGlobalError.textContent = '';
    registerGlobalError.classList.add('hidden');
  }

  if (registerSuccessMsg) {
    registerSuccessMsg.textContent = '';
    registerSuccessMsg.classList.add('hidden');
  }
}

function isValidSchoolEmail(email) {
  const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRule.test(email);
}

function validateStudentNo(studentNo) {
  return /^\d{6,20}$/.test(studentNo);
}

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem('tc_registered_users')) || [];
  } catch (e) {
    return [];
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem('tc_registered_users', JSON.stringify(users));
}

function validateLoginForm() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  let valid = true;

  clearLoginErrors();

  if (!email) {
    setFieldError(loginEmail, loginEmailError, '请输入学校邮箱');
    valid = false;
  } else if (!isValidSchoolEmail(email)) {
    setFieldError(loginEmail, loginEmailError, '请输入正确的邮箱格式');
    valid = false;
  } else {
    setFieldSuccess(loginEmail, loginEmailError);
  }

  if (!password) {
    setFieldError(loginPassword, loginPasswordError, '请输入密码');
    valid = false;
  } else if (password.length < 6) {
    setFieldError(loginPassword, loginPasswordError, '密码长度不能少于 6 位');
    valid = false;
  } else {
    setFieldSuccess(loginPassword, loginPasswordError);
  }

  if (!valid && loginGlobalError) {
    loginGlobalError.textContent = '请先完善登录信息后再继续';
    loginGlobalError.classList.remove('hidden');
  }

  return valid;
}

function validateRegisterForm() {
  const name = registerName?.value.trim() || '';
  const studentNo = registerStudentNo?.value.trim() || '';
  const major = registerMajor?.value.trim() || '';
  const email = registerEmail?.value.trim() || '';
  const password = registerPassword?.value.trim() || '';
  const confirmPassword = registerConfirmPassword?.value.trim() || '';

  let valid = true;
  clearRegisterErrors();

  if (!name) {
    setFieldError(registerName, registerNameError, '请输入姓名');
    valid = false;
  } else {
    setFieldSuccess(registerName, registerNameError);
  }

  if (!studentNo) {
    setFieldError(registerStudentNo, registerStudentNoError, '请输入学号');
    valid = false;
  } else if (!validateStudentNo(studentNo)) {
    setFieldError(registerStudentNo, registerStudentNoError, '学号应为 6 到 20 位数字');
    valid = false;
  } else {
    setFieldSuccess(registerStudentNo, registerStudentNoError);
  }

  if (!major) {
    setFieldError(registerMajor, registerMajorError, '请输入专业');
    valid = false;
  } else {
    setFieldSuccess(registerMajor, registerMajorError);
  }

  if (!email) {
    setFieldError(registerEmail, registerEmailError, '请输入学校邮箱');
    valid = false;
  } else if (!isValidSchoolEmail(email)) {
    setFieldError(registerEmail, registerEmailError, '请输入正确的邮箱格式');
    valid = false;
  } else {
    setFieldSuccess(registerEmail, registerEmailError);
  }

  if (!password) {
    setFieldError(registerPassword, registerPasswordError, '请输入密码');
    valid = false;
  } else if (password.length < 6) {
    setFieldError(registerPassword, registerPasswordError, '密码长度不能少于 6 位');
    valid = false;
  } else {
    setFieldSuccess(registerPassword, registerPasswordError);
  }

  if (!confirmPassword) {
    setFieldError(registerConfirmPassword, registerConfirmPasswordError, '请再次输入密码');
    valid = false;
  } else if (confirmPassword !== password) {
    setFieldError(registerConfirmPassword, registerConfirmPasswordError, '两次输入的密码不一致');
    valid = false;
  } else {
    setFieldSuccess(registerConfirmPassword, registerConfirmPasswordError);
  }

  if (!valid && registerGlobalError) {
    registerGlobalError.textContent = '请先完善注册信息后再继续';
    registerGlobalError.classList.remove('hidden');
  }

  return valid;
}

function registerUser() {
  const users = getRegisteredUsers();

  const newUser = {
    id: `user_${Date.now()}`,
    realName: registerName.value.trim(),
    nickname: registerName.value.trim(),
    studentNo: registerStudentNo.value.trim(),
    major: registerMajor.value.trim(),
    schoolEmail: registerEmail.value.trim(),
    password: registerPassword.value.trim(),
    grade: '大二',
    avatar: '',
    bio: '这个人很低调，还没写简介。',
    role: 'student',
    trustScore: 95,
    createdAt: new Date().toISOString()
  };

  const duplicated = users.some(
      (item) =>
          item.studentNo === newUser.studentNo ||
          item.schoolEmail === newUser.schoolEmail
  );

  if (duplicated) {
    if (registerGlobalError) {
      registerGlobalError.textContent = '该学号或邮箱已注册，请直接登录';
      registerGlobalError.classList.remove('hidden');
    }
    return false;
  }

  users.push(newUser);
  saveRegisteredUsers(users);
  return true;
}

function getDefaultStudentProfile(email) {
  const emailPrefix = email.split('@')[0] || 'student';

  return {
    id: `user_${Date.now()}`,
    nickname: emailPrefix,
    realName: emailPrefix,
    studentNo: '20260001',
    schoolEmail: email,
    major: '软件工程',
    grade: '大二',
    avatar: '',
    bio: '这个人很低调，还没写简介。',
    role: 'student',
    trustScore: 95,
    loginTime: new Date().toISOString()
  };
}

function saveLoginState() {
  const email = loginEmail.value.trim();
  const remember = !!rememberMe?.checked;

  const users = getRegisteredUsers();
  const matchedUser =
      users.find((item) => item.schoolEmail === email) || getDefaultStudentProfile(email);

  const userProfile = {
    ...matchedUser,
    loginTime: new Date().toISOString()
  };

  const authState = {
    isLoggedIn: true,
    role: 'student',
    account: email,
    rememberMe: remember,
    loginAt: new Date().toISOString()
  };

  localStorage.setItem('tc_current_user', JSON.stringify(userProfile));
  localStorage.setItem('tc_auth', JSON.stringify(authState));

  if (remember) {
    localStorage.setItem('tc_remembered_email', email);
  } else {
    localStorage.removeItem('tc_remembered_email');
  }
}

function restoreRememberedEmail() {
  const rememberedEmail = localStorage.getItem('tc_remembered_email');
  if (rememberedEmail && loginEmail) {
    loginEmail.value = rememberedEmail;
    if (rememberMe) rememberMe.checked = true;
  }
}

if (loginEmail) {
  loginEmail.addEventListener('input', () => {
    if (!loginEmail.value.trim()) {
      clearFieldState(loginEmail, loginEmailError);
      return;
    }

    if (isValidSchoolEmail(loginEmail.value.trim())) {
      setFieldSuccess(loginEmail, loginEmailError);
    }
  });
}

if (loginPassword) {
  loginPassword.addEventListener('input', () => {
    if (!loginPassword.value.trim()) {
      clearFieldState(loginPassword, loginPasswordError);
      return;
    }

    if (loginPassword.value.trim().length >= 6) {
      setFieldSuccess(loginPassword, loginPasswordError);
    }
  });
}

[registerName, registerStudentNo, registerMajor, registerEmail, registerPassword, registerConfirmPassword].forEach((input) => {
  if (!input) return;

  input.addEventListener('input', () => {
    if (input === registerName && input.value.trim()) {
      setFieldSuccess(registerName, registerNameError);
    }

    if (input === registerStudentNo) {
      if (!input.value.trim()) {
        clearFieldState(registerStudentNo, registerStudentNoError);
      } else if (validateStudentNo(input.value.trim())) {
        setFieldSuccess(registerStudentNo, registerStudentNoError);
      }
    }

    if (input === registerMajor && input.value.trim()) {
      setFieldSuccess(registerMajor, registerMajorError);
    }

    if (input === registerEmail) {
      if (!input.value.trim()) {
        clearFieldState(registerEmail, registerEmailError);
      } else if (isValidSchoolEmail(input.value.trim())) {
        setFieldSuccess(registerEmail, registerEmailError);
      }
    }

    if (input === registerPassword) {
      if (!input.value.trim()) {
        clearFieldState(registerPassword, registerPasswordError);
      } else if (input.value.trim().length >= 6) {
        setFieldSuccess(registerPassword, registerPasswordError);
      }
    }

    if (input === registerConfirmPassword) {
      if (!input.value.trim()) {
        clearFieldState(registerConfirmPassword, registerConfirmPasswordError);
      } else if (input.value.trim() === registerPassword.value.trim()) {
        setFieldSuccess(registerConfirmPassword, registerConfirmPasswordError);
      }
    }
  });
});

if (forgetPasswordLink) {
  forgetPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('当前为前端演示版本，忘记密码功能后续可接后端或邮箱找回流程。');
  });
}

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const valid = validateLoginForm();
    if (!valid) return;

    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';

    setTimeout(() => {
      saveLoginState();
      loginBtn.disabled = false;
      loginBtn.textContent = '登录';
      window.location.href = 'home.html';
    }, 500);
  });
}

if (registerBtn) {
  registerBtn.addEventListener('click', () => {
    const valid = validateRegisterForm();
    if (!valid) return;

    registerBtn.disabled = true;
    registerBtn.textContent = '注册中...';

    setTimeout(() => {
      const success = registerUser();

      registerBtn.disabled = false;
      registerBtn.textContent = '注册';

      if (!success) return;

      if (registerSuccessMsg) {
        registerSuccessMsg.textContent = '注册成功，请使用刚刚注册的邮箱登录';
        registerSuccessMsg.classList.remove('hidden');
      }

      if (loginEmail) loginEmail.value = registerEmail.value.trim();
      if (loginPassword) loginPassword.value = registerPassword.value.trim();

      registerName.value = '';
      registerStudentNo.value = '';
      registerMajor.value = '';
      registerEmail.value = '';
      registerPassword.value = '';
      registerConfirmPassword.value = '';

      setTimeout(() => {
        tabs.forEach((item) => item.classList.remove('active'));
        contents.forEach((item) => item.classList.remove('active'));

        const loginTab = document.querySelector('.tab[data-tab="login"]');
        const loginContent = document.getElementById('login-content');

        if (loginTab) loginTab.classList.add('active');
        if (loginContent) loginContent.classList.add('active');

        clearRegisterErrors();
      }, 800);
    }, 500);
  });
}

if (typeof bindAdminEntry === 'function') {
  bindAdminEntry('#adminEntryBtn');
}

restoreRememberedEmail();