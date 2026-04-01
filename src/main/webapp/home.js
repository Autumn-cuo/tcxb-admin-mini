const showPublishBtn = document.getElementById('showPublishBtn');
const cancelPublishBtn = document.getElementById('cancelPublishBtn');
const publishPanel = document.getElementById('publishPanel');
const submitDemandBtn = document.getElementById('submitDemandBtn');
const demandList = document.getElementById('demandList');
const pendingApplyCount = document.getElementById('pendingApplyCount');

const timeOptionButtons = document.querySelectorAll('#timeOptions .option-btn');
const placeOptionButtons = document.querySelectorAll('#placeOptions .option-btn');

const applyModal = document.getElementById('applyModal');
const applyModalMask = document.getElementById('applyModalMask');
const applyModalBody = document.getElementById('applyModalBody');
const applyModalTitle = document.getElementById('applyModalTitle');
const closeApplyModalBtn = document.getElementById('closeApplyModalBtn');

const editProfileBtn = document.getElementById('editProfileBtn');
const profileModal = document.getElementById('profileModal');
const profileModalMask = document.getElementById('profileModalMask');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');

const profileName = document.getElementById('profileName');
const profileStudentNo = document.getElementById('profileStudentNo');
const profileScore = document.getElementById('profileScore');
const profileMajor = document.getElementById('profileMajor');
const profileGrade = document.getElementById('profileGrade');
const profileCourses = document.getElementById('profileCourses');

const editName = document.getElementById('editName');
const editStudentNo = document.getElementById('editStudentNo');
const editMajor = document.getElementById('editMajor');
const editGrade = document.getElementById('editGrade');
const editCourses = document.getElementById('editCourses');

const courseSelect = document.getElementById('courseSelect');
const customCourseInput = document.getElementById('customCourseInput');

let currentViewingDemandId = null;

/* =========================
   通用工具函数
========================= */
function toggleOption(button) {
  button.classList.toggle('active');
}

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* =========================
   个人资料模块
========================= */
function getProfileData() {
  // 优先从登录状态中取
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const saved = localStorage.getItem('tc_user_profile');

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // 如果有真实 userId，说明数据来自后端，直接使用
      if (parsed && parsed.name) return parsed;
    } catch (e) {}
  }

  if (currentUser) {
    const courses = currentUser.preferredCourses
      ? currentUser.preferredCourses.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const profile = {
      name: currentUser.realName || currentUser.nickname || '同学',
      studentNo: currentUser.studentNo || '',
      major: currentUser.major || '',
      grade: currentUser.grade || '',
      score: currentUser.trustScore != null ? String(currentUser.trustScore) : '100',
      courses
    };
    localStorage.setItem('tc_user_profile', JSON.stringify(profile));
    return profile;
  }

  const defaultProfile = {
    name: '张三',
    studentNo: '2021001234',
    major: '计算机科学与技术',
    grade: '大三年级',
    score: '4.8',
    courses: ['数据结构', '算法设计', '操作系统', '计算机网络']
  };

  localStorage.setItem('tc_user_profile', JSON.stringify(defaultProfile));
  return defaultProfile;
}

function saveProfileData(data) {
  localStorage.setItem('tc_user_profile', JSON.stringify(data));
}

function renderProfile() {
  const profile = getProfileData();

  if (profileName) profileName.textContent = profile.name;
  if (profileStudentNo) profileStudentNo.textContent = profile.studentNo;
  if (profileScore) profileScore.textContent = `★ ${profile.score} 信任分`;
  if (profileMajor) profileMajor.textContent = profile.major;
  if (profileGrade) profileGrade.textContent = profile.grade;

  if (profileCourses) {
    profileCourses.innerHTML = profile.courses
        .map((course) => `<span class="tag">${course}</span>`)
        .join('');
  }

  const topUserName = document.querySelector('.user-name');
  if (topUserName) {
    topUserName.textContent = profile.name;
  }

  const pageTitle = document.querySelector('.page-header h1');
  if (pageTitle) {
    pageTitle.textContent = `欢迎回来，${profile.name}`;
  }
}

function openProfileModal() {
  const profile = getProfileData();

  if (editName) editName.value = profile.name;
  if (editStudentNo) editStudentNo.value = profile.studentNo;
  if (editMajor) editMajor.value = profile.major;
  if (editGrade) editGrade.value = profile.grade;
  if (editCourses) editCourses.value = profile.courses.join('，');

  if (profileModal) {
    profileModal.classList.remove('hidden');
  }
}

function closeProfileModal() {
  if (profileModal) {
    profileModal.classList.add('hidden');
  }
}

