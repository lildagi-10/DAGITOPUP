const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

/* =========================
   DATA
========================= */

const products = {
  diamonds: [
    {
      id: "diamond-100",
      name: "100 + 20 Diamonds",
      description: "120 Diamonds",
      price: 190,
      icon: "💎"
    },
    {
      id: "diamond-310",
      name: "310 + 21 Diamonds",
      description: "331 Diamonds",
      price: 380,
      icon: "💎"
    },
    {
      id: "diamond-520",
      name: "520 Diamonds",
      description: "520 Diamonds",
      price: 1080,
      icon: "💎"
    },
    {
      id: "diamond-1060",
      name: "1,060 Diamonds",
      description: "1,060 Diamonds",
      price: 3080,
      icon: "💎"
    },
    {
      id: "diamond-2180",
      name: "2,180 Diamonds",
      description: "2,180 Diamonds",
      price: 5000,
      icon: "💎"
    },
    {
      id: "diamond-5600",
      name: "5,600 Diamonds",
      description: "5,600 Diamonds",
      price: 12000,
      icon: "💎"
    }
  ],

  membership: [
    {
      id: "membership-weekly",
      name: "Weekly Membership",
      description: "7-day membership",
      price: 450,
      icon: "🎫"
    },
    {
      id: "membership-monthly",
      name: "Monthly Membership",
      description: "30-day membership",
      price: 1000,
      icon: "🎫"
    }
  ],

  levelup: [
    {
      id: "level-6",
      name: "Level 6",
      description: "120 Diamonds",
      price: 170,
      icon: "⚡"
    },
    {
      id: "level-10",
      name: "Level 10",
      description: "200 Diamonds",
      price: 240,
      icon: "⚡"
    },
    {
      id: "level-15",
      name: "Level 15",
      description: "200 Diamonds",
      price: 240,
      icon: "⚡"
    },
    {
      id: "level-20",
      name: "Level 20",
      description: "200 Diamonds",
      price: 240,
      icon: "⚡"
    },
    {
      id: "level-25",
      name: "Level 25",
      description: "200 Diamonds",
      price: 240,
      icon: "⚡"
    },
    {
      id: "level-30",
      name: "Level 30",
      description: "350 Diamonds",
      price: 300,
      icon: "⚡"
    }
  ],

  booyah: [
    {
      id: "booyah-pass",
      name: "Booyah Pass",
      description: "Free Fire Booyah Pass",
      price: 600,
      icon: "🎟️"
    }
  ]
};

/* =========================
   STATE
========================= */

let selectedService = null;
let selectedProduct = null;

