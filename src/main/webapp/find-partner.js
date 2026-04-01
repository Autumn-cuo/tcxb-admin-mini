const courseFilter = document.getElementById('courseFilter');
const matchRange = document.getElementById('matchRange');
const matchRangeValue = document.getElementById('matchRangeValue');
const resultCount = document.getElementById('resultCount');
const partnerList = document.getElementById('partnerList');
const applyBtn = document.getElementById('applyBtn');

const detailAvatar = document.getElementById('detailAvatar');
const detailName = document.getElementById('detailName');
const detailMajor = document.getElementById('detailMajor');
const detailScore = document.getElementById('detailScore');
const detailMatch = document.getElementById('detailMatch');
const detailIntro = document.getElementById('detailIntro');

const reasonList = document.getElementById('reasonList');
const courseTags = document.getElementById('courseTags');
const timeTags = document.getElementById('timeTags');
const placeTags = document.getElementById('placeTags');
const styleTags = document.getElementById('styleTags');
const viewProfileBtn = document.getElementById('viewProfileBtn');

const BASE = window.API_BASE || '/tcxb-admin-mini';

const AVATAR_EMOJIS = ['👩‍🦳', '👨', '👩', '👨‍💻', '👩‍💻', '🧑', '👦', '👧'];
const AVATAR_CLASSES = ['blue', 'deep-blue', 'pink', 'green', 'purple', 'orange'];

function getAvatarEmoji(userId) {
  return AVATAR_EMOJIS[userId % AVATAR_EMOJIS.length];
}

function getAvatarClass(userId) {
  return AVATAR_CLASSES[userId % AVATAR_CLASSES.length];
}

function mapBackendPartner(item) {
  const courses = item.preferredCourses
    ? item.preferredCourses.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const times = item.preferredTimes
    ? item.preferredTimes.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const places = item.preferredPlaces
    ? item.preferredPlaces.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return {
    id: String(item.userId),
    userId: item.userId,
    avatar: getAvatarEmoji(item.userId),
    avatarClass: getAvatarClass(item.userId),
    name: item.realName || item.nickname || '同学',
    major: item.major || '未填写',
    detailMajor: `${item.major || '未填写'} · ${item.grade || ''} · ${item.studentNo || ''}`,
    score: item.trustScore != null ? String(item.trustScore) : '100',
    match: item.matchScore || 50,
    intro: '这位同学还没有填写简介。',
    course: courses[0] || 'all',
    courses,
    times,
    places,
    styles: [],
    reasons: Array.isArray(item.matchReasons) ? item.matchReasons : []
  };
}

let partners = [];
let filteredPartners = [];
let currentPartner = null;

async function loadRecommendations() {
  let currentUserId = null;
  try {
    const user = JSON.parse(localStorage.getItem('tc_current_user'));
    if (user && user.userId) currentUserId = user.userId;
  } catch (e) {}

  if (!currentUserId) {
    partnerList.innerHTML = '<div class="empty-tip">请先登录后查看推荐学伴</div>';
    resultCount.textContent = '找到 0 个匹配结果';
    return;
  }

  partnerList.innerHTML = '<div class="empty-tip">加载中...</div>';

  try {
    const res = await fetch(`${BASE}/partner?action=recommend&userId=${currentUserId}`);
    const result = await res.json();

    if (result.code === 200 && Array.isArray(result.data)) {
      partners = result.data.map(mapBackendPartner);
    } else {
      partners = [];
    }
  } catch (e) {
    console.error('加载推荐失败:', e);
    partners = [];
  }

  filteredPartners = [...partners];
  currentPartner = partners[0] || null;

  renderPartnerList();
  if (currentPartner) renderDetail(currentPartner);
}

