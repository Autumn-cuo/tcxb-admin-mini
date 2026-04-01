function requireAdminPopupLogin() {
  const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');

  if (isAdminLoggedIn !== 'true') {
    alert('请先通过管理员登录验证');
    window.location.href = 'home.html';
    return false;
  }

  return true;
}