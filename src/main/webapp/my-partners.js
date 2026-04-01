// ===== 数据（由后端加载）=====
const BASE = window.API_BASE || '/tcxb-admin-mini';

let partners = [];
let upcomingRecords = [];
let historyRecords = [];
let receivedApplications = [];

let currentCheckinRecord = null;

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('tc_current_user'));
    return (user && user.userId) ? user.userId : null;
  } catch (e) {
    return null;
  }
}

// ===== DOM =====
const partnerList = document.getElementById('partnerList');
const upcomingList = document.getElementById('upcomingList');
const historyList = document.getElementById('historyList');

const partnerCountEl = document.getElementById('partnerCount');
const historyCountEl = document.getElementById('historyCount');
const upcomingCountEl = document.getElementById('upcomingCount');
const averageScoreEl = document.getElementById('averageScore');

const openScheduleBtn = document.getElementById('openScheduleBtn');
const closeScheduleBtn = document.getElementById('closeScheduleBtn');
const submitScheduleBtn = document.getElementById('submitScheduleBtn');
const schedulePanel = document.getElementById('schedulePanel');

const schedulePartner = document.getElementById('schedulePartner');
const scheduleDate = document.getElementById('scheduleDate');
const scheduleTime = document.getElementById('scheduleTime');
const schedulePlace = document.getElementById('schedulePlace');

const checkinModal = document.getElementById('checkinModal');
const confirmCheckinBtn = document.getElementById('confirmCheckinBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

const modalPartner = document.getElementById('modalPartner');
const modalDate = document.getElementById('modalDate');
const modalTime = document.getElementById('modalTime');
const modalPlace = document.getElementById('modalPlace');

// ===== 工具函数 =====
function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return fallback;
  }
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTimeRangeStart(timeRange) {
  if (!timeRange) return '00:00';
  return timeRange.split('-')[0].trim();
}


function getTodayString() {
  const today = new Date();
  return formatDate(today);
}

function parseTimeRange(timeRange) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/.exec(timeRange || '');
  if (!match) return null;
  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const endMinutes = Number(match[3]) * 60 + Number(match[4]);
  return { startMinutes, endMinutes };
}

function validateScheduleForm(partner, date, time, place) {
  if (!partner || !date || !time || !place) {
    return '请把学伴、日期、时间和地点填写完整。';
  }

  const today = getTodayString();
  if (date < today) {
    return '学习日期不能早于今天。';
  }

  const parsed = parseTimeRange(time);
  if (!parsed) {
    return '时间格式不正确，请使用 14:00-16:00 这种格式。';
  }

  const duration = parsed.endMinutes - parsed.startMinutes;
  if (duration <= 0) {
    return '结束时间必须晚于开始时间。';
  }
  if (duration < 30) {
    return '单次学习时长不能少于 30 分钟。';
  }
  if (duration > 8 * 60) {
    return '单次学习时长不能超过 8 小时。';
  }

  return '';
}
function parseRecordDateTime(dateStr, timeRange) {
  const startTime = getTimeRangeStart(timeRange);
  return new Date(`${dateStr}T${startTime}:00`);
}

function getCheckinStatus(record) {
  const now = new Date();
  const startTime = parseRecordDateTime(record.date, record.time);

  // 约定开始前：未开始
  // 开始后 2 小时内：可签到
  // 超过 2 小时：已过期
  const checkinEnd = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

  if (now < startTime) return 'upcoming';
  if (now >= startTime && now <= checkinEnd) return 'available';
  return 'expired';
}

function getStatusText(status) {
  if (status === 'upcoming') return '未开始';
  if (status === 'available') return '可签到';
  if (status === 'expired') return '已过期';
  return '待签到';
}

function getStatusClass(status) {
  if (status === 'upcoming') return 'status-upcoming';
  if (status === 'available') return 'status-available';
  if (status === 'expired') return 'status-expired';
  return '';
}

function openCheckinModal() {
  if (checkinModal) checkinModal.classList.remove('hidden');
}

function closeCheckinModal() {
  if (checkinModal) checkinModal.classList.add('hidden');
  currentCheckinRecord = null;
}

function resetScheduleForm() {
  if (schedulePartner) schedulePartner.value = '';
  if (scheduleDate) scheduleDate.value = '';
  if (scheduleTime) scheduleTime.value = '';
  if (schedulePlace) schedulePlace.value = '';
}