function renderPartnerList() {
  if (filteredPartners.length === 0) {
    partnerList.innerHTML = '<div class="empty-tip">当前筛选条件下暂无匹配结果</div>';
    resultCount.textContent = '找到 0 个匹配结果';
    return;
  }

  partnerList.innerHTML = filteredPartners
      .map(
          (item) => `
        <div class="partner-card ${currentPartner.id === item.id ? 'active' : ''}" data-id="${item.id}">
          <div class="partner-top">
            <div class="partner-left">
              <div class="partner-avatar ${item.avatarClass}">${item.avatar}</div>
              <div>
                <div class="partner-name">${item.name}</div>
                <div class="partner-major">${item.major}</div>
                <div class="partner-score">★ ${item.score}</div>
              </div>
            </div>
            <div class="match-circle ${item.match >= 90 ? 'green-border' : item.match >= 80 ? 'blue-border' : 'orange-border'}">${item.match}</div>
          </div>
        </div>
      `
      )
      .join('');

  resultCount.textContent = `找到 ${filteredPartners.length} 个匹配结果`;
}

function renderTags(container, list, className = '') {
  container.innerHTML = list.map((item) => `<span class="tag ${className}">${item}</span>`).join('');
}

function renderReasons(reasons) {
  reasonList.innerHTML = reasons
      .map(
          (item) => `
        <div class="reason-item">
          <div class="reason-row">
            <span>${item.text}</span>
            <span>${item.percent}%</span>
          </div>
          <div class="progress">
            <span style="width:${item.percent}%; background:${item.color};"></span>
          </div>
        </div>
      `
      )
      .join('');
}

function renderDetail(partner) {
  detailAvatar.textContent = partner.avatar;
  detailAvatar.className = `detail-avatar ${partner.avatarClass}`;
  detailName.textContent = partner.name;
  detailMajor.textContent = partner.detailMajor;
  detailScore.textContent = partner.score;
  detailMatch.textContent = `${partner.match}%`;
  detailIntro.textContent = partner.intro;

  renderReasons(partner.reasons);
  renderTags(courseTags, partner.courses);
  renderTags(timeTags, partner.times);
  renderTags(placeTags, partner.places, 'green-tag');
  renderTags(styleTags, partner.styles, 'purple-tag');
}

function applyFilters() {
  const selectedCourse = courseFilter.value;
  const minMatch = Number(matchRange.value);

  filteredPartners = partners.filter((item) => {
    const courseOk = selectedCourse === 'all' || item.course === selectedCourse;
    const matchOk = item.match >= minMatch;
    return courseOk && matchOk;
  });

  if (currentPartner && !filteredPartners.find((item) => item.id === currentPartner.id)) {
    currentPartner = filteredPartners[0] || null;
  }

  renderPartnerList();

  if (currentPartner) {
    renderDetail(currentPartner);
  }
}

matchRange.addEventListener('input', () => {
  matchRangeValue.textContent = `${matchRange.value}%`;
  applyFilters();
});

courseFilter.addEventListener('change', applyFilters);

partnerList.addEventListener('click', (e) => {
  const card = e.target.closest('.partner-card');
  if (!card) return;

  const id = card.dataset.id;
  const target = filteredPartners.find((item) => item.id === id);
  if (!target) return;

  currentPartner = target;
  renderPartnerList();
  renderDetail(currentPartner);
});

applyBtn.addEventListener('click', async () => {
  if (!currentPartner) {
    alert('当前没有可申请的学伴');
    return;
  }

  let currentUserId = null;
  try {
    const user = JSON.parse(localStorage.getItem('tc_current_user'));
    if (user && user.userId) currentUserId = user.userId;
  } catch (e) {}

  if (!currentUserId) {
    alert('请先登录后再申请学伴');
    return;
  }

  applyBtn.disabled = true;
  applyBtn.textContent = '申请中...';

  try {
    const res = await fetch(`${BASE}/partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'apply',
        applicantUserId: currentUserId,
        targetUserId: currentPartner.userId,
        message: ''
      })
    });
    const result = await res.json();

    if (result.code === 200) {
      alert(`已向 ${currentPartner.name} 发送学伴申请！`);
    } else {
      alert(result.msg || '申请发送失败');
    }
  } catch (e) {
    console.error(e);
    alert('申请发送失败，请检查后端是否启动');
  } finally {
    applyBtn.disabled = false;
    applyBtn.textContent = '申请学伴';
  }
});

if (viewProfileBtn) {
  viewProfileBtn.addEventListener('click', () => {
    if (!currentPartner) return;

    localStorage.setItem('currentProfileUser', JSON.stringify(currentPartner));
    window.location.href = 'partner-profile.html';
  });
}

// 初始化：从后端加载推荐学伴
loadRecommendations();