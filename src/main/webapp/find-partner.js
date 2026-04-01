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

const partners = [
  {
    id: 'lisi',
    avatar: '👩‍🦳',
    avatarClass: 'blue',
    name: '李四',
    major: '计算机科学与技术',
    detailMajor: '计算机科学与技术 · 大三年级 · 2021001235',
    score: '4.9',
    match: 95,
    intro: '认真学习，追求卓越，喜欢有计划地推进学习任务。',
    course: '数据结构',
    courses: ['数据结构', '算法设计', '数据库系统'],
    times: ['晚上', '下午'],
    places: ['图书馆', '咖啡厅'],
    styles: ['深度学习', '项目实践'],
    reasons: [
      { text: '你们都在学习“数据结构”和“算法设计”', percent: 30, color: '#3f6fb5' },
      { text: '学习时间高度重合：晚上、下午', percent: 25, color: '#16a34a' },
      { text: '都偏好在图书馆学习', percent: 20, color: '#9333ea' },
      { text: '学习风格相似：深度学习、项目实践', percent: 15, color: '#db2777' },
      { text: '信任分数相近，学习态度认真', percent: 5, color: '#ea580c' }
    ]
  },
  {
    id: 'wangwu',
    avatar: '👨',
    avatarClass: 'deep-blue',
    name: '王五',
    major: '软件工程',
    detailMajor: '软件工程 · 大三年级 · 2021001236',
    score: '4.6',
    match: 82,
    intro: '擅长项目开发，习惯先拆分任务再一起推进。',
    course: '操作系统',
    courses: ['操作系统', '软件工程'],
    times: ['周末', '晚上'],
    places: ['图书馆'],
    styles: ['讨论交流', '项目实践'],
    reasons: [
      { text: '都在学习操作系统相关内容', percent: 28, color: '#3f6fb5' },
      { text: '时间安排较匹配：周末、晚上', percent: 22, color: '#16a34a' },
      { text: '都愿意一起讨论实验与项目', percent: 18, color: '#9333ea' },
      { text: '偏好地点接近：图书馆', percent: 16, color: '#db2777' },
      { text: '合作节奏较一致', percent: 8, color: '#ea580c' }
    ]
  },
  {
    id: 'zhaoliu',
    avatar: '👩',
    avatarClass: 'pink',
    name: '赵六',
    major: '计算机科学与技术',
    detailMajor: '计算机科学与技术 · 大三年级 · 2021001237',
    score: '4.7',
    match: 78,
    intro: '偏安静自习，做题耐心，适合长期稳定学习搭子。',
    course: '计算机网络',
    courses: ['计算机网络', '数据库系统'],
    times: ['下午'],
    places: ['自习室'],
    styles: ['安静自习', '独立学习'],
    reasons: [
      { text: '课程方向较接近', percent: 24, color: '#3f6fb5' },
      { text: '时间段有交集：下午', percent: 20, color: '#16a34a' },
      { text: '都喜欢安静自习环境', percent: 18, color: '#9333ea' },
      { text: '地点偏好接近：自习室', percent: 12, color: '#db2777' },
      { text: '基础能力较接近', percent: 6, color: '#ea580c' }
    ]
  }
];

let filteredPartners = [...partners];
let currentPartner = partners[0];

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

  if (!filteredPartners.find((item) => item.id === currentPartner.id)) {
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

applyBtn.addEventListener('click', () => {
  if (!currentPartner) {
    alert('当前没有可申请的学伴');
    return;
  }

  const appliedPartners = JSON.parse(localStorage.getItem('appliedPartners') || '[]');

  const exists = appliedPartners.some((item) => item.name === currentPartner.name);

  if (exists) {
    alert(`你已经向 ${currentPartner.name} 发送过申请了`);
    return;
  }

  appliedPartners.push({
    name: currentPartner.name,
    course: currentPartner.course,
    progressTotal: 12,
    matchedAt: new Date().toISOString().slice(0, 10)
  });

  localStorage.setItem('appliedPartners', JSON.stringify(appliedPartners));

  alert(`已向 ${currentPartner.name} 发送学伴申请！`);
});

if (viewProfileBtn) {
  viewProfileBtn.addEventListener('click', () => {
    if (!currentPartner) return;

    localStorage.setItem('currentProfileUser', JSON.stringify(currentPartner));
    window.location.href = 'partner-profile.html';
  });
}

renderPartnerList();
renderDetail(currentPartner);