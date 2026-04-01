function bindLogout(selector = '.logout', loginPage = 'login.html') {
  const logoutBtn = document.querySelector(selector);

  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    const ok = window.confirm('确认退出登录吗？');
    if (ok) {
      window.location.href = loginPage;
    }
  });
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('tc_current_user')) || null;
  } catch (e) {
    return null;
  }
}

function getAuthState() {
  try {
    return JSON.parse(localStorage.getItem('tc_auth')) || null;
  } catch (e) {
    return null;
  }
}

function isStudentLoggedIn() {
  const auth = getAuthState();
  return !!(auth && auth.isLoggedIn && auth.role === 'student');
}

function logoutStudent() {
  localStorage.removeItem('tc_current_user');
  localStorage.removeItem('tc_auth');
  window.location.href = 'login.html';
}

window.getCurrentUser = getCurrentUser;
window.getAuthState = getAuthState;
window.isStudentLoggedIn = isStudentLoggedIn;
window.logoutStudent = logoutStudent;