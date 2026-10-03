/* =========================================================
   DAGITOPUP - MINI APP SCRIPT
========================================================= */

const tg = window.Telegram?.WebApp;

/* =========================================================
   TELEGRAM INITIALIZATION
========================================================= */

if (tg) {
  tg.ready();
  tg.expand();
}

/* =========================================================
   PRODUCTS
========================================================= */

const PRODUCTS = {
  diamonds: [
    {
      id: "diamond_100",
      name: "100 + 20 Diamonds",
      price: 190
    },
    {
      id: "diamond_310",
      name: "310 + 21 Diamonds",
      price: 380
    },
    {
      id: "diamond_520",
      name: "520 Diamonds",
      price: 1080
    },
    {
      id: "diamond_1060",
      name: "1,060 Diamonds",
      price: 3080
    },
    {
      id: "diamond_2180",
      name: "2,180 Diamonds",
      price: 5000
    },
    {
      id: "diamond_5600",
      name: "5,600 Diamonds",
      price: 12000
    }
  ],

  membership: [
    {
      id: "membership_weekly",
      name: "Weekly Membership",
      price: 450
    },
    {
      id: "membership_monthly",
      name: "Monthly Membership",
      price: 1000
    }
  ],

  levelup: [
    {
      id: "level_6",
      name: "Level 6 — 120 Diamonds",
      price: 170
    },
    {
      id: "level_10",
      name: "Level 10 — 200 Diamonds",
      price: 240
    },
    {
      id: "level_15",
      name: "Level 15 — 200 Diamonds",
      price: 240
    },
    {
      id: "level_20",
      name: "Level 20 — 200 Diamonds",
      price: 240
    },
    {
      id: "level_25",
      name: "Level 25 — 200 Diamonds",
      price: 240
    },
    {
      id: "level_30",
      name: "Level 30 — 350 Diamonds",
      price: 300
    }
  ],

  booyah: [
    {
      id: "booyah_pass",
      name: "Booyah Pass",
      price: 600
    }
  ]
};

/* =========================================================
   SERVICE NAMES
========================================================= */

const SERVICE_NAMES = {
  diamonds: "💎 Free Fire Diamonds",
  membership: "🎫 Membership",
  levelup: "📈 Level Up",
  booyah: "🎟️ Booyah Pass"
};

/* =========================================================
   ORDER STATE
========================================================= */

let selectedService = null;
let selectedProduct = null;

/* =========================================================
   HELPER
========================================================= */

const $ = id => document.getElementById(id);

/* =========================================================
   SHOW SCREEN
========================================================= */

