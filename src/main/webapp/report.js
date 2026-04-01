const BASE = window.API_BASE || '/tcxb-admin-mini';

const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

const reportUser = document.getElementById('reportUser');
const reportReason = document.getElementById('reportReason');
const reportDesc = document.getElementById('reportDesc');
const reportImage = document.getElementById('reportImage');

const reportBtn = document.getElementById('reportBtn');
const resetReportBtn = document.getElementById('resetReportBtn');
const triggerUploadBtn = document.getElementById('triggerUploadBtn');
const fileNameText = document.getElementById('fileNameText');

const reportRecordList = document.getElementById('reportRecordList');
const blacklistRecordList = document.getElementById('blacklistRecordList');

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('tc_current_user'));
    return (user && user.userId) ? user.userId : null;
  } catch (e) {
    return null;
  }
}

let CURRENT_USER_ID = getCurrentUserId();

let reports = [];
let blacklist = [];
// 学伴列表：{ name, userId }
let partnerUserMap = [];

function switchTab(target) {
  tabs.forEach((tab) => tab.classList.remove('active'));
  contents.forEach((content) => content.classList.remove('active'));

  const activeTab = document.querySelector(`.tab[data-tab="${target}"]`);
  const activeContent = document.getElementById(`${target}-content`);

  if (activeTab) activeTab.classList.add('active');
  if (activeContent) activeContent.classList.add('active');
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

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

async function loadPartnerList() {
  if (!CURRENT_USER_ID) {
    renderReportUsers();
    return;
  }
  try {
    const res = await fetch(`${BASE}/partner?action=myPartners&userId=${CURRENT_USER_ID}`);
    const result = await res.json();
    if (result.code === 200 && Array.isArray(result.data)) {
      partnerUserMap = result.data.map(item => ({
        name: item.partnerName || `用户${item.partnerUserId}`,
        userId: item.partnerUserId
      }));
    }
  } catch (e) {
    console.warn('加载学伴列表失败，使用默认数据');
  }
  renderReportUsers();
}

function renderReportUsers() {
  if (!reportUser) return;

  const options = partnerUserMap.length > 0
    ? partnerUserMap
    : [{ name: '李四', userId: 2 }]; // 未登录或无学伴时的默认

  reportUser.innerHTML = `
    <option value="">选择要举报的学习搭子</option>
    ${options.map((item) => `<option value="${item.userId}">${item.name}</option>`).join('')}
  `;
}

function renderReports() {
  if (!reportRecordList) return;

  if (!reports.length) {
    reportRecordList.innerHTML = `
      <div class="empty-box">暂无举报记录</div>
    `;
    return;
  }

  reportRecordList.innerHTML = reports
      .map((item) => {
        const statusTextMap = {
          0: '待处理',
          1: '有效',
          2: '无效',
          3: '已处理'
        };

        const statusText = statusTextMap[item.reportStatus] || '未知状态';

        const statusClass =
            item.reportStatus === 0
                ? 'pending'
                : item.reportStatus === 2
                    ? 'rejected'
                    : 'done';

        return `
        <div class="report-card">
          <div class="report-card-header">
            <div>
              <div class="report-user">被举报用户ID：${item.reportedUserId}</div>
              <div class="report-date">举报时间：${item.reportTime || ''}</div>
            </div>
            <div class="report-status ${statusClass}">
              ${statusText}
            </div>
          </div>

          <div class="report-field">
            <span class="label">举报原因：</span>
            <span>${item.reportReason || ''}</span>
          </div>

          <div class="report-field">
            <span class="label">详细描述：</span>
            <span>${item.reportDetail || '无详细描述'}</span>
          </div>

          ${
            item.evidenceName
                ? `
                <div class="report-field">
                  <span class="label">附件：</span>
                  <span>${item.evidenceName}</span>
                </div>
              `
                : ''
        }

          ${
            item.handleTime
                ? `
                <div class="report-field">
                  <span class="label">处理时间：</span>
                  <span>${item.handleTime}</span>
                </div>
              `
                : ''
        }

          ${
            item.handledBy
                ? `
                <div class="report-field">
                  <span class="label">处理人ID：</span>
                  <span>${item.handledBy}</span>
                </div>
              `
                : ''
        }

          ${
            item.handleResult
                ? `
                <div class="report-result-box">
                  <span class="label">处理结果：</span>
                  <span>${item.handleResult}</span>
                </div>
              `
                : ''
        }
        </div>
      `;
      })
      .join('');
}

function renderBlacklist() {
  if (!blacklistRecordList) return;

  if (!blacklist.length) {
    blacklistRecordList.innerHTML = `
      <div class="empty-box">黑名单为空</div>
    `;
    return;
  }

  blacklistRecordList.innerHTML = blacklist
      .map((item) => {
        return `
        <div class="black-item">
          <div>
            <div class="black-name">被拉黑用户ID：${item.blockedUserId}</div>
            <div class="black-reason">原因：${item.reason || '无'}</div>
            <div class="black-date">加入时间：${item.createdAt || '--'}</div>
          </div>
          <button class="remove-btn" data-blocked-id="${item.blockedUserId}">移除</button>
        </div>
      `;
      })
      .join('');
}

function resetForm() {
  if (reportUser) reportUser.value = '';
  if (reportReason) reportReason.value = '';
  if (reportDesc) reportDesc.value = '';
  if (reportImage) reportImage.value = '';
  if (fileNameText) fileNameText.textContent = '未选择文件';
}

async function loadReports() {
  if (!CURRENT_USER_ID) return;
  try {
    const result = await apiGet(`${BASE}/report?action=myList&reporterUserId=${CURRENT_USER_ID}`);
    if (result.code === 200) {
      reports = result.data || [];
      renderReports();
    } else {
      alert(result.msg || '查询举报记录失败');
    }
  } catch (error) {
    console.error(error);
    alert('加载举报记录失败，请检查后端是否启动');
  }
}

async function loadBlacklist() {
  if (!CURRENT_USER_ID) return;
  try {
    const result = await apiGet(`${BASE}/blacklist?action=list&userId=${CURRENT_USER_ID}`);
    if (result.code === 200) {
      blacklist = result.data || [];
      renderBlacklist();
    } else {
      alert(result.msg || '查询黑名单失败');
    }
  } catch (error) {
    console.error(error);
    alert('加载黑名单失败，请检查后端是否启动');
  }
}

if (triggerUploadBtn && reportImage) {
  triggerUploadBtn.addEventListener('click', () => {
    reportImage.click();
  });

  reportImage.addEventListener('change', () => {
    const file = reportImage.files && reportImage.files[0] ? reportImage.files[0] : null;
    if (fileNameText) {
      fileNameText.textContent = file ? file.name : '未选择文件';
    }
  });
}

if (resetReportBtn) {
  resetReportBtn.addEventListener('click', () => {
    resetForm();
  });
}

if (reportBtn) {
  reportBtn.addEventListener('click', async () => {
    const reportedUserId = reportUser ? reportUser.value.trim() : '';
    const reason = reportReason ? reportReason.value.trim() : '';
    const desc = reportDesc ? reportDesc.value.trim() : '';
    const imageFile = reportImage && reportImage.files[0] ? reportImage.files[0] : null;

    if (!reportedUserId) {
      alert('请选择举报对象（仅限已有学习搭子）');
      return;
    }

    if (!reason) {
      alert('请选择举报原因');
      return;
    }

    if (!desc) {
      alert('请填写详细描述');
      return;
    }

    if (!CURRENT_USER_ID) {
      alert('请先登录后再举报');
      return;
    }

    try {
      const evidenceName = imageFile ? imageFile.name : '';

      const result = await apiPost(`${BASE}/report`, {
        action: 'submit',
        reporterUserId: CURRENT_USER_ID,
        reportedUserId: reportedUserId,
        reportReason: reason,
        reportDetail: desc,
        evidenceUrl: '',
        evidenceName: evidenceName
      });

      if (result.code === 200) {
        resetForm();
        alert('举报提交成功');
        await loadReports();
        await loadBlacklist();
      } else {
        alert(result.msg || '举报提交失败');
      }
    } catch (error) {
      console.error(error);
      alert('请求失败，请检查后端是否启动');
    }
  });
}

document.addEventListener('click', async (e) => {
  const removeBtn = e.target.closest('.remove-btn');
  if (!removeBtn) return;

  const blockedUserId = removeBtn.dataset.blockedId;
  if (!blockedUserId) return;

  const ok = window.confirm('确定要将该用户移出黑名单吗？');
  if (!ok) return;

  try {
    const result = await apiPost(`${BASE}/blacklist`, {
      action: 'remove',
      userId: CURRENT_USER_ID,
      blockedUserId: blockedUserId
    });

    if (result.code === 200) {
      alert('移除成功');
      await loadBlacklist();
    } else {
      alert(result.msg || '移除失败');
    }
  } catch (error) {
    console.error(error);
    alert('请求失败，请检查后端是否启动');
  }
});

switchTab('report');
loadPartnerList();
loadReports();
loadBlacklist();