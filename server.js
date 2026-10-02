require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const app = express();

const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing.");
  process.exit(1);
}

/* =========================
   EXPRESS
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

/* =========================
   PRODUCTS
========================= */

const PRODUCTS = {
  diamonds: [
    {
      id: "diamond-100",
      name: "100 + 20 Diamonds",
      price: 190
    },
    {
      id: "diamond-310",
      name: "310 + 21 Diamonds",
      price: 380
    },
    {
      id: "diamond-520",
      name: "520 Diamonds",
      price: 1080
    },
    {
      id: "diamond-1060",
      name: "1,060 Diamonds",
      price: 3080
    },
    {
      id: "diamond-2180",
      name: "2,180 Diamonds",
      price: 5000
    },
    {
      id: "diamond-5600",
      name: "5,600 Diamonds",
      price: 12000
    }
  ],

  membership: [
    {
      id: "membership-weekly",
      name: "Weekly Membership",
      price: 450
    },
    {
      id: "membership-monthly",
      name: "Monthly Membership",
      price: 1000
    }
  ],

  levelup: [
    {
      id: "level-6",
      name: "Level 6",
      price: 170
    },
    {
      id: "level-10",
      name: "Level 10",
      price: 240
    },
    {
      id: "level-15",
      name: "Level 15",
      price: 240
    },
    {
      id: "level-20",
      name: "Level 20",
      price: 240
    },
    {
      id: "level-25",
      name: "Level 25",
      price: 240
    },
    {
      id: "level-30",
      name: "Level 30",
      price: 300
    }
  ],

  booyah: [
    {
      id: "booyah-pass",
      name: "Booyah Pass",
      price: 600
    }
  ]
};

/* =========================
   SERVICE NAMES
========================= */

const SERVICE_NAMES = {
  diamonds: "FF Diamonds",
  membership: "Membership",
  levelup: "Level Up",
  booyah: "Booyah Pass"
};

/* =========================
   ORDER STORAGE
========================= */

const ORDERS_FILE = path.join(__dirname, "orders.json");

function loadOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      return [];
    }

    const content = fs.readFileSync(
      ORDERS_FILE,
      "utf8"
    );

    if (!content.trim()) {
      return [];
    }

    return JSON.parse(content);

  } catch (error) {

    console.error(
      "Could not read orders.json:",
      error
    );

    return [];
  }
}

function saveOrders(orders) {

  try {

    fs.writeFileSync(
      ORDERS_FILE,
      JSON.stringify(orders, null, 2),
      "utf8"
    );

    return true;

  } catch (error) {

    console.error(
      "Could not save orders:",
      error
    );

    return false;
  }
}

/* =========================
   ORDER ID
========================= */

function generateOrderId() {

  const now = Date.now()
    .toString()
    .slice(-8);

  const random = Math.floor(
    100 + Math.random() * 900
  );

  return `DAGI-${now}-${random}`;
}

/* =========================
   PRODUCT FINDER
========================= */

function findProduct(service, productId) {

  const serviceProducts =
    PRODUCTS[service];

  if (!serviceProducts) {
    return null;
  }

  return serviceProducts.find(
    product => product.id === productId
  ) || null;
}

/* =========================
   API: PRODUCTS
========================= */

app.get("/api/products", (req, res) => {

  res.json(PRODUCTS);

});

/* =========================
   API: HEALTH
========================= */

app.get("/health", (req, res) => {

  res.json({
    status: "ok",
    bot: "DAGITOPUP",
    time: new Date().toISOString()
  });

});

/* =========================
   API: CREATE ORDER
========================= */

