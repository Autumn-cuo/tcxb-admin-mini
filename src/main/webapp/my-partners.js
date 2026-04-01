// ===== 默认数据 =====
let partners = [
  {
    name: '李四',
    course: '数据结构',
    progressCurrent: 3,
    progressTotal: 12,
    rating: 4.8,
    matchedAt: '2026-03-01'
  }
];

let upcomingRecords = [
  {
    id: 1001,
    partner: '李四',
    course: '数据结构',
    date: '2026-03-14',
    time: '19:00-21:00',
    place: '图书馆3楼自习室'
  },
  {
    id: 1002,
    partner: '李四',
    course: '数据结构',
    date: '2026-03-16',
    time: '14:00-16:00',
    place: '图书馆3楼自习室'
  }
];

let historyRecords = [
  {
    id: 2001,
    partner: '李四',
    course: '数据结构',
    date: '2026-03-08',
    time: '19:00-21:00',
    place: '图书馆2楼',
    score: 5.0
  },
  {
    id: 2002,
    partner: '李四',
    course: '数据结构',
    date: '2026-03-10',
    time: '14:00-16:00',
    place: '教学楼A302',
    score: 5.0
  },
  {
    id: 2003,
    partner: '李四',
    course: '数据结构',
    date: '2026-03-12',
    time: '09:00-11:00',
    place: '图书馆1楼',
    score: 5.0
  }
];

let currentCheckinRecord = null;

// ===== 本地存储 key =====
const PARTNER_KEY = 'appliedPartners';
const UPCOMING_KEY = 'tc_upcoming_records';
const HISTORY_KEY = 'tc_history_records';

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
function loadPartners() {
  const saved = localStorage.getItem(PARTNER_KEY);
  if (!saved) return;

  const parsed = safeParse(saved, []);
  if (!Array.isArray(parsed) || !parsed.length) return;

  const defaultNames = new Set(partners.map(item => item.name));
  const extraPartners = parsed.filter(item => !defaultNames.has(item.name));
  partners = [...partners, ...extraPartners];
}

function loadUpcomingRecords() {
  const saved = localStorage.getItem(UPCOMING_KEY);
  if (!saved) return;

  const parsed = safeParse(saved, []);
  if (Array.isArray(parsed)) {
    upcomingRecords = parsed;
  }
}

function loadHistoryRecords() {
  const saved = localStorage.getItem(HISTORY_KEY);
  if (!saved) return;

  const parsed = safeParse(saved, []);
  if (Array.isArray(parsed)) {
    historyRecords = parsed;
  }
}

function savePartners() {
  const purePartners = partners.filter(item => item.name !== '李四');
  localStorage.setItem(PARTNER_KEY, JSON.stringify(purePartners));
}

function saveUpcomingRecords() {
  localStorage.setItem(UPCOMING_KEY, JSON.stringify(upcomingRecords));
}

function saveHistoryRecords() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyRecords));
}

// ===== 进度同步 =====
function syncPartnerProgress() {
  partners = partners.map(partner => {
    const finishedCount = historyRecords.filter(
        record => record.partner === partner.name
    ).length;

    return {
      ...partner,
      progressCurrent: finishedCount,
      progressTotal: partner.progressTotal || 12
    };
  });

  savePartners();
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
  submitScheduleBtn.addEventListener('click', () => {
    const partner = schedulePartner ? schedulePartner.value.trim() : '';
    const date = scheduleDate ? scheduleDate.value.trim() : '';
    const time = scheduleTime ? scheduleTime.value.trim() : '';
    const place = schedulePlace ? schedulePlace.value.trim() : '';

    const validationMessage = validateScheduleForm(partner, date, time, place);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    const selectedPartner = partners.find(item => item.name === partner);

    upcomingRecords.unshift({
      id: Date.now(),
      partner,
      course: selectedPartner ? selectedPartner.course : '学习任务',
      date,
      time,
      place
    });

    saveUpcomingRecords();
    renderAll();

    if (schedulePanel) schedulePanel.classList.add('hidden');
    resetScheduleForm();

    alert('学习安排创建成功！');
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
  confirmCheckinBtn.addEventListener('click', () => {
    if (!currentCheckinRecord) return;

    upcomingRecords = upcomingRecords.filter(
        item => item.id !== currentCheckinRecord.id
    );

    historyRecords.unshift({
      id: Date.now(),
      partner: currentCheckinRecord.partner,
      course: currentCheckinRecord.course,
      date: currentCheckinRecord.date,
      time: currentCheckinRecord.time,
      place: currentCheckinRecord.place,
      score: 5.0
    });

    saveUpcomingRecords();
    saveHistoryRecords();
    syncPartnerProgress();

    closeCheckinModal();
    renderAll();

    alert('签到成功，已同步到学习历史和合作进度！');
  });
}

// ===== 初始化 =====
function init() {
  loadUpcomingRecords();
  loadHistoryRecords();
  loadPartners();
  syncPartnerProgress();
  renderAll();
}

init();

if (scheduleDate) {
  scheduleDate.min = getTodayString();
}