function showScreen(screenId) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.remove("active");
    });

  const screen = $(screenId);

  if (screen) {
    screen.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   START
========================================================= */

$("startBtn")?.addEventListener("click", () => {

  showScreen("serviceScreen");

});

/* =========================================================
   BACK HOME
========================================================= */

$("backHome")?.addEventListener("click", () => {

  resetOrder();

  showScreen("welcomeScreen");

});

/* =========================================================
   SERVICE SELECTION
========================================================= */

document
  .querySelectorAll(".service-card")
  .forEach(card => {

    card.addEventListener("click", () => {

      const service =
        card.dataset.service;

      if (!PRODUCTS[service]) {

        showError(
          "Invalid service selected."
        );

        return;
      }

      selectedService = service;
      selectedProduct = null;

      renderPackages();

      showScreen("packageScreen");

    });

  });

/* =========================================================
   RENDER PACKAGES
========================================================= */

function renderPackages() {

  const packageList = $("packageList");
  const packageTitle = $("packageTitle");
  const packageSubtitle = $("packageSubtitle");
  const packageBadge = $("packageBadge");

  if (!packageList || !selectedService) {
    return;
  }

  const products =
    PRODUCTS[selectedService];

  packageList.innerHTML = "";

  if (packageTitle) {

    packageTitle.textContent =
      SERVICE_NAMES[selectedService];

  }

  if (packageBadge) {

    packageBadge.textContent =
      selectedService.toUpperCase();

  }

  if (packageSubtitle) {

    packageSubtitle.textContent =
      "Choose your package";

  }

  products.forEach(product => {

    const card =
      document.createElement("button");

    card.type = "button";

    card.className =
      "package-card";

    card.innerHTML = `
      <div class="package-card-info">

        <strong>
          ${escapeHtml(product.name)}
        </strong>

        <span>
          🇪🇹 Ethiopian Birr
        </span>

      </div>

      <div class="package-price">
        ${formatPrice(product.price)} ETB
      </div>
    `;

    card.addEventListener("click", () => {

      selectedProduct = product;

      updateUIDScreen();

      showScreen("uidScreen");

    });

    packageList.appendChild(card);

  });

}

/* =========================================================
   BACK TO SERVICES
========================================================= */

$("backService")?.addEventListener("click", () => {

  selectedProduct = null;

  showScreen("serviceScreen");

});

/* =========================================================
   UID SCREEN
========================================================= */

function updateUIDScreen() {

  const selectedSummary =
    $("selectedSummary");

  if (!selectedSummary ||
      !selectedProduct) {

    return;
  }

  selectedSummary.innerHTML = `

    <div class="summary-row">
      <span>Service</span>

      <strong>
        ${escapeHtml(
          SERVICE_NAMES[selectedService]
        )}
      </strong>
    </div>

    <div class="summary-row">
      <span>Package</span>

      <strong>
        ${escapeHtml(
          selectedProduct.name
        )}
      </strong>
    </div>

    <div class="summary-row">
      <span>Price</span>

      <strong>
        ${formatPrice(
          selectedProduct.price
        )} ETB
      </strong>
    </div>

  `;

  /*
    Prevent customer from entering
    their own nickname.
  */

  const nicknameInput =
    $("nickname");

  if (nicknameInput) {

    nicknameInput.value = "";

    nicknameInput.readOnly = true;

    nicknameInput.placeholder =
      "Account name verified manually";

    nicknameInput.style.display =
      "none";
  }

}

/* =========================================================
   BACK TO PACKAGE
========================================================= */

$("backPackage")?.addEventListener(
  "click",
  () => {

    showScreen("packageScreen");

  }
);

/* =========================================================
   UID INPUT
========================================================= */

$("uid")?.addEventListener(
  "input",
  event => {

    event.target.value =
      event.target.value.replace(
        /\D/g,
        ""
      );

  }
);

/* =========================================================
   CONTINUE TO PAYMENT
========================================================= */

$("continuePayment")?.addEventListener(
  "click",
  () => {

    if (!selectedProduct) {

      showError(
        "Please select a package first."
      );

      return;
    }

    const uid =
      String(
        $("uid")?.value || ""
      ).trim();

    if (!/^\d{5,14}$/.test(uid)) {

      showError(
        "Please enter a valid Free Fire UID."
      );

      $("uid")?.focus();

      return;
    }

    /*
      No API lookup.
      Go directly to payment.
    */

    updatePaymentScreen(uid);

    showScreen("paymentScreen");

  }
);

/* =========================================================
   PAYMENT SCREEN
========================================================= */

function updatePaymentScreen(uid) {

  const paymentSummary =
    $("paymentSummary");

  if (!paymentSummary ||
      !selectedProduct) {

    return;
  }

  paymentSummary.innerHTML = `

    <div class="summary-row">
      <span>Service</span>

      <strong>
        ${escapeHtml(
          SERVICE_NAMES[selectedService]
        )}
      </strong>
    </div>

    <div class="summary-row">
      <span>Package</span>

      <strong>
        ${escapeHtml(
          selectedProduct.name
        )}
      </strong>
    </div>

    <div class="summary-row">
      <span>Price</span>

      <strong>
        ${formatPrice(
          selectedProduct.price
        )} ETB
      </strong>
    </div>

    <div class="summary-row">
      <span>Free Fire UID</span>

      <strong>
        ${escapeHtml(uid)}
      </strong>
    </div>

    <div class="summary-row">
      <span>Account Name</span>

      <strong>
        Not verified
      </strong>
    </div>

    <div class="payment-note">

      ⚠️ Your Free Fire UID will be
      manually verified by DAGITOPUP
      before fulfillment.

    </div>

    <div class="payment-details">

      <div>
        <span>📱 Payment</span>
        <strong>Telebirr</strong>
      </div>

      <div>
        <span>👤 Account Name</span>
        <strong>Abebaw Adamu</strong>
      </div>

      <div>
        <span>☎️ Telebirr Number</span>
        <strong>0978454451</strong>
      </div>

    </div>

  `;

}

/* =========================================================
   BACK TO UID
========================================================= */

$("backUid")?.addEventListener(
  "click",
  () => {

    showScreen("uidScreen");

  }
);

/* =========================================================
   PAYMENT REFERENCE
========================================================= */

$("paymentRef")?.addEventListener(
  "input",
  event => {

    event.target.value =
      event.target.value.trimStart();

  }
);

/* =========================================================
   SUBMIT ORDER
========================================================= */

$("submitOrder")?.addEventListener(
  "click",
  async () => {

    if (!selectedService ||
        !selectedProduct) {

      showError(
        "Please select a package."
      );

      return;
    }

    const uid =
      String(
        $("uid")?.value || ""
      ).trim();

    const paymentRef =
      String(
        $("paymentRef")?.value || ""
      ).trim();

    if (!/^\d{5,14}$/.test(uid)) {

      showError(
        "Please enter a valid Free Fire UID."
      );

      showScreen("uidScreen");

      return;
    }

    if (!paymentRef) {

      showError(
        "Please enter your Telebirr transaction/reference number."
      );

      $("paymentRef")?.focus();

      return;
    }

    const submitButton =
      $("submitOrder");

    if (submitButton) {

      submitButton.disabled = true;

      submitButton.dataset.originalText =
        submitButton.textContent;

      submitButton.textContent =
        "Submitting Order...";

    }

    try {

      const telegramUser =
        tg?.initDataUnsafe?.user ||
        null;

      const telegramId =
        telegramUser?.id ||
        "web_user";

      const username =
        telegramUser?.username ||
        "";

      const orderData = {

        telegramId:
          String(telegramId),

        username:
          String(username),

        service:
          selectedService,

        productId:
          selectedProduct.id,

        productName:
          selectedProduct.name,

        price:
          selectedProduct.price,

        uid:
          uid,

        nickname:
          "",

        paymentRef:
          paymentRef

      };

      const response =
        await fetch(
          "/api/order",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                orderData
              )

          }
        );

      const data =
        await response.json();

      if (!response.ok ||
          !data.success) {

        throw new Error(
          data.error ||
          "Could not submit order."
        );

      }

      showSuccess(
        data.order || data
      );

      showScreen(
        "successScreen"
      );

    } catch (error) {

      console.error(
        "Order submission error:",
        error
      );

      showError(
        error.message ||
        "Something went wrong."
      );

    } finally {

      if (submitButton) {

        submitButton.disabled =
          false;

        submitButton.textContent =
          submitButton.dataset.originalText ||
          "Submit Order";

      }

    }

  }
);