app.post("/api/order", async (req, res) => {

  try {

    const {
      telegramId,
      telegramUser,
      service,
      serviceName,
      productId,
      productName,
      price,
      uid,
      nickname,
      paymentMethod,
      paymentReference
    } = req.body;

    /* ---------- BASIC VALIDATION ---------- */

    if (!telegramId) {
      return res.status(400).json({
        error: "Telegram user information is missing."
      });
    }

    if (!service || !PRODUCTS[service]) {
      return res.status(400).json({
        error: "Invalid service."
      });
    }

    if (!productId) {
      return res.status(400).json({
        error: "Please select a product."
      });
    }

    const product =
      findProduct(service, productId);

    if (!product) {
      return res.status(400).json({
        error: "Invalid product."
      });
    }

    /* ---------- SERVER PRICE CHECK ---------- */

    if (Number(price) !== Number(product.price)) {
      return res.status(400).json({
        error: "Invalid product price."
      });
    }

    /* ---------- UID ---------- */

    if (!uid) {
      return res.status(400).json({
        error: "Free Fire UID is required."
      });
    }

    if (!/^[0-9]+$/.test(String(uid))) {
      return res.status(400).json({
        error: "Free Fire UID must contain numbers only."
      });
    }

    if (String(uid).length < 5) {
      return res.status(400).json({
        error: "Invalid Free Fire UID."
      });
    }

    /* ---------- PAYMENT ---------- */

    if (!paymentReference) {
      return res.status(400).json({
        error:
          "Telebirr transaction/reference number is required."
      });
    }

    const orderId =
      generateOrderId();

    const order = {

      orderId,

      telegramId: String(telegramId),

      telegramUser: telegramUser || {},

      service,

      serviceName:
        SERVICE_NAMES[service] ||
        serviceName ||
        "Free Fire Top Up",

      productId,

      productName:
        product.name,

      price:
        product.price,

      uid:
        String(uid),

      nickname:
        nickname
          ? String(nickname).trim()
          : "",

      paymentMethod:
        paymentMethod || "Telebirr",

      paymentReference:
        String(paymentReference).trim(),

      status: "pending",

      createdAt:
        new Date().toISOString()
    };

    /* ---------- SAVE ---------- */

    const orders =
      loadOrders();

    orders.push(order);

    const saved =
      saveOrders(orders);

    if (!saved) {
      return res.status(500).json({
        error:
          "Could not save your order."
      });
    }

    /* ---------- ADMIN NOTIFICATION ---------- */

    await notifyAdmin(order);

    /* ---------- RESPONSE ---------- */

    return res.status(201).json({

      success: true,

      orderId:

        order.orderId,

      message:
        "Order submitted successfully."
    });

  } catch (error) {

    console.error(
      "ORDER ERROR:",
      error
    );

    return res.status(500).json({
      error:
        "Something went wrong while creating the order."
    });
  }
});

/* =========================
   API: USER ORDERS
========================= */

app.get("/api/orders", (req, res) => {

  const telegramId =
    String(req.query.telegramId || "");

  if (!telegramId) {
    return res.status(400).json({
      error:
        "Telegram ID is required."
    });
  }

  const orders =
    loadOrders();

  const userOrders =
    orders
      .filter(order =>
        String(order.telegramId) === telegramId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

  res.json(userOrders);

});

/* =========================
   ADMIN NOTIFICATION
========================= */

async function notifyAdmin(order) {

  if (!ADMIN_CHAT_ID) {
    console.log(
      "ADMIN_CHAT_ID not configured. Order saved without Telegram admin notification."
    );

    return;
  }

  try {

    await bot.telegram.sendMessage(
      ADMIN_CHAT_ID,

      `
🔥 NEW DAGITOPUP ORDER

🆔 Order:
${order.orderId}

🎮 Service:
${order.serviceName}

📦 Package:
${order.productName}

💰 Amount:
${order.price} ETB

👤 Telegram ID:
${order.telegramId}

🎯 Free Fire UID:
${order.uid}

🧑 Name:
${order.nickname || "Not provided"}

💳 Payment:
${order.paymentMethod}

🧾 Transaction:
${order.paymentReference}

📌 Status:
PENDING
      `,

      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "💰 MARK PAID",
            `paid:${order.orderId}`
          )
        ],
        [
          Markup.button.callback(
            "✅ COMPLETE",
            `complete:${order.orderId}`
          )
        ]
      ])
    );

  } catch (error) {

    console.error(
      "ADMIN NOTIFICATION ERROR:",
      error
    );

  }
}

/* =========================
   TELEGRAM BOT
========================= */

const bot =
  new Telegraf(BOT_TOKEN);

/* =========================
   /START
========================= */

bot.start(async ctx => {

  const webAppUrl =
    process.env.WEB_APP_URL ||
    "https://dagitopup.onrender.com/";

  await ctx.reply(

    `
🔥 DAGITOPUP 🇪🇹

Welcome to DAGITOPUP!

💎 Free Fire Diamonds
🎫 Membership
📈 Level Up
🎟️ Booyah Pass

💰 Easy payment with Telebirr
⚡ Fast order processing
📦 Manual fulfillment

Tap the button below to start.
    `,

    Markup.inlineKeyboard([
      [
        Markup.button.webApp(
          "🚀 OPEN DAGITOPUP",
          webAppUrl
        )
      ]
    ])

  );

});

