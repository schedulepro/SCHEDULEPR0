document.addEventListener("DOMContentLoaded", function () {
  const dueDateInput = document.getElementById("dueDate");
  const taskForm = document.querySelector(".quest-form");
  const questTableBody = document.querySelector("#questTable tbody");
  const completedList = document.getElementById("completedList");

  // ======== Flatpickr Modern Date & Time Picker ========
  flatpickr("#dueDate", {
    enableTime: true,
    dateFormat: "Y-m-d h:i K",  // AM/PM
    time_24hr: false,
    minuteIncrement: 1,
    defaultDate: null,
    wrap: false,
    plugins: [new confirmDatePlugin({
      confirmText: "OK",
      confirmIcon: '',
      showAlways: false,
      theme: "light"
    })],
    onOpen: function (selectedDates, dateStr, instance) {
      instance.calendarContainer.classList.add("flatpickr-custom");
    }
  });

  // ======== Badge Popup ========
  function showBadgePopup(badgeName) {
    const popup = document.getElementById("badgeUnlockPopup");
    const message = document.getElementById("badgeUnlockMessage");

    if (!popup || !message) return;

    message.textContent = `You unlocked the "${badgeName}" badge! 🎉`;
    popup.classList.add("show");

    // Auto hide after 3s
    setTimeout(() => {
      popup.classList.remove("show");
    }, 3000);
  }

  document.getElementById("closeBadgePopup")?.addEventListener("click", () => {
    document.getElementById("badgeUnlockPopup").classList.remove("show");
  });

  // ======== Badges ========
  function unlockBadge(badgeKey) {
    const unlocked = JSON.parse(localStorage.getItem("unlockedBadges")) || [];
    if (!unlocked.includes(badgeKey)) {
      unlocked.push(badgeKey);
      localStorage.setItem("unlockedBadges", JSON.stringify(unlocked));

      const badgeElem = document.querySelector(`.badge[data-badge="${badgeKey}"]`);
      if (badgeElem) {
        badgeElem.classList.remove("locked");
        badgeElem.classList.add("unlocked", "newly-unlocked");
        setTimeout(() => badgeElem.classList.remove("newly-unlocked"), 1500);
      }

      // 🔔 Show popup notification
      showBadgePopup(badgeKey);
    }
  }

  // ======== Update Streak + Badge Logic ========
function updateStreakAndBadges(task, completionDate) {
  const now = new Date(completionDate.toDateString());

  let streak = parseInt(localStorage.getItem("streak") || "0");
  const lastDateStr = localStorage.getItem("lastCompletedDate");

  if (lastDateStr) {
    const lastDate = new Date(lastDateStr);
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // sunod-sunod na araw
      streak = streak + 1;
    } else if (diffDays === 0) {
      // same day, huwag gagalawin
      streak = streak;
    } else {
      // pumalya (lagpas ng 1 araw)
      streak = 0; // reset muna sa 0
    }
  } else {
    streak = 1; // first ever completion
  }

  // kapag pumalya, dapat next completion ulit siya magiging 1
  if (streak === 0) {
    streak = 1;
  }

  localStorage.setItem("streak", streak);
  localStorage.setItem("lastCompletedDate", now.toDateString());

  // === BADGES & PROGRESS (same code mo, wala akong binawas) ===
  let earlyTasks = parseInt(localStorage.getItem("earlyTasks") || "0");
  const due = new Date(task.dueDate);
  if (completionDate < due) {
    earlyTasks++;
    localStorage.setItem("earlyTasks", earlyTasks);
  }

  const completed = JSON.parse(localStorage.getItem("completedQuests") || "[]");
  const completedCount = completed.length;

  const quests = JSON.parse(localStorage.getItem("quests") || "[]");
  const categories = [...new Set(quests.map(q => q.category))];

  const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  const rules = {
    "onTimeFinisher": completionDate <= due,
    "beatTheClock": (new Date(due.getFullYear(), due.getMonth(), due.getDate(), 23, 59, 59) - completionDate) >= 60 * 60 * 1000,
    "deadlineCrusher": earlyTasks >= 5,
    "focused": streak >= 3,
    "consistent": streak >= 7,
    "weekStreak": streak >= 7,
    "monthStreak": streak >= 30,
    "dailyCompleter": completed.length > 0 && completed.every(q => {
      const questDue = new Date(q.dueDate);
      const completion = new Date(q.completionDate);
      return completion < deadline && completion <= questDue;
    }),
    "taskMaster": completedCount >= 10,
    "organizer": categories.length >= 5,
    "earlyStarter": completionDate.getHours() < 8,
    "legendaryScheduler": (JSON.parse(localStorage.getItem("unlockedBadges")) || []).length >= 9,
    "midLevelFinisher": completedCount >= 15,
    "speedRunner": earlyTasks >= 5,
    "categoryChampion": categories.length >= 5,
    "earlyBird": completionDate.getHours() < 8,
    "questMaster": completedCount >= 50,
    "timeWizard": earlyTasks >= 20,
    "legendaryOrganizer": categories.length >= 10,
    "ultimateScheduler": (JSON.parse(localStorage.getItem("unlockedBadges")) || []).length >= 20
  };

  Object.keys(rules).forEach(key => {
    if (rules[key]) unlockBadge(key);
  });

  function updateProgress(badgeKey, current, required) {
    const badgeElem = document.querySelector(`.badge[data-badge="${badgeKey}"] .progress`);
    if (badgeElem) badgeElem.textContent = `${Math.min(current, required)}/${required}`;
  }

  const onTimeCount = completed.filter(q => new Date(q.completionDate) <= new Date(q.dueDate)).length;
  const earlyCount = completed.filter(q => new Date(q.completionDate).getHours() < 8).length;

  updateProgress("onTimeFinisher", onTimeCount, 1);
  updateProgress("beatTheClock", onTimeCount, 1);
  updateProgress("deadlineCrusher", earlyTasks, 5);
  updateProgress("focused", streak, 3);
  updateProgress("consistent", streak, 7);
  updateProgress("weekStreak", streak, 7);
  updateProgress("monthStreak", streak, 30);
  updateProgress("dailyCompleter", completedCount, quests.length);
  updateProgress("taskMaster", completedCount, 10);
  updateProgress("organizer", categories.length, 5);
  updateProgress("earlyStarter", earlyCount, 1);
  updateProgress("legendaryScheduler", (JSON.parse(localStorage.getItem("unlockedBadges")) || []).length, 9);
  updateProgress("midLevelFinisher", completedCount, 15);
  updateProgress("speedRunner", earlyTasks, 5);
  updateProgress("categoryChampion", categories.length, 5);
  updateProgress("earlyBird", earlyCount, 1);
  updateProgress("questMaster", completedCount, 50);
  updateProgress("timeWizard", earlyTasks, 20);
  updateProgress("legendaryOrganizer", categories.length, 10);
  updateProgress("ultimateScheduler", (JSON.parse(localStorage.getItem("unlockedBadges")) || []).length, 20);
}

  // ======== Notifications ========
  function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    if (!notification) return;
    notification.style.transition = "none";
    notification.style.opacity = 1;
    notification.style.display = "block";
    notification.className = `notification ${type}`;
    notification.textContent = message;
    void notification.offsetWidth;
    setTimeout(() => {
      notification.style.transition = "opacity 0.5s ease";
      notification.style.opacity = 0;
      notification.addEventListener("transitionend", () => {
        notification.style.display = "none";
      }, { once: true });
    }, 2000);
  }

  const messages = [
    "🎉 Amazing! You crushed that quest!",
    "💪 Keep going, hero! Another quest down!",
    "🏆 Victory! You completed a challenge!",
    "🔥 Awesome! You're leveling up in life!",
    "✨ Fantastic! That quest didn't stand a chance!",
    "🚀 Great job! Onward to the next adventure!",
    "🎯 Target achieved! You're unstoppable!"
  ];

  const stickerMap = {
  "Sticker 1": "sticker1.jpg",
  "Sticker 2": "sticker2.jpg",
  "Sticker 3": "sticker3.jpg",
  "Sticker 4": "sticker4.jpg",
  "Sticker 5": "sticker5.jpg",
};