/* =========================================================
   SUCCESS SCREEN
========================================================= */

function showSuccess(order) {

  const successDetails =
    $("successDetails");

  if (!successDetails) {
    return;
  }

  successDetails.innerHTML = `

    <div class="success-order">

      <div class="summary-row">
        <span>🧾 Order ID</span>

        <strong>
          ${escapeHtml(
            order.id ||
            "Pending"
          )}
        </strong>
      </div>

      <div class="summary-row">
        <span>📦 Package</span>

        <strong>
          ${escapeHtml(
            order.product ||
            order.productName ||
            selectedProduct?.name ||
            ""
          )}
        </strong>
      </div>

      <div class="summary-row">
        <span>💰 Amount</span>

        <strong>
          ${formatPrice(
            order.price ||
            selectedProduct?.price ||
            0
          )} ETB
        </strong>
      </div>

      <div class="summary-row">
        <span>🎯 Free Fire UID</span>

        <strong>
          ${escapeHtml(
            order.uid ||
            $("uid")?.value ||
            ""
          )}
        </strong>
      </div>

      <div class="summary-row">
        <span>🧑 Account Name</span>

        <strong>
          Not verified
        </strong>
      </div>

      <div class="summary-row">
        <span>📌 Status</span>

        <strong>
          ${escapeHtml(
            order.status ||
            "pending"
          )}
        </strong>
      </div>

      <div class="success-note">

        ✅ Your order has been received.

        <br><br>

        DAGITOPUP will verify your UID
        and payment before manually
        fulfilling the order.

      </div>

    </div>

  `;

}

/* =========================================================
   MY ORDERS - SUCCESS PAGE BUTTON
========================================================= */

$("viewOrders")?.addEventListener(
  "click",
  async () => {

    showScreen("ordersScreen");

    await loadOrders();

  }
);

/* =========================================================
   MY ORDERS - MAIN MENU BUTTON
========================================================= */

$("myOrders")?.addEventListener(
  "click",
  async () => {

    showScreen("ordersScreen");

    await loadOrders();

  }
);

