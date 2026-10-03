const express = require("express");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

/* =========================================================
   DAGITOPUP PRODUCTS
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

const SERVICE_NAMES = {
  diamonds: "💎 Free Fire Diamonds",
  membership: "🎫 Membership",
  levelup: "📈 Level Up",
  booyah: "🎟️ Booyah Pass"
};

/* =========================================================
   FILE STORAGE
========================================================= */

const ORDERS_FILE = path.join(__dirname, "orders.json");

function ensureOrdersFile() {
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
  }
}

function readOrders() {
  ensureOrdersFile();

  try {
    const data = fs.readFileSync(ORDERS_FILE, "utf8");
    const orders = JSON.parse(data);

    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error("❌ Could not read orders.json:", error);
    return [];
  }
}

function saveOrders(orders) {
  fs.writeFileSync(
    ORDERS_FILE,
    JSON.stringify(orders, null, 2),
    "utf8"
  );
}

function generateOrderId() {
  return `DAGI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* =========================================================
   EXPRESS SETUP
========================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   HOME
========================================================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "DAGITOPUP is running",
    time: new Date().toISOString()
  });
});

/* =========================================================
   PRODUCTS API
========================================================= */

app.get("/api/products", (req, res) => {
  res.json({
    success: true,
    products: PRODUCTS
  });
});

/* =========================================================
   FREE FIRE PLAYER LOOKUP
========================================================= */

/*
  Automatic Free Fire nickname lookup is temporarily disabled.

  The customer only enters their Free Fire UID.

  DAGITOPUP will manually verify the UID/order before fulfillment.
*/

app.get("/api/player/:uid", (req, res) => {
  const uid = String(req.params.uid || "").trim();

  if (!/^\d{5,14}$/.test(uid)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Free Fire UID."
    });
  }

  return res.json({
    success: true,
    uid: uid,
    nickname: "",
    region: "Not verified",
    level: null,
    isBanned: null,
    status: "UID RECEIVED"
  });
});

/* =========================================================
   CREATE ORDER
========================================================= */

app.post("/api/order", async (req, res) => {
  try {
    const {
      telegramId,
      username,
      service,
      productId,
      productName,
      price,
      uid,
      nickname,
      paymentRef
    } = req.body;

    /* ---------- Telegram ID ---------- */

    if (!telegramId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required."
      });
    }

    /* ---------- Service ---------- */

    if (!PRODUCTS[service]) {
      return res.status(400).json({
        success: false,
        error: "Invalid service."
      });
    }

    /* ---------- Product ---------- */

    const product = PRODUCTS[service].find(
      item => item.id === productId
    );

    if (!product) {
      return res.status(400).json({
        success: false,
        error: "Invalid product."
      });
    }

    /* ---------- Price ---------- */

    const submittedPrice = Number(price);

    if (submittedPrice !== product.price) {
      return res.status(400).json({
        success: false,
        error: "Invalid price."
      });
    }

    /* ---------- UID ---------- */

    const cleanUID = String(uid || "").trim();

    if (!/^\d{5,14}$/.test(cleanUID)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid Free Fire UID."
      });
    }

    /* ---------- Payment Reference ---------- */

    const cleanPaymentRef = String(paymentRef || "").trim();

    if (!cleanPaymentRef) {
      return res.status(400).json({
        success: false,
        error: "Payment transaction/reference number is required."
      });
    }

    /* ---------- Order ---------- */

    const order = {
      id: generateOrderId(),

      telegramId: String(telegramId),

      username: username
        ? String(username)
        : "",

      service: service,

      serviceName:
        SERVICE_NAMES[service] || service,

      productId: product.id,

      productName: product.name,

      price: product.price,

      uid: cleanUID,

      /*
        Nickname is intentionally not collected
        from the customer.
      */
      nickname: "",

      paymentRef: cleanPaymentRef,

      status: "pending",

      createdAt: new Date().toISOString(),

      paidAt: null,

      completedAt: null
    };

    const orders = readOrders();

    orders.push(order);

    saveOrders(orders);

    console.log("✅ New order:", order.id);

    /* ---------- Notify Admin ---------- */

    await notifyAdmin(order);

    return res.json({
      success: true,
      message: "Order submitted successfully.",
      order: {
        id: order.id,
        status: order.status,
        service: order.serviceName,
        product: order.productName,
        price: order.price,
        uid: order.uid,
        nickname: "Not verified"
      }
    });

  } catch (error) {

    console.error("❌ Order error:", error);

    return res.status(500).json({
      success: false,
      error: "Could not create order."
    });
  }
});

/* =========================================================
   GET ORDERS
========================================================= */

app.get("/api/orders", (req, res) => {
  try {
    const telegramId = String(req.query.telegramId || "").trim();

    if (!telegramId) {
      return res.status(400).json({
        success: false,
        error: "Telegram user ID is required."
      });
    }

    const orders = readOrders();

    const userOrders = orders
      .filter(order =>
        String(order.telegramId) === telegramId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

    return res.json({
      success: true,
      orders: userOrders
    });

  } catch (error) {

    console.error("❌ Orders error:", error);

    return res.status(500).json({
      success: false,
      error: "Could not load orders."
    });
  }
});

/* =========================================================
   ADMIN NOTIFICATION
========================================================= */

async function notifyAdmin(order) {

  if (!ADMIN_CHAT_ID) {
    console.log(
      "ℹ️ ADMIN_CHAT_ID is not configured. Order saved without admin notification."
    );

    return;
  }

  try {

    const message = `
🔥 <b>NEW DAGITOPUP ORDER</b>

🧾 <b>Order ID:</b>
<code>${escapeTelegramHtml(order.id)}</code>

👤 <b>Username:</b>
${escapeTelegramHtml(order.username || "Not provided")}

🛒 <b>Service:</b>
${escapeTelegramHtml(order.serviceName)}

📦 <b>Package:</b>
${escapeTelegramHtml(order.productName)}

💰 <b>Price:</b>
${order.price} ETB

🎯 <b>Free Fire UID:</b>
<code>${escapeTelegramHtml(order.uid)}</code>

🧑 <b>Account Name:</b>
Not verified

💳 <b>Payment Reference:</b>
<code>${escapeTelegramHtml(order.paymentRef)}</code>

📌 <b>Status:</b>
PENDING
`;

    await bot.telegram.sendMessage(
      ADMIN_CHAT_ID,
      message,
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              "✅ Mark Paid",
              `paid:${order.id}`
            )
          ],
          [
            Markup.button.callback(
              "📦 Complete Order",
              `complete:${order.id}`
            )
          ]
        ])
      }
    );

  } catch (error) {

    console.error(
      "❌ Admin notification error:",
      error
    );
  }
}

/* =========================================================
   TELEGRAM HTML ESCAPE
========================================================= */

function escapeTelegramHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* =========================================================
   TELEGRAM START
========================================================= */

bot.start(async ctx => {

  const firstName =
    ctx.from.first_name || "there";

  await ctx.reply(
`🔥 <b>DAGITOPUP 🇪🇹</b>

Welcome, ${escapeTelegramHtml(firstName)}!

💎 Free Fire Diamonds
🎫 Membership
📈 Level Up
🎟️ Booyah Pass

⚡ Fast order processing
📦 Manual order fulfillment

Choose an option below 👇`,
    {
      parse_mode: "HTML",

      ...Markup.keyboard([
        ["💎 Diamonds", "🎫 Membership"],
        ["📈 Level Up", "🎟️ Booyah Pass"],
        ["📦 My Orders", "💰 Payment"],
        ["👨‍💼 Support"]
      ]).resize()
    }
  );

});

/* =========================================================
   MAIN MENU
========================================================= */

bot.command("menu", async ctx => {

  await ctx.reply(
`🔥 <b>DAGITOPUP 🇪🇹</b>

Welcome to DAGITOPUP!

What would you like to order?

💎 Diamonds
🎫 Membership
📈 Level Up
🎟️ Booyah Pass

📦 My Orders
💰 Payment
👨‍💼 Support`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   DIAMONDS
========================================================= */

bot.command("diamonds", async ctx => {

  const items = PRODUCTS.diamonds
    .map(
      item =>
        `💎 ${item.name} — <b>${item.price} ETB</b>`
    )
    .join("\n");

  await ctx.reply(
`💎 <b>FREE FIRE DIAMONDS</b>

${items}

📲 Open DAGITOPUP Mini App to order.`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   MEMBERSHIP
========================================================= */

bot.command("membership", async ctx => {

  const items = PRODUCTS.membership
    .map(
      item =>
        `🎫 ${item.name} — <b>${item.price} ETB</b>`
    )
    .join("\n");

  await ctx.reply(
`🎫 <b>MEMBERSHIP</b>

${items}

📲 Open DAGITOPUP Mini App to order.`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   LEVEL UP
========================================================= */

bot.command("levelup", async ctx => {

  const items = PRODUCTS.levelup
    .map(
      item =>
        `📈 ${item.name} — <b>${item.price} ETB</b>`
    )
    .join("\n");

  await ctx.reply(
`📈 <b>LEVEL UP</b>

${items}

📲 Open DAGITOPUP Mini App to order.`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   BOOYAH PASS
========================================================= */

bot.command("booyah", async ctx => {

  await ctx.reply(
`🎟️ <b>BOOYAH PASS</b>

🎟️ Booyah Pass — <b>600 ETB</b>

📲 Open DAGITOPUP Mini App to order.`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   PAYMENT
========================================================= */

bot.command("payment", async ctx => {

  await ctx.reply(
`💰 <b>DAGITOPUP PAYMENT 🇪🇹</b>

📱 <b>Payment Method:</b>
Telebirr

👤 <b>Account Name:</b>
Abebaw Adamu

☎️ <b>Telebirr Number:</b>
0978454451

After making your payment:

1️⃣ Make your Telebirr payment.
2️⃣ Enter your transaction/reference number.
3️⃣ Submit your order.
4️⃣ DAGITOPUP will confirm the payment.
5️⃣ Your order will be manually fulfilled.

⚠️ Please make sure the payment amount is correct.`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   SUPPORT
========================================================= */

bot.command("support", async ctx => {

  await ctx.reply(
`👨‍💼 <b>DAGITOPUP SUPPORT</b>

Need help with your order?

Please send your:
🧾 Order ID
🎯 Free Fire UID
💳 Payment reference

and describe the problem.

Our support team will assist you.`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   ORDERS
========================================================= */

bot.command("orders", async ctx => {

  const telegramId = String(ctx.from.id);

  const orders = readOrders()
    .filter(
      order =>
        String(order.telegramId) === telegramId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

  if (orders.length === 0) {

    return ctx.reply(
`📦 <b>MY ORDERS</b>

You don't have any orders yet.

Open DAGITOPUP and place your first order! 🔥`,
      {
        parse_mode: "HTML"
      }
    );
  }

  const text = orders
    .slice(0, 10)
    .map(order => {

      return `🧾 <b>${escapeTelegramHtml(order.id)}</b>
📦 ${escapeTelegramHtml(order.productName)}
💰 ${order.price} ETB
🎯 UID: <code>${escapeTelegramHtml(order.uid)}</code>
📌 Status: ${escapeTelegramHtml(order.status)}
`;
    })
    .join("\n");

  await ctx.reply(
`📦 <b>MY ORDERS</b>

${text}`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   MY ID
========================================================= */

bot.command("myid", async ctx => {

  await ctx.reply(
`🆔 Your Telegram ID:

<code>${ctx.from.id}</code>`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   ADMIN: MARK PAID
========================================================= */

bot.command("paid", async ctx => {

  if (
    ADMIN_CHAT_ID &&
    String(ctx.chat.id) !== String(ADMIN_CHAT_ID)
  ) {
    return;
  }

  const parts = ctx.message.text.trim().split(/\s+/);

  if (!parts[1]) {

    return ctx.reply(
      "Usage: /paid ORDER_ID"
    );
  }

  const orderId = parts[1];

  const orders = readOrders();

  const order = orders.find(
    item => item.id === orderId
  );

  if (!order) {

    return ctx.reply(
      "❌ Order not found."
    );
  }

  order.status = "paid";
  order.paidAt = new Date().toISOString();

  saveOrders(orders);

  await ctx.reply(
`✅ <b>PAYMENT MARKED PAID</b>

🧾 Order:
<code>${escapeTelegramHtml(order.id)}</code>

📦 ${escapeTelegramHtml(order.productName)}

🎯 UID:
<code>${escapeTelegramHtml(order.uid)}</code>`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   ADMIN: COMPLETE
========================================================= */

bot.command("complete", async ctx => {

  if (
    ADMIN_CHAT_ID &&
    String(ctx.chat.id) !== String(ADMIN_CHAT_ID)
  ) {
    return;
  }

  const parts = ctx.message.text.trim().split(/\s+/);

  if (!parts[1]) {

    return ctx.reply(
      "Usage: /complete ORDER_ID"
    );
  }

  const orderId = parts[1];

  const orders = readOrders();

  const order = orders.find(
    item => item.id === orderId
  );

  if (!order) {

    return ctx.reply(
      "❌ Order not found."
    );
  }

  order.status = "completed";
  order.completedAt =
    new Date().toISOString();

  saveOrders(orders);

  await ctx.reply(
`🎉 <b>ORDER COMPLETED</b>

🧾 Order:
<code>${escapeTelegramHtml(order.id)}</code>

📦 ${escapeTelegramHtml(order.productName)}

🎯 UID:
<code>${escapeTelegramHtml(order.uid)}</code>

✅ Status: COMPLETED`,
    {
      parse_mode: "HTML"
    }
  );

});

/* =========================================================
   ADMIN BUTTON: MARK PAID
========================================================= */

bot.action(/^paid:(.+)$/, async ctx => {

  try {

    if (
      ADMIN_CHAT_ID &&
      String(ctx.chat.id) !== String(ADMIN_CHAT_ID)
    ) {
      return ctx.answerCbQuery(
        "Not authorized."
      );
    }

    const orderId = ctx.match[1];

    const orders = readOrders();

    const order = orders.find(
      item => item.id === orderId
    );

    if (!order) {

      await ctx.answerCbQuery(
        "Order not found."
      );

      return;
    }

    order.status = "paid";
    order.paidAt =
      new Date().toISOString();

    saveOrders(orders);

    await ctx.answerCbQuery(
      "Payment marked as paid."
    );

    await ctx.editMessageReplyMarkup(
      {
        inline_keyboard: [
          [
            Markup.button.callback(
              "📦 Complete Order",
              `complete:${order.id}`
            )
          ]
        ]
      }
    );

  } catch (error) {

    console.error(
      "❌ Paid button error:",
      error
    );
  }

});

/* =========================================================
   ADMIN BUTTON: COMPLETE
========================================================= */

bot.action(/^complete:(.+)$/, async ctx => {

  try {

    if (
      ADMIN_CHAT_ID &&
      String(ctx.chat.id) !== String(ADMIN_CHAT_ID)
    ) {
      return ctx.answerCbQuery(
        "Not authorized."
      );
    }

    const orderId = ctx.match[1];

    const orders = readOrders();

    const order = orders.find(
      item => item.id === orderId
    );

    if (!order) {

      await ctx.answerCbQuery(
        "Order not found."
      );

      return;
    }

    order.status = "completed";

    order.completedAt =
      new Date().toISOString();

    saveOrders(orders);

    await ctx.answerCbQuery(
      "Order completed."
    );

    await ctx.editMessageReplyMarkup({
      inline_keyboard: []
    });

    await ctx.reply(
`🎉 <b>ORDER COMPLETED</b>

🧾 <b>Order ID:</b>
<code>${escapeTelegramHtml(order.id)}</code>

📦 <b>Package:</b>
${escapeTelegramHtml(order.productName)}

🎯 <b>UID:</b>
<code>${escapeTelegramHtml(order.uid)}</code>

💰 <b>Amount:</b>
${order.price} ETB

✅ <b>Status:</b> COMPLETED`,
      {
        parse_mode: "HTML"
      }
    );

  } catch (error) {

    console.error(
      "❌ Complete button error:",
      error
    );
  }

});

/* =========================================================
   TELEGRAM TEXT BUTTONS
========================================================= */

bot.hears("💎 Diamonds", ctx =>
  ctx.reply(
    "💎 Use /diamonds to view all diamond packages."
  )
);

bot.hears("🎫 Membership", ctx =>
  ctx.reply(
    "🎫 Use /membership to view membership packages."
  )
);

bot.hears("📈 Level Up", ctx =>
  ctx.reply(
    "📈 Use /levelup to view Level Up packages."
  )
);

bot.hears("🎟️ Booyah Pass", ctx =>
  ctx.reply(
    "🎟️ Use /booyah to view the Booyah Pass."
  )
);

bot.hears("📦 My Orders", ctx =>
  ctx.reply(
    "📦 Use /orders to view your orders."
  )
);

bot.hears("💰 Payment", ctx =>
  ctx.reply(
`💰 Telebirr

👤 Abebaw Adamu
☎️ 0978454451

Use the DAGITOPUP Mini App to submit your order and payment reference.`
  )
);

bot.hears("👨‍💼 Support", ctx =>
  ctx.reply(
`👨‍💼 DAGITOPUP SUPPORT

Send your Order ID and explain the problem.`
  )
);

/* =========================================================
   ERROR HANDLER
========================================================= */

bot.catch(error => {

  console.error(
    "❌ Telegram bot error:",
    error
  );

});

/* =========================================================
   START TELEGRAM BOT
========================================================= */

bot.launch()
  .then(() => {
    console.log("🤖 DAGITOPUP Telegram bot started.");
  })
  .catch(error => {
    console.error(
      "❌ Telegram bot failed to start:",
      error
    );
  });

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

  console.log(
    `🚀 DAGITOPUP server running on port ${PORT}`
  );

});

/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

process.once("SIGINT", () => {

  bot.stop("SIGINT");

});

process.once("SIGTERM", () => {

  bot.stop("SIGTERM");

});
