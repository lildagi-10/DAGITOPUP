const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

/* =========================
   DAGITOPUP PRODUCTS
========================= */

const diamonds = [
  ["100 + 20 Diamonds", 190],
  ["310 + 21 Diamonds", 380],
  ["520 Diamonds", 1080],
  ["1,060 Diamonds", 3080],
  ["2,180 Diamonds", 5000],
  ["5,600 Diamonds", 12000]
];

const memberships = [
  ["Weekly Membership", 450],
  ["Monthly Membership", 1000]
];

const levelUps = [
  ["Level 6 • 120 Diamonds", 170],
  ["Level 10 • 200 Diamonds", 240],
  ["Level 15 • 200 Diamonds", 240],
  ["Level 20 • 200 Diamonds", 240],
  ["Level 25 • 200 Diamonds", 240],
  ["Level 30 • 350 Diamonds", 300]
];

const booyahPass = [
  ["Booyah Pass", 600]
];

let selected = null;

/* =========================
   PRICE FORMAT
========================= */

function priceText(price) {
  return Number(price).toLocaleString() + " ETB";
}

/* =========================
   CREATE PRODUCT BUTTON
========================= */

function createProductButton(name, price, emoji) {
  const button = document.createElement("button");

  button.className = "item";

  button.innerHTML = `
    ${emoji} ${name}
    <br>
    <b>${priceText(price)}</b>
  `;

  button.onclick = () => selectProduct(name, price);

  return button;
}

/* =========================
   DIAMONDS
========================= */

const diamondGrid = document.getElementById("diamonds");

if (diamondGrid) {
  diamondGrid.innerHTML = "";

  diamonds.forEach(([name, price]) => {
    diamondGrid.appendChild(
      createProductButton(name, price, "💎")
    );
  });
}

/* =========================
   MEMBERSHIP
========================= */

const allItems = document.querySelectorAll(".item");

allItems.forEach(button => {
  const product = button.dataset.p;

  if (product === "Weekly Membership") {
    button.innerHTML = `
      🗓️ Weekly Membership
      <br>
      <b>450 ETB</b>
    `;
    button.onclick = () =>
      selectProduct("Weekly Membership", 450);
  }

  if (product === "Monthly Membership") {
    button.innerHTML = `
      🗓️ Monthly Membership
      <br>
      <b>1,000 ETB</b>
    `;
    button.onclick = () =>
      selectProduct("Monthly Membership", 1000);
  }
});

/* =========================
   LEVEL UP
========================= */

const headings = document.querySelectorAll("h2");

headings.forEach(heading => {

  if (heading.textContent.includes("Level Up")) {

    const grid = heading.nextElementSibling;

    if (grid) {
      grid.innerHTML = "";

      levelUps.forEach(([name, price]) => {
        grid.appendChild(
          createProductButton(name, price, "📈")
        );
      });
    }
  }

  if (heading.textContent.includes("Booyah Pass")) {

    const grid = heading.nextElementSibling;

    if (grid) {
      grid.innerHTML = "";

      booyahPass.forEach(([name, price]) => {
        grid.appendChild(
          createProductButton(name, price, "🎟️")
        );
      });
    }
  }
});

/* =========================
   SELECT PRODUCT
========================= */

function selectProduct(product, price) {

  selected = {
    product: product,
    price: price
  };

  const order = document.getElementById("order");
  const chosen = document.getElementById("chosen");

  if (chosen) {
    chosen.innerHTML = `
      <strong>Selected:</strong> ${product}
      <br>
      <strong>Price:</strong> ${priceText(price)}
    `;
  }

  if (order) {
    order.classList.remove("hidden");

    order.scrollIntoView({
      behavior: "smooth"
    });
  }
}

/* =========================
   OPEN TELEGRAM
========================= */

const telegramButton = document.getElementById("tg");

if (telegramButton) {

  telegramButton.onclick = () => {

    const url = "https://t.me/DAGITOPUP_BOT";

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url);
    } else {
      window.location.href = url;
    }

  };
}

/* =========================
   SUBMIT ORDER
========================= */

const sendButton = document.getElementById("send");

if (sendButton) {

  sendButton.onclick = async () => {

    const uid =
      document.getElementById("uid").value.trim();

    const ref =
      document.getElementById("ref").value.trim();

    const output =
      document.getElementById("out");

    if (
      !selected ||
      !/^\d{5,20}$/.test(uid) ||
      ref.length < 3
    ) {

      output.textContent =
        "❌ Enter a valid Free Fire UID and payment reference.";

      return;
    }

    output.textContent = "⏳ Sending order...";

    const user =
      tg?.initDataUnsafe?.user || {};

    try {

      const response = await fetch(
        "/api/order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            telegramId:
              user.id || "unknown",

            username:
              user.username ||
              user.first_name ||
              "unknown",

            product:
              selected.product,

            price:
              selected.price,

            uid:
              uid,

            paymentRef:
              ref
          })
        }
      );

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.message);
      }

      output.textContent =
        "✅ Order #" +
        data.orderId +
        " received! Payment will be confirmed manually.";

    } catch (error) {

      output.textContent =
        "❌ Could not submit the order. Please try again.";

    }

  };
}
