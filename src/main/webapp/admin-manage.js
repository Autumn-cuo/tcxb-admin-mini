console.log('admin-manage.js 后端版已加载');

const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

const API_BASE = '/tcxb-admin-mini';

let userListData = [];
let reportListData = [];

function getCurrentAdminAccount() {
  return sessionStorage.getItem('adminAccount') || 'admin';
}

function getCurrentAdminId() {
  return sessionStorage.getItem('adminId') || '1';
}

async function apiGet(url) {
  const res = await fetch(url);
  return await res.json();
}

async function apiPost(url, data) {
  const body = new URLSearchParams(data);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  return await res.json();
}

function switchTab(target) {
  tabs.forEach((item) => item.classList.remove('active'));
  contents.forEach((item) => item.classList.remove('active'));

  const activeTab = document.querySelector(`.tab[data-tab="${target}"]`);
  const activeContent = document.getElementById(`${target}-content`);

  if (activeTab && activeContent) {
    activeTab.classList.add('active');
    activeContent.classList.add('active');
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

async function loadUsers() {
  const result = await apiGet(`${API_BASE}/admin?action=userList`);
  if (result.code === 200) {
    userListData = result.data || [];
  } else {
    throw new Error(result.msg || '加载用户失败');
  }
}

async function loadReports() {
  const result = await apiGet(`${API_BASE}/report?action=adminList`);
  if (result.code === 200) {
    reportListData = result.data || [];
  } else {
    throw new Error(result.msg || '加载举报失败');
  }
}

function getStatusClassName(accountStatus) {
  if (accountStatus === 0) return 'success';
  if (accountStatus === 1) return 'danger';
  if (accountStatus === 2) return 'danger';
  return 'success';
}

function getStatusText(accountStatus) {
  if (accountStatus === 0) return '正常';
  if (accountStatus === 1) return '限制';
  if (accountStatus === 2) return '封禁';
  return '正常';
}

function getNextStatus(accountStatus) {
  if (accountStatus === 0) return 1; // 正常 -> 限制
  if (accountStatus === 1) return 2; // 限制 -> 封禁
  return 2; // 已封禁就保持封禁
}

function getNextStatusActionText(accountStatus) {
  if (accountStatus === 0) return '限制';
  if (accountStatus === 1) return '封禁';
  return '封禁';
}

function getFilteredUsers() {
  const keywordInput = document.getElementById('userSearchInput');
  const filterSelect = document.getElementById('userStatusFilter');

  const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
  const selectedStatus = filterSelect ? filterSelect.value : 'all';

  return userListData.filter((item) => {
    const statusText = getStatusText(item.accountStatus);

    const matchKeyword =
        !keyword ||
        (item.realName || '').toLowerCase().includes(keyword) ||
        (item.studentNo || '').toLowerCase().includes(keyword) ||
        (item.schoolEmail || '').toLowerCase().includes(keyword);

    const matchStatus = selectedStatus === 'all' || statusText === selectedStatus;

    return matchKeyword && matchStatus;
  });
}

function renderUsers() {
  const tbody = document.querySelector('.user-table tbody');
  if (!tbody) return;

  const users = getFilteredUsers();

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:24px 0;color:#666;">
          暂无符合条件的用户
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map((item, index) => {
    const statusText = getStatusText(item.accountStatus);
    const statusClass = getStatusClassName(item.accountStatus);
    const nextActionText = getNextStatusActionText(item.accountStatus);

    return `
      <tr class="${index === 0 ? 'highlight-row' : ''}">
        <td>
          <div class="user-cell">
            <div class="user-avatar yellow">🧑</div>
            <div>
              <div class="cell-name">${item.realName || item.nickname || '未命名用户'}</div>
              <div class="cell-email">${item.schoolEmail || ''}</div>
            </div>
          </div>
        </td>
        <td>${item.studentNo || ''}</td>
        <td>${item.major || ''}</td>
        <td><span class="score"><span class="star">★</span> ${item.trustScore || 0}</span></td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>
          <div class="action-group">
            <button class="icon-btn blue-text user-restore-btn" data-id="${item.userId}" title="恢复正常">🛡</button>
            <button class="icon-btn red-text user-restrict-btn" data-id="${item.userId}" data-status="${item.accountStatus}" title="${nextActionText}用户">⊘</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderReports() {
  const reportsContent = document.getElementById('reports-content');
  if (!reportsContent) return;

  if (reportListData.length === 0) {
    reportsContent.innerHTML = '<div class="report-card"><div class="report-body"><div class="plain-box">当前没有举报记录</div></div></div>';
    return;
  }

  reportsContent.innerHTML = reportListData.map((item) => {
    const statusTextMap = {
      0: '待处理',
      1: '有效',
      2: '无效',
      3: '已处理'
    };

    const statusText = statusTextMap[item.reportStatus] || '未知状态';
    const statusClass = item.reportStatus === 0 ? 'yellow-tag' : 'blue-tag';

    const handleInfoHtml =
        item.reportStatus !== 0
            ? `
          <div class="field-label report-desc-label">处理结果</div>
          <div class="desc-box">${item.handleResult || '暂无处理结果'}</div>

          <div class="report-grid" style="margin-top: 16px;">
            <div>
              <div class="field-label">处理人ID</div>
              <div class="info-box plain-box">${item.handledBy || '--'}</div>
            </div>
            <div>
              <div class="field-label">处理时间</div>
              <div class="info-box plain-box">${item.handleTime || '--'}</div>
            </div>
          </div>
        `
            : '';

    return `
      <section class="report-card">
        <div class="report-header">
          <div class="report-head-left">
            <div class="flag-icon">🚩</div>
            <div>
              <div class="report-title">举报编号：${item.reportId}</div>
              <div class="tag-row">
                <span class="mini-tag red-tag">${item.reportReason || ''}</span>
                <span class="mini-tag ${statusClass}">${statusText}</span>
              </div>
              <div class="report-time">🗓 提交时间：${item.reportTime || ''}</div>
            </div>
          </div>
        </div>

        <div class="report-body">
          <div class="report-grid">
            <div>
              <div class="field-label">举报人ID</div>
              <div class="info-box plain-box">${item.reporterUserId}</div>
            </div>

            <div>
              <div class="field-label">被举报用户ID</div>
              <div class="info-box plain-box">${item.reportedUserId}</div>
            </div>
          </div>

          <div class="report-grid" style="margin-top:16px;">
            <div>
              <div class="field-label">举报状态</div>
              <div class="info-box plain-box">${statusText}</div>
            </div>
            <div>
              <div class="field-label">凭证文件</div>
              <div class="info-box plain-box">${item.evidenceName || '无'}</div>
            </div>
          </div>

          <div class="field-label report-desc-label">举报原因</div>
          <div class="desc-box">${item.reportReason || '未填写'}</div>

          <div class="field-label report-desc-label">举报描述</div>
          <div class="desc-box">${item.reportDetail || '未填写'}</div>

          ${handleInfoHtml}

          ${
        item.reportStatus === 0
            ? `
                <div class="btn-row">
                  <button class="danger-btn handle-report-btn" data-id="${item.reportId}">
                    ⊘ 确认违规并处理
                  </button>
                  <button class="light-btn reject-report-btn" data-id="${item.reportId}">
                    ⊙ 驳回举报
                  </button>
                </div>
              `
            : ''
    }
        </div>
      </section>
    `;
  }).join('');
}

document.addEventListener('click', async (e) => {
  const handleBtn = e.target.closest('.handle-report-btn');
  const rejectBtn = e.target.closest('.reject-report-btn');
  const restoreBtn = e.target.closest('.user-restore-btn');
  const restrictBtn = e.target.closest('.user-restrict-btn');

  if (restoreBtn) {
    const userId = restoreBtn.dataset.id;

    try {
      const result = await apiPost(`${API_BASE}/admin`, {
        action: 'updateUserStatus',
        userId,
        accountStatus: 0
      });

      if (result.code === 200) {
        alert('已恢复正常');
        await loadUsers();
        renderUsers();
      } else {
        alert(result.msg || '恢复失败');
      }
    } catch (error) {
      console.error(error);
      alert('请求失败');
    }
    return;
  }

  if (restrictBtn) {
    const userId = restrictBtn.dataset.id;
    const currentStatus = Number(restrictBtn.dataset.status || 0);
    const nextStatus = getNextStatus(currentStatus);
    const actionText = getNextStatusActionText(currentStatus);

    if (currentStatus === 2) {
      alert('该用户已处于封禁状态');
      return;
    }

    const confirmed = window.confirm(`确认要对该用户执行“${actionText}”操作吗？`);
    if (!confirmed) return;

    try {
      const result = await apiPost(`${API_BASE}/admin`, {
        action: 'updateUserStatus',
        userId,
        accountStatus: nextStatus
      });

      if (result.code === 200) {
        alert(`已${actionText}用户`);
        await loadUsers();
        renderUsers();
      } else {
        alert(result.msg || `${actionText}失败`);
      }
    } catch (error) {
      console.error(error);
      alert('请求失败');
    }
    return;
  }

  if (handleBtn) {
    const reportId = handleBtn.dataset.id;

    const handleResult = window.prompt('请输入处理意见：', '经核实举报属实，已处理');
    if (handleResult === null) return;
    if (!handleResult.trim()) {
      alert('处理意见不能为空');
      return;
    }

    try {
      const result = await apiPost(`${API_BASE}/report`, {
        action: 'handle',
        reportId,
        handledBy: getCurrentAdminId(),
        handleResult: handleResult.trim(),
        reportStatus: 3
      });

      if (result.code === 200) {
        alert('已确认违规并完成处理');
        await loadReports();
        renderReports();
      } else {
        alert(result.msg || '处理失败');
      }
    } catch (error) {
      console.error(error);
      alert('请求失败');
    }
    return;
  }

  if (rejectBtn) {
    const reportId = rejectBtn.dataset.id;

    const rejectReason = window.prompt('请输入驳回原因：', '经核查证据不足，暂不支持该举报。');
    if (rejectReason === null) return;
    if (!rejectReason.trim()) {
      alert('驳回原因不能为空');
      return;
    }

    try {
      const result = await apiPost(`${API_BASE}/report`, {
        action: 'handle',
        reportId,
        handledBy: getCurrentAdminId(),
        handleResult: rejectReason.trim(),
        reportStatus: 2
      });

      if (result.code === 200) {
        alert('已驳回该举报');
        await loadReports();
        renderReports();
      } else {
        alert(result.msg || '驳回失败');
      }
    } catch (error) {
      console.error(error);
      alert('请求失败');
    }
    return;
  }
});

function bindUserFilterEvents() {
  const keywordInput = document.getElementById('userSearchInput');
  const filterSelect = document.getElementById('userStatusFilter');

  if (keywordInput) {
    keywordInput.addEventListener('input', renderUsers);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', renderUsers);
  }
}

const params = new URLSearchParams(window.location.search);
const initialTab = params.get('tab');

if (initialTab === 'reports') {
  switchTab('reports');
} else {
  switchTab('users');
}

bindUserFilterEvents();

(async function initPage() {
  try {
    await loadUsers();
    await loadReports();
    renderUsers();
    renderReports();
  } catch (error) {
    console.error(error);
    alert('页面初始化失败，请检查后端是否启动');
  }
})();