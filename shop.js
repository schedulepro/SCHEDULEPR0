document.addEventListener("DOMContentLoaded", function () {
  const coinCountEl = document.getElementById("coinCount");

  if (localStorage.getItem("coins") === null) localStorage.setItem("coins", 0);
  let coins = parseInt(localStorage.getItem("coins"));
  coinCountEl.textContent = coins;

  // ✅ Track purchased items
  if (!localStorage.getItem("purchasedItems")) localStorage.setItem("purchasedItems", JSON.stringify({}));
  let purchasedItems = JSON.parse(localStorage.getItem("purchasedItems"));

  // ✅ Track equipped sticker
  let equippedItem = localStorage.getItem("equippedItem") || null;

  const buyButtons = document.querySelectorAll(".buy-btn");

  buyButtons.forEach((btn) => {
    const shopItem = btn.closest(".shop-item");
    const itemName = shopItem.querySelector("h3").textContent;

    // Check if purchased
    if (purchasedItems[itemName]) {
      btn.textContent = (equippedItem === itemName) ? "Equipped ✅" : "Equip";
      btn.disabled = false;
      btn.classList.add("purchased");
    }
  });

  // Modal elements
  const purchaseModal = document.getElementById("purchaseModal");
  const modalItemName = document.getElementById("modalItemName");
  const modalItemDesc = document.getElementById("modalItemDesc");
  const modalItemPrice = document.getElementById("modalItemPrice");
  const modalItemImage = document.getElementById("modalItemImage");
  const confirmPurchase = document.getElementById("confirmPurchase");
  const cancelPurchase = document.getElementById("cancelPurchase");

  let selectedItem = null;
  let selectedPrice = 0;

  buyButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const shopItem = this.closest(".shop-item");
      const itemName = shopItem.querySelector("h3").textContent;

      if (purchasedItems[itemName]) {
        // ✅ Already purchased → equip this sticker
        equippedItem = itemName;
        localStorage.setItem("equippedItem", equippedItem);

        buyButtons.forEach(b => {
          const name = b.closest(".shop-item").querySelector("h3").textContent;
          if (purchasedItems[name]) b.textContent = (equippedItem === name) ? "Equipped ✅" : "Equip";
        });

        showNotification(`You equipped ${itemName}!`, "success");
        return; // no modal for already purchased items
      }

      // For new purchase
      const priceText = shopItem.querySelector(".price").textContent;
      const price = parseInt(priceText.replace(" Coins", ""));

      modalItemName.textContent = itemName;
      modalItemDesc.textContent =
        shopItem.querySelector(".description")?.textContent || "This sticker will enhance your DailyQuest Button.";
      modalItemPrice.textContent = `Price: ${price} Coins`;
      modalItemImage.src = shopItem.querySelector("img").src;
      modalItemImage.alt = itemName;

      selectedItem = { btn: this, shopItem };
      selectedPrice = price;

      purchaseModal.classList.add("show");
    });
  });

  confirmPurchase.addEventListener("click", () => {
    if (coins >= selectedPrice) {
      coins -= selectedPrice;
      coinCountEl.textContent = coins;
      localStorage.setItem("coins", coins);

      const itemName = modalItemName.textContent;
      purchasedItems[itemName] = true;
      localStorage.setItem("purchasedItems", JSON.stringify(purchasedItems));

      // ✅ Set as equipped immediately
      equippedItem = itemName;
      localStorage.setItem("equippedItem", equippedItem);

      buyButtons.forEach(b => {
        const name = b.closest(".shop-item").querySelector("h3").textContent;
        if (purchasedItems[name]) b.textContent = (equippedItem === name) ? "Equipped ✅" : "Equip";
        b.classList.add("purchased");
        b.disabled = false;
      });

      showNotification(`You bought and equipped ${itemName}!`, "success");
    } else {
      showNotification("Not enough coins!", "error");
    }

    purchaseModal.classList.remove("show");
  });

  cancelPurchase.addEventListener("click", () => {
    purchaseModal.classList.remove("show");
  });

  function showNotification(message, type) {
    const notif = document.getElementById("notification");
    notif.textContent = message;
    notif.className = `notification ${type}`;
    notif.style.opacity = "1";
    setTimeout(() => { notif.style.opacity = "0"; }, 2500);
  }
});