/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders() {

  const ordersScreen =
    $("ordersScreen");

  if (!ordersScreen) {

    console.error(
      "Orders screen not found."
    );

    return;
  }

  /*
    Find existing output container.
  */

  let orderOutput =
    $("orderOutput");

  /*
    If index.html doesn't contain
    orderOutput, create it.
  */

  if (!orderOutput) {

    orderOutput =
      document.createElement("div");

    orderOutput.id =
      "orderOutput";

    orderOutput.style.width =
      "100%";

    orderOutput.style.marginTop =
      "20px";

    ordersScreen.appendChild(
      orderOutput
    );

  }

  const telegramUser =
    tg?.initDataUnsafe?.user ||
    null;

  const telegramId =
    telegramUser?.id ||
    "web_user";

  orderOutput.innerHTML = `

    <div class="loading">

      🔄 Loading your orders...

    </div>

  `;

  try {

    const response =
      await fetch(
        `/api/orders?telegramId=${encodeURIComponent(
          telegramId
        )}`
      );

    const data =
      await response.json();

    if (!response.ok ||
        !data.success) {

      throw new Error(
        data.error ||
        "Could not load orders."
      );

    }

    const orders =
      Array.isArray(data.orders)
        ? data.orders
        : [];

    /*
      No orders
    */

    if (orders.length === 0) {

      orderOutput.innerHTML = `

        <div class="empty-orders">

          <div
            style="
              font-size:48px;
              margin-bottom:10px;
            "
          >
            📦
          </div>

          <h3>
            No orders yet
          </h3>

          <p>
            Your DAGITOPUP orders
            will appear here.
          </p>

        </div>

      `;

      return;
    }

    /*
      Display orders
    */

    orderOutput.innerHTML =
      orders.map(order => {

        const status =
          String(
            order.status ||
            "pending"
          ).toUpperCase();

        return `

          <div class="order-card">

            <div class="order-header">

              <strong>
                🧾
                ${escapeHtml(
                  order.id
                )}
              </strong>

              <span
                class="order-status"
              >
                ${escapeHtml(
                  status
                )}
              </span>

            </div>

            <div class="order-info">

              <p>
                📦
                <strong>
                  ${escapeHtml(
                    order.productName ||
                    "Package"
                  )}
                </strong>
              </p>

              <p>
                💰
                ${formatPrice(
                  order.price ||
                  0
                )}
                ETB
              </p>

              <p>
                🎯 Free Fire UID:

                <strong>
                  ${escapeHtml(
                    order.uid ||
                    ""
                  )}
                </strong>
              </p>

              <p>
                🧑 Account Name:

                <strong>
                  Not verified
                </strong>
              </p>

              <p>
                💳 Payment Reference:

                <strong>
                  ${escapeHtml(
                    order.paymentRef ||
                    ""
                  )}
                </strong>
              </p>

            </div>

          </div>

        `;

      }).join("");

  } catch (error) {

    console.error(
      "Load orders error:",
      error
    );

    orderOutput.innerHTML = `

      <div class="error-box">

        ❌
        ${escapeHtml(
          error.message ||
          "Could not load orders."
        )}

      </div>

    `;

  }

}

/* =========================================================
   NEW ORDER
========================================================= */

$("newOrder")?.addEventListener(
  "click",
  () => {

    resetOrder();

    showScreen(
      "serviceScreen"
    );

  }
);

/* =========================================================
   BACK FROM SUCCESS / ORDERS
========================================================= */

$("backSuccess")?.addEventListener(
  "click",
  () => {

    showScreen(
      "welcomeScreen"
    );

  }
);

/* =========================================================
   RESET ORDER
========================================================= */

function resetOrder() {

  selectedService = null;

  selectedProduct = null;

  const uid =
    $("uid");

  if (uid) {
    uid.value = "";
  }

  const nickname =
    $("nickname");

  if (nickname) {

    nickname.value = "";

    nickname.readOnly = true;

    nickname.style.display =
      "none";

  }

  const paymentRef =
    $("paymentRef");

  if (paymentRef) {

    paymentRef.value = "";

  }

  const orderOutput =
    $("orderOutput");

  if (orderOutput) {

    orderOutput.innerHTML = "";

  }

}

/* =========================================================
   ERROR
========================================================= */

function showError(message) {

  const output =
    $("orderOutput");

  if (output) {

    output.innerHTML = `

      <div class="error-box">

        ❌
        ${escapeHtml(message)}

      </div>

    `;

  }

  if (tg?.showAlert) {

    tg.showAlert(message);

    return;
  }

  if (!output) {

    alert(message);

  }

}

/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(price) {

  return Number(
    price || 0
  ).toLocaleString(
    "en-US"
  );

}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    showScreen(
      "welcomeScreen"
    );

    const nickname =
      $("nickname");

    if (nickname) {

      nickname.value = "";

      nickname.readOnly = true;

      nickname.style.display =
        "none";

    }

  }
);