function handleSaveProfile() {
  const name = editName ? editName.value.trim() : '';
  const major = editMajor ? editMajor.value.trim() : '';
  const grade = editGrade ? editGrade.value.trim() : '';
  const coursesText = editCourses ? editCourses.value.trim() : '';

  if (!name) {
    alert('请输入姓名');
    return;
  }

  if (!major) {
    alert('请输入专业');
    return;
  }

  if (!grade) {
    alert('请输入年级');
    return;
  }

  if (!coursesText) {
    alert('请输入在修课程');
    return;
  }

  const courses = coursesText
      .split(/[，,]/)
      .map((item) => item.trim())
      .filter((item) => item);

  if (courses.length === 0) {
    alert('请至少填写一门课程');
    return;
  }

  const oldProfile = getProfileData();
  const newProfile = {
    ...oldProfile,
    name,
    major,
    grade,
    courses
  };

  saveProfileData(newProfile);
  renderProfile();
  closeProfileModal();

  // 同步到后端
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (currentUser && currentUser.userId) {
    const BASE = window.API_BASE || '/tcxb-admin-mini';
    fetch(`${BASE}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'updateProfile',
        userId: currentUser.userId,
        realName: name,
        major,
        grade,
        preferredCourses: courses.join(','),
        preferredTimes: currentUser.preferredTimes || '',
        preferredPlaces: currentUser.preferredPlaces || ''
      })
    })
      .then(res => res.json())
      .then(result => {
        if (result.code === 200 && result.data) {
          // 更新 localStorage 中的用户信息
          const updated = {
            ...currentUser,
            realName: name,
            major,
            grade,
            preferredCourses: courses.join(',')
          };
          localStorage.setItem('tc_current_user', JSON.stringify(updated));
        }
      })
      .catch(err => console.error('更新资料失败:', err));
  }

  alert('个人资料已更新');
}

/* =========================
   课程下拉 + 自定义课程模块
========================= */
function getCourseOptions() {
  const saved = localStorage.getItem('tc_course_options');

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  const defaultCourses = [
    '数据结构',
    '算法设计',
    '操作系统',
    '计算机网络',
    'Java Web',
    '软件工程',
    '计算机组成原理'
  ];

  localStorage.setItem('tc_course_options', JSON.stringify(defaultCourses));
  return defaultCourses;
}

function saveCourseOptions(courses) {
  localStorage.setItem('tc_course_options', JSON.stringify(courses));
}

function renderCourseOptions(selectedValue = '') {
  if (!courseSelect) return;

  const courses = getCourseOptions();

  courseSelect.innerHTML = `
    <option value="">请选择课程</option>
    ${courses.map((course) => `<option value="${course}">${course}</option>`).join('')}
    <option value="__custom__">自定义课程</option>
  `;

  if (selectedValue) {
    courseSelect.value = selectedValue;
  } else {
    courseSelect.value = '';
  }
}

function handleCourseChange() {
  if (!courseSelect || !customCourseInput) return;

  if (courseSelect.value === '__custom__') {
    customCourseInput.classList.remove('hidden');
    customCourseInput.focus();
  } else {
    customCourseInput.classList.add('hidden');
    customCourseInput.value = '';
  }
}

function getSelectedCourseValue() {
  if (!courseSelect) return '';

  if (courseSelect.value === '__custom__') {
    return customCourseInput ? customCourseInput.value.trim() : '';
  }

  return courseSelect.value.trim();
}

/* =========================
   申请查看模块
========================= */
function getDemandApplications() {
  const saved = localStorage.getItem('tc_demand_applications');

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  const defaultData = {
    demand_ds_001: [
      {
        id: 'apply_001',
        applicantName: '李四',
        course: '数据结构',
        applyTime: '2026-03-28 19:30',
        message: '我最近也在准备数据结构期末，晚上和周末都比较有空，想一起刷题复习。',
        status: 'pending'
      },
      {
        id: 'apply_002',
        applicantName: '王五',
        course: '数据结构',
        applyTime: '2026-03-29 14:20',
        message: '我擅长图和树的题目，希望一起查漏补缺，提高复习效率。',
        status: 'pending'
      }
    ],
    demand_os_001: [
      {
        id: 'apply_003',
        applicantName: '赵六',
        course: '操作系统',
        applyTime: '2026-03-12 16:10',
        message: '之前一起讨论过实验内容，想继续合作完成后续学习安排。',
        status: 'accepted'
      }
    ]
  };

  localStorage.setItem('tc_demand_applications', JSON.stringify(defaultData));
  return defaultData;
}

function saveDemandApplications(data) {
  localStorage.setItem('tc_demand_applications', JSON.stringify(data));
}

function getStatusText(status) {
  if (status === 'accepted') return '已接受';
  if (status === 'rejected') return '已拒绝';
  return '待处理';
}

function getStatusClass(status) {
  if (status === 'accepted') return 'apply-status-accepted';
  if (status === 'rejected') return 'apply-status-rejected';
  return 'apply-status-pending';
}

function updatePendingApplyCount() {
  const data = getDemandApplications();
  let count = 0;

  Object.values(data).forEach((list) => {
    list.forEach((item) => {
      if (item.status === 'pending') count += 1;
    });
  });

  if (pendingApplyCount) {
    pendingApplyCount.textContent = String(count);
  }
}

function updateDemandApplyDisplay() {
  const data = getDemandApplications();
  const demandItems = document.querySelectorAll('.demand-item[data-demand-id]');

  demandItems.forEach((item) => {
    const demandId = item.dataset.demandId;
    const list = data[demandId] || [];
    const countTextNode = item.querySelector('.bottom-row span:nth-child(2)');

    if (countTextNode) {
      const pendingCount = list.filter((apply) => apply.status === 'pending').length;
      countTextNode.textContent = `${pendingCount} 个申请`;
    }
  });
}

function renderApplyModal(demandId) {
  const data = getDemandApplications();
  const list = data[demandId] || [];
  currentViewingDemandId = demandId;

  if (applyModalTitle) {
    applyModalTitle.textContent = '查看申请';
  }

  if (!applyModalBody) return;

  if (list.length === 0) {
    applyModalBody.innerHTML = `<div class="apply-empty">当前暂无申请记录</div>`;
    return;
  }

  applyModalBody.innerHTML = list
      .map((item) => {
        const isPending = item.status === 'pending';

        return `
        <div class="apply-record" data-apply-id="${item.id}">
          <div class="apply-record-top">
            <div class="apply-user-name">${item.applicantName}</div>
            <span class="apply-status-tag ${getStatusClass(item.status)}">${getStatusText(item.status)}</span>
          </div>

          <div class="apply-record-meta">
            <span>申请课程：${item.course}</span>
            <span>申请时间：${item.applyTime}</span>
          </div>

          <div class="apply-record-desc">${item.message}</div>

          <div class="apply-record-actions">
            ${
            isPending
                ? `
              <button class="apply-accept-btn" data-action="accept" data-apply-id="${item.id}">接受</button>
              <button class="apply-reject-btn" data-action="reject" data-apply-id="${item.id}">拒绝</button>
            `
                : `<span class="apply-disabled-text">该申请已处理</span>`
        }
          </div>
        </div>
      `;
      })
      .join('');
}

function openApplyModal(demandId) {
  renderApplyModal(demandId);
  if (applyModal) {
    applyModal.classList.remove('hidden');
  }
}

function closeApplyModal() {
  if (applyModal) {
    applyModal.classList.add('hidden');
  }
}

function handleApplyAction(demandId, applyId, action) {
  const data = getDemandApplications();
  const list = data[demandId] || [];
  const target = list.find((item) => item.id === applyId);

  if (!target) return;

  target.status = action === 'accept' ? 'accepted' : 'rejected';
  saveDemandApplications(data);

  updatePendingApplyCount();
  updateDemandApplyDisplay();
  renderApplyModal(demandId);

  alert(action === 'accept' ? '已接受该申请' : '已拒绝该申请');
}

/* =========================
   发布需求模块
========================= */
function createDemandCard(course, goal, times, places, desc, demandId) {
  return `
    <div class="demand-item new-demand-item" data-demand-id="${demandId}">
      <div class="demand-title-row">
        <div class="demand-title">
          ${course} <span class="mini-tag green-tag">活跃</span>
        </div>
      </div>
      <div class="demand-desc">
        ${goal}。${desc}
      </div>
      <div class="meta-row">
        <span>偏好时间：${times.join('、')}</span>
        <span>偏好地点：${places.join('、')}</span>
      </div>
      <div class="bottom-row">
        <span>发布于 ${getToday()}</span>
        <span>0 个申请</span>
        <div class="demand-action-group">
          <button class="small-btn">查看申请</button>
          <button class="delete-btn">删除</button>
        </div>
      </div>
    </div>
  `;
}

function clearPublishForm() {
  if (courseSelect) {
    renderCourseOptions('');
  }

  if (customCourseInput) {
    customCourseInput.value = '';
    customCourseInput.classList.add('hidden');
  }

  const studyGoal = document.getElementById('studyGoal');
  const demandDesc = document.getElementById('demandDesc');

  if (studyGoal) studyGoal.value = '';
  if (demandDesc) demandDesc.value = '';

  document.querySelectorAll('.option-btn.active').forEach((item) => {
    item.classList.remove('active');
  });
}

function openPublishPanel() {
  if (publishPanel) {
    publishPanel.classList.remove('hidden');
  }

  renderCourseOptions();
  if (customCourseInput) {
    customCourseInput.classList.add('hidden');
    customCourseInput.value = '';
  }
}

function closePublishPanel() {
  if (publishPanel) {
    publishPanel.classList.add('hidden');
  }
}

function handleSubmitDemand() {
  const course = getSelectedCourseValue();
  const studyGoal = document.getElementById('studyGoal');
  const demandDesc = document.getElementById('demandDesc');

  const goal = studyGoal ? studyGoal.value.trim() : '';
  const desc = demandDesc ? demandDesc.value.trim() : '';

  const selectedTimes = [...document.querySelectorAll('#timeOptions .option-btn.active')].map(
      (item) => item.dataset.value
  );

  const selectedPlaces = [...document.querySelectorAll('#placeOptions .option-btn.active')].map(
      (item) => item.dataset.value
  );

  if (!course) {
    alert('请选择或输入课程名称');
    return;
  }

  if (!goal) {
    alert('请输入学习目标');
    return;
  }

  if (selectedTimes.length === 0) {
    alert('请至少选择一个偏好时间');
    return;
  }

  if (selectedPlaces.length === 0) {
    alert('请至少选择一个偏好地点');
    return;
  }

  if (!desc) {
    alert('请输入需求描述');
    return;
  }

  if (courseSelect && courseSelect.value === '__custom__') {
    const courses = getCourseOptions();

    if (!courses.includes(course)) {
      courses.push(course);
      saveCourseOptions(courses);
    }
  }

  const demandId = `demand_${Date.now()}`;
  const newCardHtml = createDemandCard(course, goal, selectedTimes, selectedPlaces, desc, demandId);

  if (demandList) {
    demandList.insertAdjacentHTML('afterbegin', newCardHtml);
  }

  const data = getDemandApplications();
  data[demandId] = [];
  saveDemandApplications(data);

  updatePendingApplyCount();
  updateDemandApplyDisplay();

  alert('发布需求成功！');

  clearPublishForm();
  closePublishPanel();
}

/* =========================
   事件绑定
========================= */
timeOptionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    toggleOption(button);
  });
});

placeOptionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    toggleOption(button);
  });
});

if (showPublishBtn) {
  showPublishBtn.addEventListener('click', openPublishPanel);
}

if (cancelPublishBtn) {
  cancelPublishBtn.addEventListener('click', closePublishPanel);
}

if (submitDemandBtn) {
  submitDemandBtn.addEventListener('click', handleSubmitDemand);
}

if (demandList) {
  demandList.addEventListener('click', (e) => {
    const demandItem = e.target.closest('.demand-item');
    if (!demandItem) return;

    const demandId = demandItem.dataset.demandId;

    if (e.target.classList.contains('small-btn')) {
      openApplyModal(demandId);
      return;
    }

    if (e.target.classList.contains('delete-btn')) {
      const ok = window.confirm('确认删除这条学伴需求吗？');
      if (!ok) return;

      const data = getDemandApplications();
      delete data[demandId];
      saveDemandApplications(data);

      demandItem.remove();
      updatePendingApplyCount();
      updateDemandApplyDisplay();
    }
  });
}

if (applyModalBody) {
  applyModalBody.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn || !currentViewingDemandId) return;

    const action = actionBtn.dataset.action;
    const applyId = actionBtn.dataset.applyId;

    handleApplyAction(currentViewingDemandId, applyId, action);
  });
}

if (closeApplyModalBtn) {
  closeApplyModalBtn.addEventListener('click', closeApplyModal);
}

if (applyModalMask) {
  applyModalMask.addEventListener('click', closeApplyModal);
}

if (editProfileBtn) {
  editProfileBtn.addEventListener('click', openProfileModal);
}

if (closeProfileModalBtn) {
  closeProfileModalBtn.addEventListener('click', closeProfileModal);
}

if (cancelProfileBtn) {
  cancelProfileBtn.addEventListener('click', closeProfileModal);
}

if (profileModalMask) {
  profileModalMask.addEventListener('click', closeProfileModal);
}

if (saveProfileBtn) {
  saveProfileBtn.addEventListener('click', handleSaveProfile);
}

if (courseSelect) {
  courseSelect.addEventListener('change', handleCourseChange);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeApplyModal();
    closeProfileModal();
  }
});

/* =========================
   页面初始化
========================= */
renderProfile();
renderCourseOptions();
updatePendingApplyCount();
updateDemandApplyDisplay();