// ===== 本地存储 =====
// ===== 后端数据加载 =====
async function loadPartners() {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const res = await fetch(`${BASE}/partner?action=myPartners&userId=${userId}`);
    const result = await res.json();
    if (result.code === 200 && Array.isArray(result.data)) {
      partners = result.data.map(item => ({
        name: item.partnerName || `用户${item.partnerUserId}`,
        partnerUserId: item.partnerUserId,
        course: item.course || '',
        progressCurrent: item.progressCurrent || 0,
        progressTotal: item.progressTotal || 12,
        rating: item.partnerTrustScore != null ? (item.partnerTrustScore / 20).toFixed(1) : '5.0',
        matchedAt: item.createdAt ? item.createdAt.substring(0, 10) : ''
      }));
    }
  } catch (e) {
    console.error('加载学伴失败:', e);
  }
}

async function loadUpcomingRecords() {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const res = await fetch(`${BASE}/schedule?action=myUpcoming&userId=${userId}`);
    const result = await res.json();
    if (result.code === 200 && Array.isArray(result.data)) {
      upcomingRecords = result.data.map(item => ({
        id: item.scheduleId,
        partner: item.partnerName || '',
        partnerUserId: item.partnerUserId,
        course: item.course || '',
        date: item.studyDate || '',
        time: item.studyTime || '',
        place: item.studyPlace || ''
      }));
    }
  } catch (e) {
    console.error('加载即将到来的学习失败:', e);
  }
}

async function loadHistoryRecords() {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const res = await fetch(`${BASE}/schedule?action=myHistory&userId=${userId}`);
    const result = await res.json();
    if (result.code === 200 && Array.isArray(result.data)) {
      historyRecords = result.data.map(item => ({
        id: item.scheduleId,
        partner: item.partnerName || '',
        partnerUserId: item.partnerUserId,
        course: item.course || '',
        date: item.studyDate || '',
        time: item.studyTime || '',
        place: item.studyPlace || '',
        score: item.score != null ? item.score : 5.0
      }));
    }
  } catch (e) {
    console.error('加载学习历史失败:', e);
  }
}

async function loadReceivedApplications() {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const res = await fetch(`${BASE}/partner?action=myReceived&userId=${userId}`);
    const result = await res.json();
    if (result.code === 200 && Array.isArray(result.data)) {
      receivedApplications = result.data;
    }
  } catch (e) {
    console.error('加载收到的申请失败:', e);
  }
}

// ===== 统计渲染 =====
function renderStats() {
  if (partnerCountEl) partnerCountEl.textContent = partners.length;
  if (historyCountEl) historyCountEl.textContent = historyRecords.length;
  if (upcomingCountEl) upcomingCountEl.textContent = upcomingRecords.length;

  const avg =
      historyRecords.length > 0
          ? (
              historyRecords.reduce((sum, item) => sum + (Number(item.score) || 0), 0) /
              historyRecords.length
          ).toFixed(1)
          : '5.0';

  if (averageScoreEl) averageScoreEl.textContent = avg;
}

// ===== 左侧学伴列表 =====
function renderPartners() {
  if (!partnerList) return;

  if (!partners.length) {
    partnerList.innerHTML = `<div class="empty-box">暂无学伴</div>`;
    fillSchedulePartnerOptions();
    return;
  }

  partnerList.innerHTML = partners
      .map(item => {
        const current = item.progressCurrent || 0;
        const total = item.progressTotal || 12;
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;

        return `
        <div class="partner-item">
          <div class="partner-row">
            <div class="partner-avatar">👨‍🎓</div>
            <div style="flex:1;">
              <div class="partner-name">${item.name}</div>
              <div class="partner-course">${item.course}</div>
            </div>
            <div style="color:#f5b301;font-weight:700;">⭐ ${item.rating || 5.0}</div>
          </div>

          <div class="progress-header">
            <span>合作进度</span>
            <span>${current}/${total}</span>
          </div>

          <div class="progress">
            <span style="width:${percent}%"></span>
          </div>

          <div class="partner-meta">匹配时间：${item.matchedAt || '-'}</div>
        </div>
      `;
      })
      .join('');

  fillSchedulePartnerOptions();
}

