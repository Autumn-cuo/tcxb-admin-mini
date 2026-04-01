const profile = JSON.parse(localStorage.getItem('currentProfileUser') || 'null');

const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileMajor = document.getElementById('profileMajor');
const profileScore = document.getElementById('profileScore');
const profileIntro = document.getElementById('profileIntro');

const profileCourses = document.getElementById('profileCourses');
const profileTimes = document.getElementById('profileTimes');
const profilePlaces = document.getElementById('profilePlaces');
const profileStyles = document.getElementById('profileStyles');

const goReportBtn = document.getElementById('goReportBtn');
const blacklistBtn = document.getElementById('blacklistBtn');

function renderTags(container, list) {
  container.innerHTML = list.map(item => `<span class="tag">${item}</span>`).join('');
}

if (profile) {
  profileAvatar.textContent = profile.avatar || '👤';
  profileName.textContent = profile.name || '未知用户';
  profileMajor.textContent = profile.detailMajor || profile.major || '';
  profileScore.textContent = profile.score || '0.0';
  profileIntro.textContent = profile.intro || '暂无简介';

  renderTags(profileCourses, profile.courses || []);
  renderTags(profileTimes, profile.times || []);
  renderTags(profilePlaces, profile.places || []);
  renderTags(profileStyles, profile.styles || []);
}

if (goReportBtn) {
  goReportBtn.addEventListener('click', () => {
    localStorage.setItem('reportTargetUser', profile ? profile.name : '');
    window.location.href = 'report.html';
  });
}

if (blacklistBtn) {
  blacklistBtn.addEventListener('click', () => {
    if (!profile) return;

    const blacklistUsers = JSON.parse(localStorage.getItem('blacklistUsers') || '[]');
    const exists = blacklistUsers.some(item => item.name === profile.name);

    if (exists) {
      alert(`${profile.name} 已经在黑名单中了`);
      return;
    }

    blacklistUsers.unshift({
      name: profile.name,
      reason: '手动拉黑',
      date: new Date().toISOString().slice(0, 10)
    });

    localStorage.setItem('blacklistUsers', JSON.stringify(blacklistUsers));
    alert(`已将 ${profile.name} 加入黑名单`);
  });
}