/* =========================
   SCREEN HELPERS
========================= */

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const screen = document.getElementById(screenId);

  if (screen) {
    screen.classList.add("active");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

function formatPrice(price) {
  return `${Number(price).toLocaleString()} ETB`;
}

/* =========================
   TELEGRAM USER
========================= */

function getTelegramUser() {
  const user = tg?.initDataUnsafe?.user;

  if (!user) {
    return {
      id: "web-user",
      first_name: "Web",
      last_name: "",
      username: ""
    };
  }

  return user;
}

function getTelegramId() {
  return String(getTelegramUser().id);
}

/* =========================
   START BUTTON
========================= */

document.getElementById("startBtn")?.addEventListener("click", () => {
  showScreen("serviceScreen");
});

/* =========================
   HOME BACK
========================= */

document.getElementById("backHome")?.addEventListener("click", () => {
  showScreen("welcomeScreen");
});

/* =========================
   SERVICE SELECTION
========================= */

document.querySelectorAll(".service-card").forEach(card => {

  card.addEventListener("click", () => {

    const service = card.dataset.service;

    selectedService = service;
    selectedProduct = null;

    renderPackages(service);

    showScreen("packageScreen");
  });

});

/* =========================
   PACKAGE SCREEN
========================= */

function renderPackages(service) {

  const list = document.getElementById("packageList");

  const title = document.getElementById("packageTitle");
  const subtitle = document.getElementById("packageSubtitle");
  const badge = document.getElementById("packageBadge");

  if (!list) return;

  list.innerHTML = "";

  const serviceProducts = products[service] || [];

  const serviceNames = {
    diamonds: "FF Diamonds",
    membership: "Membership",
    levelup: "Level Up",
    booyah: "Booyah Pass"
  };

  const serviceIcons = {
    diamonds: "💎",
    membership: "🎫",
    levelup: "⚡",
    booyah: "🎟️"
  };

  title.innerHTML = `Choose Your<br><span>Package</span>`;

  subtitle.textContent =
    `Select your ${serviceNames[service] || "package"}.`;

  badge.textContent =
    `${serviceIcons[service] || "🎮"} STEP 3`;

  serviceProducts.forEach(product => {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "package-card";

    button.innerHTML = `
      <div class="package-icon">
        ${product.icon}
      </div>

      <div class="package-info">
        <div class="package-name">
          ${escapeHtml(product.name)}
        </div>

        <div class="package-description">
          ${escapeHtml(product.description)}
        </div>
      </div>

      <div class="package-price">
        ${formatPrice(product.price)}
      </div>
    `;

    button.addEventListener("click", () => {

      selectedProduct = product;

      updateUIDScreen();

      showScreen("uidScreen");

    });

    list.appendChild(button);
  });
}

/* =========================
   BACK TO SERVICES
========================= */

document.getElementById("backService")?.addEventListener("click", () => {

  selectedProduct = null;

  showScreen("serviceScreen");

});

/* =========================
   UID SCREEN
========================= */

function updateUIDScreen() {

  const summary = document.getElementById("selectedSummary");

  if (!summary || !selectedProduct) return;

  summary.innerHTML = `
    <div class="summary-row">
      <span>Service</span>
      <strong>${escapeHtml(getServiceName())}</strong>
    </div>

    <div class="summary-row">
      <span>Package</span>
      <strong>${escapeHtml(selectedProduct.name)}</strong>
    </div>

    <div class="summary-row summary-total">
      <span>Total</span>
      <strong>${formatPrice(selectedProduct.price)}</strong>
    </div>
  `;
}

/* =========================
   BACK TO PACKAGE
========================= */

document.getElementById("backPackage")?.addEventListener("click", () => {

  showScreen("packageScreen");

});

/* =========================
   CONTINUE TO PAYMENT
========================= */

document.getElementById("continuePayment")?.addEventListener("click", () => {

  if (!selectedProduct) {
    showError("Please select a package first.");
    return;
  }

  const uidInput = document.getElementById("uid");
  const nicknameInput = document.getElementById("nickname");

  const uid = uidInput?.value.trim();
  const nickname = nicknameInput?.value.trim();

  if (!uid) {
    showError("Please enter your Free Fire UID.");
    uidInput?.focus();
    return;
  }

  if (!/^[0-9]+$/.test(uid)) {
    showError("Free Fire UID should contain numbers only.");
    uidInput?.focus();
    return;
  }

  if (uid.length < 5) {
    showError("Please enter a valid Free Fire UID.");
    uidInput?.focus();
    return;
  }

  updatePaymentScreen(uid, nickname);

  showScreen("paymentScreen");

});

/* =========================
   PAYMENT SCREEN
========================= */

function updatePaymentScreen(uid, nickname) {

  const summary = document.getElementById("paymentSummary");

  if (!summary || !selectedProduct) return;

  summary.innerHTML = `
    <div class="summary-row">
      <span>Service</span>
      <strong>${escapeHtml(getServiceName())}</strong>
    </div>

    <div class="summary-row">
      <span>Package</span>
      <strong>${escapeHtml(selectedProduct.name)}</strong>
    </div>

    <div class="summary-row">
      <span>Free Fire UID</span>
      <strong>${escapeHtml(uid)}</strong>
    </div>

    ${
      nickname
        ? `
          <div class="summary-row">
            <span>Account Name</span>
            <strong>${escapeHtml(nickname)}</strong>
          </div>
        `
        : ""
    }

    <div class="summary-row summary-total">
      <span>Total</span>
      <strong>${formatPrice(selectedProduct.price)}</strong>
    </div>
  `;
}

/* =========================
   BACK TO UID
========================= */

document.getElementById("backUid")?.addEventListener("click", () => {

  showScreen("uidScreen");

});

/* =========================
   SUBMIT ORDER
========================= */

document.getElementById("submitOrder")?.addEventListener("click", async () => {

  if (!selectedProduct) {
    showError("Please select a package.");
    return;
  }

  const uid = document.getElementById("uid")?.value.trim();
  const nickname = document.getElementById("nickname")?.value.trim();
  const paymentRef = document.getElementById("paymentRef")?.value.trim();

  if (!uid) {
    showError("Please enter your Free Fire UID.");
    showScreen("uidScreen");
    return;
  }

  if (!paymentRef) {
    showError("Please enter your Telebirr transaction/reference number.");
    document.getElementById("paymentRef")?.focus();
    return;
  }

  const submitButton = document.getElementById("submitOrder");

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "SUBMITTING...";
  }

  clearOutput();

  const user = getTelegramUser();

  const orderData = {
    telegramId: getTelegramId(),

    telegramUser: {
      id: user.id,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      username: user.username || ""
    },

    service: selectedService,

    serviceName: getServiceName(),

    productId: selectedProduct.id,

    productName: selectedProduct.name,

    price: selectedProduct.price,

    uid: uid,

    nickname: nickname || "",

    paymentMethod: "Telebirr",

    paymentReference: paymentRef
  };

  try {

    const response = await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to submit your order."
      );
    }

    showSuccess(data);

  } catch (error) {

    console.error(error);

    showError(
      error.message ||
      "Something went wrong. Please try again."
    );

  } finally {

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "SUBMIT ORDER 🚀";
    }

  }

});

/* =========================
   SUCCESS
========================= */