function showMotivation(message, rewardText = "") {
  const popup = document.getElementById("motivationPopup");
  const msg = document.getElementById("motivationMessage");
  const rewardMsg = document.getElementById("rewardMessage");
  const closeBtn = document.getElementById("closeMotivation");

  msg.textContent = message;
  rewardMsg.textContent = rewardText;

  const equippedItem = localStorage.getItem("equippedItem");
  const stickerFile = stickerMap[equippedItem];

  closeBtn.innerHTML = "OK";

  if (stickerFile) {
    const img = document.createElement("img");
    img.src = `${stickerFile}`;
    img.alt = equippedItem;
    img.style.width = "30px";
    img.style.height = "30px";
    img.style.marginRight = "8px";
    img.style.verticalAlign = "middle";

    closeBtn.innerHTML = "";
    closeBtn.appendChild(img);
    closeBtn.appendChild(document.createTextNode("OK"));
  }

  popup.classList.add("show");
  launchConfetti();

  closeBtn.onclick = () => {
    popup.classList.remove("show");
  };
}


  function launchConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const confettiCount = 100;
    const confetti = [];
    for (let i = 0; i < confettiCount; i++) confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random() * 360},100%,50%)`,
      tilt: Math.random() * 10 - 10
    });
    let angle = 0;
    let animationFrameId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach(c => {
        ctx.beginPath();
        ctx.lineWidth = c.r / 2;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
        ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);
        ctx.stroke();
      });
      angle += 0.01;
      confetti.forEach(c => {
        c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
        c.x += Math.sin(angle);
        if (c.y > canvas.height) { c.y = -10; c.x = Math.random() * canvas.width; }
      });
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => { cancelAnimationFrame(animationFrameId); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 3000);
    document.getElementById("closeMotivation").onclick = () => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById("motivationPopup").classList.remove("show");
    };
  }


  function saveQuests() {
    const quests = [];
    questTableBody.querySelectorAll("tr").forEach((row) => {
      quests.push({
        label: row.cells[0].textContent,
        dueDate: row.cells[1].textContent,
        category: row.cells[2].textContent,
        difficulty: row.cells[3].textContent,
        notes: row.cells[4].textContent
      });
    });
    localStorage.setItem("quests", JSON.stringify(quests));
  }

  function saveCompletedQuests() {
    const completed = [];
    completedList.querySelectorAll("li").forEach(li => {
      completed.push({
        label: li.dataset.label,
        category: li.dataset.category,
        difficulty: li.dataset.difficulty,
        dueDate: li.dataset.due,
        notes: li.dataset.notes,
        completionDate: li.dataset.completed
      });
    });
    localStorage.setItem("completedQuests", JSON.stringify(completed));
  }

  function loadQuests() {
    const quests = JSON.parse(localStorage.getItem("quests") || "[]");
    quests.forEach(q => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${q.label}</td>
        <td>${q.dueDate}</td>
        <td>${q.category}</td>
        <td>${q.difficulty}</td>
        <td>${q.notes || "-"}</td>
        <td>
          <button class="complete-btn">✔️</button>
          <button class="delete-btn">🗑️</button>
        </td>`;
      questTableBody.appendChild(row);
    });
    const completed = JSON.parse(localStorage.getItem("completedQuests") || "[]");
    completed.forEach(q => {
      const li = document.createElement("li");
      li.dataset.label = q.label;
      li.dataset.category = q.category;
      li.dataset.difficulty = q.difficulty;
      li.dataset.due = q.dueDate;
      li.dataset.notes = q.notes;
      li.dataset.completed = q.completionDate;
      li.innerHTML = `
        <strong>${q.label}</strong> - ${q.category} (${q.difficulty}) | Due: ${q.dueDate} <br>
        Notes: ${q.notes} <br>
        <span style="font-size:12px;color:#3d2e91;opacity:0.8;">Completed on: ${q.completionDate}</span>`;
      completedList.appendChild(li);
    });
  }
  loadQuests();

