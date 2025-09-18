// Modal
const modal = document.getElementById("feedbackModal");
const btn = document.getElementById("feedbackBtn");
const span = document.getElementsByClassName("close")[0];
const feedbackForm = document.getElementById("feedbackForm"); // Formspree form

// Gamified confirmation popup
const feedbackConfirm = document.getElementById("feedbackConfirm");
const confirmClose = document.getElementById("confirmClose");

// Open modal
btn.onclick = function () {
  modal.classList.add("show");
  modal.classList.remove("hide"); // para sure na walang conflict
};

// Close function with smooth exit
function closeModal() {
  modal.classList.add("hide");    // add exit animation
  modal.classList.remove("show"); // remove show class
  setTimeout(() => {
    modal.classList.remove("hide"); // reset after animation
  }, 300); // same duration as CSS transition
}

// Close when clicking the X
span.onclick = function () {
  closeModal();
};

// Close when clicking outside modal
window.onclick = function (event) {
  if (event.target === modal) {
    closeModal();
  }
};

// ==========================
// Formspree Submission with Gamified Popup
// ==========================
feedbackForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop page reload

  const formData = new FormData(feedbackForm);

  fetch(feedbackForm.action, {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      feedbackForm.reset();
      closeModal(); // close feedback modal

      // Show gamified confirmation popup
      feedbackConfirm.classList.add("show");
    } else {
      alert("Oops! Something went wrong. Please try again.");
    }
  })
  .catch(() => {
    alert("Oops! Something went wrong. Please try again.");
  });
});

// Close confirmation popup
confirmClose.addEventListener("click", () => {
  feedbackConfirm.classList.remove("show");
});

// Also close if clicking outside confirmation content
feedbackConfirm.addEventListener("click", (e) => {
  if (e.target === feedbackConfirm) {
    feedbackConfirm.classList.remove("show");
  }
});