function showSuccess(data) {

  const details = document.getElementById("successDetails");

  const orderId =
    data.orderId ||
    data.id ||
    "Pending";

  if (details) {

    details.innerHTML = `
      <div class="summary-row">
        <span>Order ID</span>
        <strong>${escapeHtml(orderId)}</strong>
      </div>

      <div class="summary-row">
        <span>Service</span>
        <strong>${escapeHtml(getServiceName())}</strong>
      </div>

      <div class="summary-row">
        <span>Package</span>
        <strong>${escapeHtml(selectedProduct.name)}</strong>
      </div>

      <div class="summary-row">
        <span>UID</span>
        <strong>
          ${escapeHtml(
            document.getElementById("uid")?.value.trim() || ""
          )}
        </strong>
      </div>

      <div class="summary-row summary-total">
        <span>Amount</span>
        <strong>${formatPrice(selectedProduct.price)}</strong>
      </div>
    `;
  }

  showScreen("successScreen");

  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred("success");
  }

  saveLastOrder(orderId);
}

/* =========================
   SUCCESS BUTTONS
========================= */

document.getElementById("viewOrders")?.addEventListener("click", () => {

  showScreen("ordersScreen");

  loadOrders();

});

document.getElementById("newOrder")?.addEventListener("click", () => {

  resetOrder();

  showScreen("serviceScreen");

});

/* =========================
   ORDERS
========================= */

document.getElementById("backSuccess")?.addEventListener("click", () => {

  showScreen("successScreen");

});

async function loadOrders() {

  const container = document.getElementById("myOrders");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-orders">
      Loading your orders...
    </div>
  `;

  try {

    const telegramId = getTelegramId();

    const response = await fetch(
      `/api/orders?telegramId=${encodeURIComponent(telegramId)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to load orders."
      );
    }

    const orders = Array.isArray(data)
      ? data
      : data.orders || [];

    renderOrders(orders);

  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <div class="empty-orders">
        ❌ Unable to load orders right now.
        <br><br>
        Please try again later.
      </div>
    `;
  }
}

function renderOrders(orders) {

  const container = document.getElementById("myOrders");

  if (!container) return;

  if (!orders.length) {

    container.innerHTML = `
      <div class="empty-orders">
        📦 You don't have any orders yet.
        <br><br>
        Your submitted orders will appear here.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  orders.forEach(order => {

    const card = document.createElement("div");

    card.className = "order-card";

    const status =
      String(order.status || "pending").toLowerCase();

    const statusText =
      status.charAt(0).toUpperCase() + status.slice(1);

    card.innerHTML = `
      <div class="order-top">

        <div class="order-id">
          ${escapeHtml(
            order.orderId ||
            order.id ||
            "Order"
          )}
        </div>

        <div class="order-status ${
          status === "completed"
            ? "completed"
            : ""
        }">
          ${escapeHtml(statusText)}
        </div>

      </div>

      <div class="order-info">

        <div>
          <span>Service</span>
          <strong>
            ${escapeHtml(
              order.serviceName ||
              order.service ||
              "-"
            )}
          </strong>
        </div>

        <div>
          <span>Package</span>
          <strong>
            ${escapeHtml(
              order.productName ||
              "-"
            )}
          </strong>
        </div>

        <div>
          <span>UID</span>
          <strong>
            ${escapeHtml(
              order.uid ||
              "-"
            )}
          </strong>
        </div>

        <div>
          <span>Amount</span>
          <strong>
            ${
              order.price
                ? formatPrice(order.price)
                : "-"
            }
          </strong>
        </div>

        <div>
          <span>Payment</span>
          <strong>
            ${escapeHtml(
              order.paymentMethod ||
              "Telebirr"
            )}
          </strong>
        </div>

      </div>
    `;

    container.appendChild(card);

  });
}

/* =========================
   RESET ORDER
========================= */

function resetOrder() {

  selectedService = null;
  selectedProduct = null;

  const fields = [
    "uid",
    "nickname",
    "paymentRef"
  ];

  fields.forEach(id => {

    const input = document.getElementById(id);

    if (input) {
      input.value = "";
    }

  });

  clearOutput();

}

/* =========================
   SERVICE NAME
========================= */

function getServiceName() {

  const names = {
    diamonds: "FF Diamonds",
    membership: "Membership",
    levelup: "Level Up",
    booyah: "Booyah Pass"
  };

  return names[selectedService] || "Free Fire Top Up";
}

/* =========================
   ERROR MESSAGE
========================= */

function showError(message) {

  const output = document.getElementById("orderOutput");

  if (output) {

    output.textContent = `⚠️ ${message}`;

    output.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  } else {

    alert(message);

  }

  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred("error");
  }
}

function clearOutput() {

  const output = document.getElementById("orderOutput");

  if (output) {
    output.textContent = "";
  }

}

/* =========================
   LOCAL LAST ORDER
========================= */

function saveLastOrder(orderId) {

  try {

    localStorage.setItem(
      "dagitopup_last_order",
      String(orderId)
    );

  } catch (error) {

    console.log("Local storage unavailable.");

  }
}

/* =========================
   HTML SECURITY
========================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================
   INITIALIZE
========================= */

showScreen("welcomeScreen");