/* =========================
   /MENU
========================= */

bot.command("menu", async ctx => {

  const webAppUrl =
    process.env.WEB_APP_URL ||
    "https://dagitopup.onrender.com/";

  await ctx.reply(

    "🏠 Open the DAGITOPUP shop:",

    Markup.inlineKeyboard([
      [
        Markup.button.webApp(
          "🛒 OPEN SHOP",
          webAppUrl
        )
      ]
    ])

  );

});

/* =========================
   /DIAMONDS
========================= */

bot.command("diamonds", async ctx => {

  await ctx.reply(

    `
💎 DAGITOPUP DIAMONDS

100 + 20 → 190 ETB
310 + 21 → 380 ETB
520 → 1,080 ETB
1,060 → 3,080 ETB
2,180 → 5,000 ETB
5,600 → 12,000 ETB

Open the shop to order.
    `

  );

});

/* =========================
   /MEMBERSHIP
========================= */

bot.command("membership", async ctx => {

  await ctx.reply(

    `
🎫 MEMBERSHIP

Weekly → 450 ETB
Monthly → 1,000 ETB

Open DAGITOPUP to order.
    `

  );

});

/* =========================
   /LEVELUP
========================= */

bot.command("levelup", async ctx => {

  await ctx.reply(

    `
📈 LEVEL UP

Level 6 → 170 ETB
Level 10 → 240 ETB
Level 15 → 240 ETB
Level 20 → 240 ETB
Level 25 → 240 ETB
Level 30 → 300 ETB
    `

  );

});

/* =========================
   /BOOYAH
========================= */

bot.command("booyah", async ctx => {

  await ctx.reply(

    `
🎟️ BOOYAH PASS

Price:
600 ETB

Open DAGITOPUP to order.
    `

  );

});

/* =========================
   /PAYMENT
========================= */

bot.command("payment", async ctx => {

  await ctx.reply(

    `
💰 DAGITOPUP PAYMENT 🇪🇹

📱 Payment Method:
Telebirr

👤 Account Name:
Abebaw Adamu

☎️ Telebirr Number:
0978454451

After payment:

1️⃣ Make the Telebirr payment.
2️⃣ Keep your transaction/reference number.
3️⃣ Enter it when placing your order.
4️⃣ DAGITOPUP will review the payment.
5️⃣ Your order will be manually fulfilled.

⚠️ Please pay the exact amount.
    `

  );

});

/* =========================
   /ORDERS
========================= */