// ===== 即将到来的学习 =====
function renderUpcoming() {
  if (!upcomingList) return;

  if (!upcomingRecords.length) {
    upcomingList.innerHTML = `<div class="empty-box">暂无学习安排</div>`;
    return;
  }

  upcomingList.innerHTML = upcomingRecords
      .map(item => {
        const status = getCheckinStatus(item);
        const statusText = getStatusText(status);
        const statusClass = getStatusClass(status);

        const btnText =
            status === 'available'
                ? '签到打卡'
                : status === 'upcoming'
                    ? '未到时间'
                    : '已过期';

        const disabledAttr = status === 'available' ? '' : 'disabled';

        return `
        <div class="study-card">
          <div class="study-top">
            <div>
              <div class="history-title">${item.course}</div>
              <div class="history-meta">学伴：${item.partner}</div>
            </div>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>

          <div class="study-info">
            <div>日期：${item.date}</div>
            <div>时间：${item.time}</div>
            <div>地点：${item.place}</div>
          </div>

          <button class="checkin-btn" data-id="${item.id}" ${disabledAttr}>${btnText}</button>
        </div>
      `;
      })
      .join('');
}

// ===== 学习历史 =====
function renderHistory() {
  if (!historyList) return;

  if (!historyRecords.length) {
    historyList.innerHTML = `<div class="empty-box">暂无学习历史</div>`;
    return;
  }

  historyList.innerHTML = historyRecords
      .map(item => {
        return `
        <div class="history-item">
          <div>
            <div class="history-title">${item.course}</div>
            <div class="history-meta">
              学伴：${item.partner} ｜ ${item.date} ｜ ${item.time} ｜ ${item.place}
            </div>
          </div>
          <div class="history-score">⭐ ${item.score || 5.0}</div>
        </div>
      `;
      })
      .join('');
}

function renderAll() {
  renderStats();
  renderPartners();
  renderUpcoming();
  renderHistory();
}

// ===== 安排学习下拉 =====
function fillSchedulePartnerOptions() {
  if (!schedulePartner) return;

  const currentValue = schedulePartner.value;

  schedulePartner.innerHTML = `
    <option value="">选择学伴</option>
    ${partners
      .map(item => `<option value="${item.name}">${item.name}（${item.course}）</option>`)
      .join('')}
  `;

  if ([...schedulePartner.options].some(option => option.value === currentValue)) {
    schedulePartner.value = currentValue;
  }
}

// ===== 事件：安排学习面板 =====
if (openScheduleBtn) {
  openScheduleBtn.addEventListener('click', () => {
    if (!schedulePanel) return;
    fillSchedulePartnerOptions();

    if (!scheduleDate.value) {
      scheduleDate.value = getTodayString();
    }

    schedulePanel.classList.toggle('hidden');
  });
}

if (closeScheduleBtn) {
  closeScheduleBtn.addEventListener('click', () => {
    if (schedulePanel) schedulePanel.classList.add('hidden');
    resetScheduleForm();
  });
}

if (submitScheduleBtn) {
  submitScheduleBtn.addEventListener('click', async () => {
    const partnerValue = schedulePartner ? schedulePartner.value.trim() : '';
    const date = scheduleDate ? scheduleDate.value.trim() : '';
    const time = scheduleTime ? scheduleTime.value.trim() : '';
    const place = schedulePlace ? schedulePlace.value.trim() : '';

    const validationMessage = validateScheduleForm(partnerValue, date, time, place);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      alert('请先登录');
      return;
    }

    const selectedPartner = partners.find(item => item.name === partnerValue);
    const partnerUserId = selectedPartner ? selectedPartner.partnerUserId : null;
    if (!partnerUserId) {
      alert('未找到学伴信息，请刷新后重试');
      return;
    }

    try {
      const res = await fetch(`${BASE}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'add',
          userId,
          partnerUserId,
          course: selectedPartner ? selectedPartner.course : '',
          studyDate: date,
          studyTime: time,
          studyPlace: place
        })
      });
      const result = await res.json();

      if (result.code === 200) {
        await loadUpcomingRecords();
        renderAll();
        if (schedulePanel) schedulePanel.classList.add('hidden');
        resetScheduleForm();
        alert('学习安排创建成功！');
      } else {
        alert(result.msg || '创建失败');
      }
    } catch (e) {
      console.error(e);
      alert('请求失败，请检查后端是否启动');
    }
  });
}

// ===== 点击签到 =====
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.checkin-btn');
  if (!btn || btn.disabled) return;

  const id = Number(btn.dataset.id);
  if (!id) return;

  const record = upcomingRecords.find(item => item.id === id);
  if (!record) return;

  const status = getCheckinStatus(record);

  if (status === 'upcoming') {
    alert('还没到签到时间，请在约定时间开始后签到。');
    return;
  }

  if (status === 'expired') {
    alert('该学习安排已过期，无法签到。');
    return;
  }

  currentCheckinRecord = record;

  if (modalPartner) modalPartner.textContent = record.partner;
  if (modalDate) modalDate.textContent = record.date;
  if (modalTime) modalTime.textContent = record.time;
  if (modalPlace) modalPlace.textContent = record.place;

  openCheckinModal();
});

// ===== 关闭签到弹窗 =====
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeCheckinModal);
}

if (checkinModal) {
  checkinModal.addEventListener('click', (e) => {
    if (e.target === checkinModal) {
      closeCheckinModal();
    }
  });
}

// ===== 确认签到 =====
if (confirmCheckinBtn) {
  confirmCheckinBtn.addEventListener('click', async () => {
    if (!currentCheckinRecord) return;

    const userId = getCurrentUserId();
    if (!userId) {
      alert('请先登录');
      return;
    }

    confirmCheckinBtn.disabled = true;

    try {
      const res = await fetch(`${BASE}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'checkin',
          userId,
          scheduleId: currentCheckinRecord.id
        })
      });
      const result = await res.json();

      if (result.code === 200) {
        await loadUpcomingRecords();
        await loadHistoryRecords();
        await loadPartners();
        closeCheckinModal();
        renderAll();
        alert('签到成功，信誉分 +1，已同步到学习历史！');
      } else {
        alert(result.msg || '签到失败');
        closeCheckinModal();
      }
    } catch (e) {
      console.error(e);
      alert('签到请求失败，请检查后端是否启动');
      closeCheckinModal();
    } finally {
      confirmCheckinBtn.disabled = false;
    }
  });
}

