document.addEventListener("DOMContentLoaded", () => {
  // === Elements ===
  const calendarHeader = document.getElementById("calendarHeader");
  const calendarGrid = document.getElementById("calendarGrid");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const streakElem = document.getElementById("streakCount");
  const badgeElem = document.getElementById("badgeCount");
  const expFill = document.getElementById("expFill");
  const expText = document.getElementById("expText");
  const levelLabel = document.getElementById("levelLabel");
  

  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();


  // === Calendar Rendering ===
  function renderCalendar(month, year) {
    calendarHeader.textContent = `${months[month]} ${year}`;
    calendarGrid.innerHTML = "";

    // Day labels
    days.forEach(d => {
      const dayElem = document.createElement("div");
      dayElem.textContent = d;
      dayElem.classList.add("day");
      calendarGrid.appendChild(dayElem);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) calendarGrid.appendChild(document.createElement("div"));

    for (let i = 1; i <= daysInMonth; i++) {
      const dateElem = document.createElement("div");
      dateElem.textContent = i;
      dateElem.classList.add("date");
      if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dateElem.classList.add("today");
      }
      calendarGrid.appendChild(dateElem);
    }
  }

  // === Load Streak ===
  function loadStreak() {
    const streak = parseInt(localStorage.getItem("streak")) || 0;
    if (streakElem) streakElem.textContent = `${streak} Day${streak === 1 ? "" : "s"}`;
  }

  // === Load Badges ===
  function loadBadges() {
    const unlocked = JSON.parse(localStorage.getItem("unlockedBadges")) || [];
    if (badgeElem) badgeElem.textContent = unlocked.length;
  }

  // === Load Quest Stats ===
  function loadQuestStats() {
    const completed = JSON.parse(localStorage.getItem("completedQuests")) || [];
    const quests = JSON.parse(localStorage.getItem("quests")) || [];
    const finishedElem = document.getElementById("finishedCount");
    const pendingElem = document.getElementById("pendingCount");

    if (finishedElem) finishedElem.textContent = completed.length;
    if (pendingElem) pendingElem.textContent = quests.length;
  }

// === Load Upcoming Tasks ===
function loadUpcomingTasks() {
  const quests = JSON.parse(localStorage.getItem("quests")) || [];
  const taskList = document.getElementById("upcomingTasks");
  if (!taskList) return;

  taskList.innerHTML = ""; // clear previous items

  // Filter valid quests lang (may label at dueDate)
  const validQuests = quests.filter(q => q && q.label && q.dueDate);

  if (validQuests.length === 0) {
    taskList.innerHTML = `<li style="text-align:center;">No upcoming tasks 🎉</li>`;
    return;
  }

  // I-loop lahat ng valid quests (hindi lang 3)
  validQuests.forEach(q => {
    const li = document.createElement("li");
    li.textContent = `📌 ${q.label}`; // pwede mo rin idagdag dueDate kung gusto
    taskList.appendChild(li);
  });
}

  // === Display Today's Date ===
  function updateTodayDate() {
    const dateElem = document.getElementById("dateText");
    if (!dateElem) return;

    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const now = new Date();
    dateElem.textContent = `Today is ${now.toLocaleDateString("en-US", options)}`;
  }

  updateTodayDate(); // tawagin agad

  // === EXP & Level System ===
  let currentExp = parseInt(localStorage.getItem("exp")) || 0;
  let currentLevel = parseInt(localStorage.getItem("level")) || 1;

  function getExpNeeded(level) {
    return 100 + (level - 1) * 75; // dynamic EXP per level
  }

  function updateExpUI() {
    const expNeeded = getExpNeeded(currentLevel);
    const percent = Math.min((currentExp / expNeeded) * 100, 100);

    if (expFill) expFill.style.width = percent + "%";
    if (expText) expText.textContent = `${currentExp} / ${expNeeded} EXP`;
    if (levelLabel) levelLabel.textContent = `Level ${currentLevel}`;
  }

  function addExp(amount) {
    currentExp += amount;
    while (currentExp >= getExpNeeded(currentLevel)) {
      currentExp -= getExpNeeded(currentLevel);
      currentLevel++;
    }
    localStorage.setItem("exp", currentExp);
    localStorage.setItem("level", currentLevel);
    updateExpUI();
  }

  // === Calendar Navigation ===
  prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  });

  nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
  });

  // === Initial Load ===
  renderCalendar(currentMonth, currentYear);
  loadStreak();
  loadBadges();
  loadQuestStats();
  loadUpcomingTasks();
  updateExpUI();

  // === Storage Listener for Cross-Tab Sync ===
  window.addEventListener("storage", (e) => {
    if (e.key === "streak") loadStreak();
    if (e.key === "unlockedBadges") loadBadges();
    if (e.key === "quests" || e.key === "completedQuests") {
      loadQuestStats();
      loadUpcomingTasks();
    }
    if (e.key === "exp" || e.key === "level") {
      currentExp = parseInt(localStorage.getItem("exp")) || 0;
      currentLevel = parseInt(localStorage.getItem("level")) || 1;
      updateExpUI();
    }
  });

  // === Custom Event Listener for Same Tab Updates ===
  window.addEventListener("expLevelChanged", () => {
    currentExp = parseInt(localStorage.getItem("exp")) || 0;
    currentLevel = parseInt(localStorage.getItem("level")) || 1;
    updateExpUI();
  });

});