bot.command("orders", async ctx => {

  const telegramId =
    String(ctx.from.id);

  const orders =
    loadOrders()
      .filter(order =>
        String(order.telegramId) === telegramId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

  if (!orders.length) {

    await ctx.reply(
      "📦 You don't have any DAGITOPUP orders yet."
    );

    return;
  }

  let message =
    "📦 YOUR DAGITOPUP ORDERS\n\n";

  orders
    .slice(0, 10)
    .forEach(order => {

      message +=
        `🆔 ${order.orderId}\n` +
        `📦 ${order.productName}\n` +
        `💰 ${order.price} ETB\n` +
        `🎯 UID: ${order.uid}\n` +
        `📌 ${order.status}\n\n`;

    });

  await ctx.reply(message);

});

/* =========================
   /SUPPORT
========================= */

bot.command("support", async ctx => {

  await ctx.reply(

    `
👨‍💼 DAGITOPUP SUPPORT

If you need help with an order,
please send:

🆔 Order ID
🎯 Free Fire UID
🧾 Payment reference

We will check your order manually.
    `

  );

});

/* =========================
   /MYID
========================= */

bot.command("myid", async ctx => {

  await ctx.reply(
    `🆔 Your Telegram ID is:\n${ctx.from.id}`
  );

});

/* =========================
   ADMIN: /PAID
========================= */

bot.command("paid", async ctx => {

  if (
    ADMIN_CHAT_ID &&
    String(ctx.from.id) !== String(ADMIN_CHAT_ID)
  ) {

    return ctx.reply(
      "❌ You are not authorized."
    );

  }

  const parts =
    ctx.message.text
      .trim()
      .split(/\s+/);

  const orderId =
    parts[1];

  if (!orderId) {

    return ctx.reply(
      "Usage:\n/paid DAGI-XXXXXXXX-XXX"
    );

  }

  const orders =
    loadOrders();

  const order =
    orders.find(
      item =>
        item.orderId === orderId
    );

  if (!order) {

    return ctx.reply(
      "❌ Order not found."
    );

  }

  order.status =
    "paid";

  order.paidAt =
    new Date().toISOString();

  saveOrders(orders);

  await ctx.reply(
    `💰 ${orderId} marked as PAID.`
  );

});

/* =========================
   ADMIN: /COMPLETE
========================= */

bot.command("complete", async ctx => {

  if (
    ADMIN_CHAT_ID &&
    String(ctx.from.id) !== String(ADMIN_CHAT_ID)
  ) {

    return ctx.reply(
      "❌ You are not authorized."
    );

  }

  const parts =
    ctx.message.text
      .trim()
      .split(/\s+/);

  const orderId =
    parts[1];

  if (!orderId) {

    return ctx.reply(
      "Usage:\n/complete DAGI-XXXXXXXX-XXX"
    );

  }

  const orders =
    loadOrders();

  const order =
    orders.find(
      item =>
        item.orderId === orderId
    );

  if (!order) {

    return ctx.reply(
      "❌ Order not found."
    );

  }

  order.status =
    "completed";

  order.completedAt =
    new Date().toISOString();

  saveOrders(orders);

  await ctx.reply(
    `✅ ${orderId} marked as COMPLETED.`
  );

});

/* =========================
   ADMIN BUTTON ACTIONS
========================= */

bot.action(/^paid:(.+)$/, async ctx => {

  if (
    ADMIN_CHAT_ID &&
    String(ctx.from.id) !== String(ADMIN_CHAT_ID)
  ) {

    await ctx.answerCbQuery(
      "Not authorized."
    );

    return;
  }

  const orderId =
    ctx.match[1];

  const orders =
    loadOrders();

  const order =
    orders.find(
      item =>
        item.orderId === orderId
    );

  if (!order) {

    await ctx.answerCbQuery(
      "Order not found."
    );

    return;
  }

  order.status =
    "paid";

  order.paidAt =
    new Date().toISOString();

  saveOrders(orders);

  await ctx.answerCbQuery(
    "Marked as paid."
  );

  await ctx.editMessageText(
    `💰 PAID\n\nOrder: ${orderId}\nPackage: ${order.productName}\nAmount: ${order.price} ETB`
  );

});

bot.action(/^complete:(.+)$/, async ctx => {

  if (
    ADMIN_CHAT_ID &&
    String(ctx.from.id) !== String(ADMIN_CHAT_ID)
  ) {

    await ctx.answerCbQuery(
      "Not authorized."
    );

    return;
  }

  const orderId =
    ctx.match[1];

  const orders =
    loadOrders();

  const order =
    orders.find(
      item =>
        item.orderId === orderId
    );

  if (!order) {

    await ctx.answerCbQuery(
      "Order not found."
    );

    return;
  }

  order.status =
    "completed";

  order.completedAt =
    new Date().toISOString();

  saveOrders(orders);

  await ctx.answerCbQuery(
    "Order completed."
  );

  await ctx.editMessageText(
    `✅ COMPLETED\n\nOrder: ${orderId}\nPackage: ${order.productName}\nUID: ${order.uid}`
  );

});

/* =========================
   BOT ERROR HANDLER
========================= */

bot.catch(error => {

  console.error(
    "Telegram bot error:",
    error
  );

});

/* =========================
   START BOT
========================= */

bot.launch()
  .then(() => {

    console.log(
      "🔥 DAGITOPUP Telegram bot started."
    );

  })
  .catch(error => {

    console.error(
      "❌ Telegram bot failed to start:",
      error
    );

  });

/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `🚀 DAGITOPUP server running on port ${PORT}`
    );

  }
);

/* =========================
   GRACEFUL SHUTDOWN
========================= */

process.once(
  "SIGINT",
  () => bot.stop("SIGINT")
);

process.once(
  "SIGTERM",
  () => bot.stop("SIGTERM")
);
