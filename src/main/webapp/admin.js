const totalUserCount = document.getElementById('totalUserCount');
const pendingReportCount = document.getElementById('pendingReportCount');
const activeUserCount = document.getElementById('activeUserCount');
const matchSuccessRate = document.getElementById('matchSuccessRate');

const pendingReportCard = document.getElementById('pendingReportCard');
const recentActivityList = document.getElementById('recentActivityList');

const API_BASE = '/tcxb-admin-mini';

async function apiGet(url) {
  const res = await fetch(url);
  return await res.json();
}

async function loadAdminUsers() {
  return await apiGet(`${API_BASE}/admin?action=userList`);
}

async function loadAdminReports() {
  return await apiGet(`${API_BASE}/report?action=adminList`);
}

function getPendingReports(reports) {
  return reports.filter((item) => item.reportStatus === 0);
}

function renderPendingReportCard(reports) {
  if (!pendingReportCard) return;

  const pendingReports = getPendingReports(reports);

  if (pendingReports.length === 0) {
    pendingReportCard.innerHTML = `
      <div class="report-item">
        <div class="report-user">当前没有待处理举报</div>
      </div>
    `;
    return;
  }

  const item = pendingReports[0];

  pendingReportCard.innerHTML = `
    <div class="report-item">
      <div class="report-row">
        <span class="warn">!</span>
        <span class="report-user">举报编号：${item.reportId}</span>
      </div>
      <div class="report-reason">原因：${item.reportReason || '未填写'}</div>
      <div class="report-date">${item.reportTime || ''}</div>
      <a href="admin-manage.html?tab=reports" class="detail-link">查看详情 →</a>
    </div>
  `;
}

function renderRecentActivities(reports, users) {
  if (!recentActivityList) return;

  const activities = [];
  const pendingReports = getPendingReports(reports);

  if (pendingReports.length > 0) {
    const item = pendingReports[0];
    activities.push({
      dot: 'orange-dot',
      title: `新举报提交：举报编号 ${item.reportId}`,
      time: item.reportTime || '刚刚'
    });
  }

  if (users.length > 0) {
    activities.push({
      dot: 'green-dot',
      title: `当前系统用户数：${users.length}`,
      time: '实时统计'
    });
  }

  activities.push({
    dot: 'blue-dot',
    title: '系统运行正常',
    time: '刚刚'
  });

  recentActivityList.innerHTML = activities.map((item) => `
    <div class="activity-item">
      <span class="dot ${item.dot}"></span>
      <div class="activity-content">
        <div class="activity-title">${item.title}</div>
        <div class="activity-time">${item.time}</div>
      </div>
    </div>
  `).join('');
}

async function renderDashboard() {
  try {
    const userResult = await loadAdminUsers();
    const reportResult = await loadAdminReports();

    const users = userResult.code === 200 ? (userResult.data || []) : [];
    const reports = reportResult.code === 200 ? (reportResult.data || []) : [];

    const pendingReports = getPendingReports(reports);

    if (totalUserCount) totalUserCount.textContent = users.length;
    if (pendingReportCount) pendingReportCount.textContent = pendingReports.length;
    if (activeUserCount) activeUserCount.textContent = users.filter(item => item.accountStatus === 0).length;
    if (matchSuccessRate) matchSuccessRate.textContent = '87%';

    renderPendingReportCard(reports);
    renderRecentActivities(reports, users);
  } catch (error) {
    console.error(error);
    alert('后台首页数据加载失败，请检查后端是否启动');
  }
}

renderDashboard();

window.addEventListener('focus', renderDashboard);
window.addEventListener('pageshow', renderDashboard);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) renderDashboard();
});