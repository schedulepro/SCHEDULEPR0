document.addEventListener("DOMContentLoaded", () => {
  const badges = document.querySelectorAll(".badge");

  // Animate entrance ng badges
  badges.forEach((badge, index) => {
    badge.style.opacity = "0";
    badge.style.transform = "scale(0.8)";
    setTimeout(() => {
      badge.style.transition = "all 0.4s ease";
      badge.style.opacity = "1";
      badge.style.transform = "scale(1)";
    }, index * 80);
  });

  // Load unlocked + progress from localStorage
  const unlockedBadges = JSON.parse(localStorage.getItem("unlockedBadges")) || [];
  let badgeProgress = JSON.parse(localStorage.getItem("badgeProgress")) || {};

  // Default progress
  const defaultProgress = {
    onTimeFinisher: 0,
    beatTheClock: 0,
    deadlineCrusher: 0,
    focused: 0,
    consistent: 0,
    weekStreak: 0,
    monthStreak: 0,
    dailyCompleter: 0,
    taskMaster: 0,
    organizer: 0,
    earlyStarter: 0,
    legendaryScheduler: 0,
    midLevelFinisher: 0,
    speedRunner: 0,
    categoryChampion: 0,
    earlyBird: 0,
    questMaster: 0,
    timeWizard: 0,
    legendaryOrganizer: 0,
    ultimateScheduler: 0
  };

  badgeProgress = { ...defaultProgress, ...badgeProgress };

  // Show already unlocked badges
  badges.forEach(badge => {
    const badgeKey = badge.dataset.badge;
    if (unlockedBadges.includes(badgeKey)) {
      unlockBadge(badge, false); 
    }
  });

  // Initial check
  checkBadgeUnlock();
});

function unlockBadge(badgeElement, isNew = true) {
  if (!badgeElement) return;

  badgeElement.classList.remove("locked");
  badgeElement.classList.add("unlocked");

  if (isNew) {
    badgeElement.classList.add("newly-unlocked");
    setTimeout(() => badgeElement.classList.remove("newly-unlocked"), 1500);

    const unlockedBadges = JSON.parse(localStorage.getItem("unlockedBadges")) || [];
    if (!unlockedBadges.includes(badgeElement.dataset.badge)) {
      unlockedBadges.push(badgeElement.dataset.badge);
      localStorage.setItem("unlockedBadges", JSON.stringify(unlockedBadges));
    }
  }
}

function checkBadgeUnlock(task = null, completionDate = null) {
  const completedQuests = JSON.parse(localStorage.getItem("completedQuests")) || [];
  const quests = JSON.parse(localStorage.getItem("quests")) || [];
  let unlockedBadges = JSON.parse(localStorage.getItem("unlockedBadges")) || [];
  let badgeProgress = JSON.parse(localStorage.getItem("badgeProgress")) || {};

  let completedCount = completedQuests.length;
  let earlyTasks = parseInt(localStorage.getItem("earlyTasks") || "0");
  let streak = parseInt(localStorage.getItem("streak") || "0");
  const lastDate = localStorage.getItem("lastCompletedDate");
  const today = new Date();

  // ✅ Update streak at earlyTasks kung may bagong task
  if (task && completionDate) {
    const due = new Date(task.dueDate);

    // Early tasks
    if (completionDate < due) earlyTasks++;
    localStorage.setItem("earlyTasks", earlyTasks);

    // Streak
    if (lastDate) {
      const diff = (new Date(completionDate.toDateString()) - new Date(lastDate)) / (1000*60*60*24);
      streak = diff === 1 ? streak + 1 : 1;
    } else streak = 1;
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastCompletedDate", completionDate.toDateString());

    // Progress tracking per badge (single completion)
    if (completionDate <= due) badgeProgress.onTimeFinisher = 1;
    if ((due - completionDate) >= 60*60*1000) badgeProgress.beatTheClock = 1;
    if (completionDate.getHours() < 8) {
      badgeProgress.earlyStarter = 1;
      badgeProgress.earlyBird = 1;
    }
    if (completedCount > 0 && completedQuests.every(q => {
      const completed = new Date(q.completionDate);
      return completed.toDateString() === today.toDateString();
    })) badgeProgress.dailyCompleter = 1;
  }

  // 📌 Always update cumulative badges kahit walang bagong task
  badgeProgress.deadlineCrusher = earlyTasks;
  badgeProgress.speedRunner = earlyTasks;
  badgeProgress.timeWizard = earlyTasks;

  badgeProgress.focused = streak;
  badgeProgress.consistent = streak;
  badgeProgress.weekStreak = streak;
  badgeProgress.monthStreak = streak;

  badgeProgress.taskMaster = completedCount;
  badgeProgress.midLevelFinisher = completedCount;
  badgeProgress.questMaster = completedCount;

  const categories = [...new Set(quests.map(q => q.category))];
  badgeProgress.organizer = categories.length;
  badgeProgress.categoryChampion = categories.length;
  badgeProgress.legendaryOrganizer = categories.length;

  const unlockedCount = unlockedBadges.length;
  badgeProgress.legendaryScheduler = unlockedCount;
  badgeProgress.ultimateScheduler = unlockedCount;

  localStorage.setItem("badgeProgress", JSON.stringify(badgeProgress));

  // ===== Helper: Update badge progress text =====
  function updateBadgeProgress(badgeKey, current, required) {
    const badgeElem = document.querySelector(`.badge[data-badge="${badgeKey}"] .progress`);
    if (!badgeElem) return;

    // Kapag unlocked na, laging full progress
    if (unlockedBadges.includes(badgeKey)) {
      badgeElem.textContent = `${required}/${required}`;
    } else {
      badgeElem.textContent = `${Math.min(current, required)}/${required}`;
    }
  }

  // ===== Unlock + Update UI =====
  const requirements = {
    onTimeFinisher: 1,
    beatTheClock: 1,
    deadlineCrusher: 5,
    focused: 3,
    consistent: 7,
    weekStreak: 7,
    monthStreak: 30,
    dailyCompleter: 1,
    taskMaster: 10,
    organizer: 5,
    earlyStarter: 1,
    legendaryScheduler: 9,
    midLevelFinisher: 15,
    speedRunner: 5,
    categoryChampion: 5,
    earlyBird: 1,
    questMaster: 50,
    timeWizard: 20,
    legendaryOrganizer: 10,
    ultimateScheduler: 20
  };

  Object.keys(requirements).forEach(key => {
    const badgeElem = document.querySelector(`.badge[data-badge="${key}"]`);
    if (!badgeElem) return;

    const current = badgeProgress[key] || 0;
    const required = requirements[key];

    // Unlock if requirement met
    if (current >= required && !unlockedBadges.includes(key)) {
      unlockBadge(badgeElem);
      unlockedBadges.push(key);
      localStorage.setItem("unlockedBadges", JSON.stringify(unlockedBadges));
    }

    // Update progress text
    updateBadgeProgress(key, current, required);
  });
}
