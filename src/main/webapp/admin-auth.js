window.API_BASE = '/tcxb-admin-mini';

function createAdminLoginModal() {
  if (document.getElementById('adminLoginModal')) return;

  const modal = document.createElement('div');
  modal.id = 'adminLoginModal';
  modal.className = 'admin-login-mask hidden';
  modal.innerHTML = `
    <div class="admin-login-dialog">
      <h3>管理员登录</h3>
      <p class="admin-login-subtitle">请输入管理员账号和密码后进入后台</p>

      <div class="admin-login-form-item">
        <label>管理员账号</label>
        <input type="text" id="adminAccountInput" placeholder="请输入管理员账号" />
      </div>

      <div class="admin-login-form-item">
        <label>管理员密码</label>
        <input type="password" id="adminPasswordInput" placeholder="请输入管理员密码" />
      </div>

      <div class="admin-login-error hidden" id="adminLoginError">账号或密码错误，请重新输入</div>

      <div class="admin-login-btn-row">
        <button type="button" class="admin-confirm-btn" id="adminLoginConfirmBtn">登录后台</button>
        <button type="button" class="admin-cancel-btn" id="adminLoginCancelBtn">取消</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cancelBtn = document.getElementById('adminLoginCancelBtn');
  const confirmBtn = document.getElementById('adminLoginConfirmBtn');
  const errorBox = document.getElementById('adminLoginError');

  cancelBtn.addEventListener('click', () => {
    closeAdminLoginModal();
  });

  confirmBtn.addEventListener('click', async () => {
    const account = document.getElementById('adminAccountInput').value.trim();
    const password = document.getElementById('adminPasswordInput').value.trim();

    if (!account || !password) {
      errorBox.textContent = '请输入账号和密码';
      errorBox.classList.remove('hidden');
      return;
    }

    try {
      const body = new URLSearchParams({
        action: 'login',
        adminAccount: account,
        password: password
      });

      const res = await fetch(`${API_BASE}/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });

      const result = await res.json();

      if (result.code === 200) {
        const adminData = result.data || {};

        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminId', adminData.adminId || '');
        sessionStorage.setItem('adminAccount', adminData.adminAccount || account);
        sessionStorage.setItem('adminName', adminData.adminName || account);

        window.location.href = 'admin.html';
        return;
      }

      errorBox.textContent = result.msg || '账号或密码错误，请重新输入';
      errorBox.classList.remove('hidden');
    } catch (error) {
      console.error(error);
      errorBox.textContent = '登录请求失败，请检查后端是否启动';
      errorBox.classList.remove('hidden');
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAdminLoginModal();
    }
  });
}

function openAdminLoginModal() {
  createAdminLoginModal();

  const modal = document.getElementById('adminLoginModal');
  const accountInput = document.getElementById('adminAccountInput');
  const passwordInput = document.getElementById('adminPasswordInput');
  const errorBox = document.getElementById('adminLoginError');

  if (!modal) return;

  modal.classList.remove('hidden');
  errorBox.classList.add('hidden');
  errorBox.textContent = '账号或密码错误，请重新输入';
  accountInput.value = '';
  passwordInput.value = '';
}

function closeAdminLoginModal() {
  const modal = document.getElementById('adminLoginModal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function bindAdminEntry(selector = '.admin-entry') {
  const entries = document.querySelectorAll(selector);
  entries.forEach((entry) => {
    entry.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminLoginModal();
    });
  });
}