// ===== 收到的学伴申请渲染 =====
const receivedApplySection = document.getElementById('receivedApplySection');
const receivedApplyList = document.getElementById('receivedApplyList');
const receivedApplyBadge = document.getElementById('receivedApplyBadge');

function renderReceivedApplications() {
  if (!receivedApplySection || !receivedApplyList) return;

  if (!receivedApplications.length) {
    receivedApplySection.classList.add('hidden');
    return;
  }

  receivedApplySection.classList.remove('hidden');
  if (receivedApplyBadge) receivedApplyBadge.textContent = receivedApplications.length;

  receivedApplyList.innerHTML = receivedApplications.map(item => `
    <div class="apply-item" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;">
      <div>
        <div style="font-weight:600;">${item.applicantName || '未知用户'} 想成为你的学伴</div>
        <div style="font-size:12px;color:#888;margin-top:4px;">${item.message || '（无留言）'}</div>
        <div style="font-size:12px;color:#aaa;">${item.applyTime ? String(item.applyTime).substring(0, 10) : ''}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="primary-btn accept-apply-btn" data-apply-id="${item.applyId}" style="padding:6px 14px;font-size:13px;">接受</button>
        <button class="secondary-btn reject-apply-btn" data-apply-id="${item.applyId}" style="padding:6px 14px;font-size:13px;">拒绝</button>
      </div>
    </div>
  `).join('');
}

document.addEventListener('click', async (e) => {
  const acceptBtn = e.target.closest('.accept-apply-btn');
  const rejectBtn = e.target.closest('.reject-apply-btn');

  const btn = acceptBtn || rejectBtn;
  if (!btn) return;

  const applyId = btn.dataset.applyId;
  const applyStatus = acceptBtn ? 1 : 2;
  const userId = getCurrentUserId();
  if (!userId || !applyId) return;

  btn.disabled = true;

  try {
    const res = await fetch(`${BASE}/partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'handleApply',
        applyId,
        userId,
        applyStatus
      })
    });
    const result = await res.json();

    if (result.code === 200) {
      alert(result.msg || '操作成功');
      await loadAll();
    } else {
      alert(result.msg || '操作失败');
    }
  } catch (err) {
    console.error(err);
    alert('操作失败，请检查后端是否启动');
  } finally {
    btn.disabled = false;
  }
});

// ===== 初始化 =====
async function loadAll() {
  await Promise.all([
    loadPartners(),
    loadUpcomingRecords(),
    loadHistoryRecords(),
    loadReceivedApplications()
  ]);
  renderReceivedApplications();
  renderAll();
}

async function init() {
  await loadAll();
}

init();

if (scheduleDate) {
  scheduleDate.min = getTodayString();
}