// ======== Add Quest ========
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const label = document.getElementById("questLabel").value;
  const dueDate = document.getElementById("dueDate").value;
  const category = document.getElementById("category").value;
  const notes = document.getElementById("notes").value;
  const difficulty = document.getElementById("difficulty").value;

  if (!label || !dueDate || !category || !difficulty) {
    showNotification("Please fill out all required fields!", "error");
    return;
  }

  // Add sa table
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${label}</td>
    <td>${dueDate}</td>
    <td>${category}</td>
    <td>${difficulty}</td>
    <td>${notes || "-"}</td>
    <td>
      <button class="complete-btn">✔️</button>
      <button class="delete-btn">🗑️</button>
    </td>`;
  questTableBody.appendChild(row);

  // Save sa main quests
  saveQuests();

  window.dispatchEvent(new StorageEvent("storage", { key: "quests" }));

  taskForm.reset();
  showNotification("Quest Added Successfully!", "success");
});



  // ======== Complete / Delete ========
  questTableBody.addEventListener("click", function (e) {
    const row = e.target.closest("tr");
    if (!row) return;

    if (e.target.classList.contains("complete-btn")) {
      const completionDate = new Date();
      const li = document.createElement("li");
      li.dataset.label = row.cells[0].textContent;
      li.dataset.due = row.cells[1].textContent;
      li.dataset.category = row.cells[2].textContent;
      li.dataset.difficulty = row.cells[3].textContent;
      li.dataset.notes = row.cells[4].textContent;
      li.dataset.completed = completionDate.toDateString();
      li.innerHTML = `
        <strong>${row.cells[0].textContent}</strong> - ${row.cells[2].textContent} (${row.cells[3].textContent}) | Due: ${row.cells[1].textContent} <br>
        Notes: ${row.cells[4].textContent} <br>
        <span style="font-size:12px;color:#3d2e91;opacity:0.8;">Completed on: ${completionDate.toDateString()}</span>`;
      completedList.appendChild(li);

      updateStreakAndBadges({
        label: row.cells[0].textContent,
        dueDate: row.cells[1].textContent,
        category: row.cells[2].textContent,
        difficulty: row.cells[3].textContent,
        notes: row.cells[4].textContent
      }, completionDate);

completeQuest({
  label: row.cells[0].textContent,
  category: row.cells[2].textContent
}, row.cells[3].textContent);  // difficulty

row.remove();
saveQuests();
saveCompletedQuests();
    }
  });

  // ======== Search / Filter ========
  const searchInput = document.getElementById("searchQuest");
  searchInput.addEventListener("input", function () {
    const filter = searchInput.value.toLowerCase();
    const rows = questTableBody.querySelectorAll("tr");
    rows.forEach(row => {
      const label = row.cells[0].textContent.toLowerCase();
      const category = row.cells[2].textContent.toLowerCase();
      const difficulty = row.cells[3].textContent.toLowerCase();
      row.style.display = (label.includes(filter) || category.includes(filter) || difficulty.includes(filter)) ? "" : "none";
    });
  });
function completeQuest(quest, difficulty) {
  let expGain = 0;
  let coinGain = 0;

  // EXP at COINS depende sa difficulty
  switch (difficulty) {
    case "Easy": 
      expGain = 15; 
      coinGain = 20; 
      break;
    case "Medium": 
      expGain = 30; 
      coinGain = 30; 
      break;
    case "Hard": 
      expGain = 45; 
      coinGain = 40; 
      break;
    case "Expert": 
      expGain = 60; 
      coinGain = 50; 
      break;
  }

  // ===== EXP & LEVEL =====
  let currentExp = parseInt(localStorage.getItem("exp")) || 0;
  let currentLevel = parseInt(localStorage.getItem("level")) || 1;

  currentExp += expGain;

  function getExpNeeded(level) {
    return 100 + (level - 1) * 75; 
  }

  while (currentExp >= getExpNeeded(currentLevel)) {
    currentExp -= getExpNeeded(currentLevel);
    currentLevel++;
  }

  localStorage.setItem("exp", currentExp);
  localStorage.setItem("level", currentLevel);

  // ===== COINS =====
  let currentCoins = parseInt(localStorage.getItem("coins")) || 0;
  currentCoins += coinGain;
  localStorage.setItem("coins", currentCoins);

  // Update sa UI kung meron
  const coinCountElem = document.getElementById("coinCount");
  if (coinCountElem) coinCountElem.textContent = currentCoins;

  // trigger update events
  window.dispatchEvent(new StorageEvent("storage", { key: "exp" }));
  window.dispatchEvent(new StorageEvent("storage", { key: "level" }));
  window.dispatchEvent(new StorageEvent("storage", { key: "coins" }));
  window.dispatchEvent(new CustomEvent("expLevelChanged"));

  // dito natin ilagay ang motivational popup + rewards
  const rewardText = `You earned +${expGain} EXP and +${coinGain} Coins!`;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  showMotivation(randomMessage, rewardText);
}


});