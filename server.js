const express = require("express");
const path = require("path");
const fs = require("fs");
const { Telegraf, Markup } = require("telegraf");

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is missing.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const PRODUCTS = {
  diamonds: [
    { id: "d100", category: "Diamonds", name: "100 + 20 Diamonds", price: 190 },
    { id: "d310", category: "Diamonds", name: "310 + 21 Diamonds", price: 380 },
    { id: "d520", category: "Diamonds", name: "520 Diamonds", price: 1080 },
    { id: "d1060", category: "Diamonds", name: "1,060 Diamonds", price: 3080 },
    { id: "d2180", category: "Diamonds", name: "2,180 Diamonds", price: 5000 },
    { id: "d5600", category: "Diamonds", name: "5,600 Diamonds", price: 12000 },
  ],
  membership: [
    { id: "weekly", category: "Membership", name: "Weekly Membership", price: 450 },
    { id: "monthly", category: "Membership", name: "Monthly Membership", price: 1000 },
  ],
  levelup: [
    { id: "l6", category: "Level Up", name: "Level 6 — 120 Diamonds", price: 170 },
    { id: "l10", category: "Level Up", name: "Level 10 — 200 Diamonds", price: 240 },
    { id: "l15", category: "Level Up", name: "Level 15 — 200 Diamonds", price: 240 },
    { id: "l20", category: "Level Up", name: "Level 20 — 200 Diamonds", price: 240 },
    { id: "l25", category: "Level Up", name: "Level 25 — 200 Diamonds", price: 240 },
    { id: "l30", category: "Level Up", name: "Level 30 — 350 Diamonds", price: 300 },
  ],
  booyah: [
    { id: "booyah", category: "Booyah Pass", name: "Booyah Pass", price: 600 },
  ],
};

const ALL_PRODUCTS = Object.values(PRODUCTS).flat();
const productById = new Map(ALL_PRODUCTS.map((p) => [p.id, p]));

const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
fs.mkdirSync(DATA_DIR, { recursive: true });

function readOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function newOrderId() {
  const now = new Date();
  const stamp = now.toISOString().replace(/\D/g, "").slice(0, 14);
  const random = Math.floor(100 + Math.random() * 900);
  return `DAGI-${stamp}-${random}`;
}

function money(n) {
  return `${Number(n).toLocaleString("en-US")} ETB`;
}

function mainKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💎 Diamonds", "diamonds"), Markup.button.callback("🎫 Membership", "membership")],
    [Markup.button.callback("📈 Level Up", "levelup"), Markup.button.callback("🎟️ Booyah Pass", "booyah")],
    [Markup.button.callback("📦 My Orders", "orders"), Markup.button.callback("💰 Payment", "payment")],
    [Markup.button.callback("👨‍💼 Support", "support")],
  ]);
}

async function showCategory(ctx, key) {
  const products = PRODUCTS[key];
  const title = products[0].category;
  const lines = products.map((p) => `• ${p.name} — ${money(p.price)}`);
  await ctx.reply(`🔥 DAGITOPUP 🇪🇹\n\n${title}\n\n${lines.join("\n")}\n\n🛒 Open the shop to order.`, {
    ...mainKeyboard(),
    link_preview_options: { is_disabled: true },
  });
}

bot.start(async (ctx) => {
  await ctx.reply(
    "🔥 DAGITOPUP 🇪🇹\n\nWelcome to DAGITOPUP!\n\n💎 Diamonds\n🎫 Membership\n📈 Level Up\n🎟️ Booyah Pass\n\n📦 Manual order fulfillment\n💰 Telebirr payment\n\nTap a category below or open the 🛒 Shop.",
    mainKeyboard()
  );
});

bot.command("menu", (ctx) => ctx.reply("🏠 DAGITOPUP Main Menu", mainKeyboard()));
bot.command("diamonds", (ctx) => showCategory(ctx, "diamonds"));
bot.command("membership", (ctx) => showCategory(ctx, "membership"));
bot.command("levelup", (ctx) => showCategory(ctx, "levelup"));
bot.command("booyah", (ctx) => showCategory(ctx, "booyah"));

bot.command("payment", (ctx) => ctx.reply(
  "💰 DAGITOPUP PAYMENT 🇪🇹\n\n📱 Method: Telebirr\n👤 Account: Abebaw Adamu\n☎️ Number: 0978454451\n\n1️⃣ Pay the exact order amount.\n2️⃣ Keep your Telebirr transaction/reference number.\n3️⃣ Submit the order in the shop.\n4️⃣ DAGITOPUP verifies the payment.\n5️⃣ The order is manually fulfilled."
));

bot.command("support", (ctx) => ctx.reply(
  "👨‍💼 DAGITOPUP SUPPORT\n\nFor help with an order, send your Order ID and explain the issue.\n\nExample: DAGI-20261002123000-123"
));

bot.command("myid", (ctx) => ctx.reply(`🆔 Your Telegram chat ID is:\n${ctx.chat.id}`));

bot.command("orders", async (ctx) => {
  const orders = readOrders().filter((o) => String(o.telegramId) === String(ctx.chat.id)).slice(-10).reverse();
  if (!orders.length) return ctx.reply("📦 You don't have any orders yet.");
  const text = orders.map((o) =>
    `🧾 ${o.id}\n${o.productName}\n💰 ${money(o.price)}\n📌 ${o.status}\n`
  ).join("\n");
  await ctx.reply(`📦 YOUR ORDERS\n\n${text}`);
});

bot.action("diamonds", async (ctx) => { await ctx.answerCbQuery(); await showCategory(ctx, "diamonds"); });
bot.action("membership", async (ctx) => { await ctx.answerCbQuery(); await showCategory(ctx, "membership"); });
bot.action("levelup", async (ctx) => { await ctx.answerCbQuery(); await showCategory(ctx, "levelup"); });
bot.action("booyah", async (ctx) => { await ctx.answerCbQuery(); await showCategory(ctx, "booyah"); });
bot.action("payment", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply("💰 Telebirr\n👤 Abebaw Adamu\n☎️ 0978454451\n\nPay the exact amount, then submit your order in the shop."); });
bot.action("support", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply("👨‍💼 Send your Order ID here if you need support."); });
bot.action("orders", async (ctx) => { await ctx.answerCbQuery(); await ctx.telegram.sendMessage(ctx.chat.id, "/orders"); });

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/products", (req, res) => res.json({ products: ALL_PRODUCTS }));

app.post("/api/order", async (req, res) => {
  try {
    const { productId, uid, paymentRef, telegramId, telegramUsername, telegramName } = req.body || {};
    const product = productById.get(String(productId || ""));
    const cleanUid = String(uid || "").trim();
    const cleanRef = String(paymentRef || "").trim();
    const tgId = String(telegramId || "").trim();

    if (!product) return res.status(400).json({ ok: false, error: "Please select a valid product." });
    if (!/^\d{5,20}$/.test(cleanUid)) return res.status(400).json({ ok: false, error: "Enter a valid Free Fire UID (5–20 digits)." });
    if (cleanRef.length < 3 || cleanRef.length > 100) return res.status(400).json({ ok: false, error: "Enter a valid Telebirr transaction/reference number." });

    const orders = readOrders();
    const order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      telegramId: tgId || null,
      telegramUsername: telegramUsername || null,
      telegramName: telegramName || null,
      uid: cleanUid,
      productId: product.id,
      category: product.category,
      productName: product.name,
      price: product.price,
      paymentRef: cleanRef,
      status: "Payment verification pending",
    };

    orders.push(order);
    writeOrders(orders);

    if (tgId) {
      try {
        await bot.telegram.sendMessage(
          tgId,
          `🧾 ORDER RECEIVED — ${order.id}\n\n${order.productName}\n💰 ${money(order.price)}\n🎮 UID: ${order.uid}\n💳 Ref: ${order.paymentRef}\n\n📌 Status: Payment verification pending\n\nPlease keep your Order ID. Your order will be manually fulfilled after payment verification.`
        );
      } catch (e) {
        console.log("Customer notification skipped:", e.message);
      }
    }

    if (ADMIN_CHAT_ID) {
      try {
        await bot.telegram.sendMessage(
          ADMIN_CHAT_ID,
          `🔔 NEW DAGITOPUP ORDER\n\n🧾 ${order.id}\n${order.productName}\n💰 ${money(order.price)}\n🎮 UID: ${order.uid}\n💳 Ref: ${order.paymentRef}\n👤 Telegram: ${order.telegramUsername ? "@" + order.telegramUsername : order.telegramId || "Unknown"}\n\nUse /paid ${order.id} after checking payment.\nUse /complete ${order.id} after fulfillment.`
        );
      } catch (e) {
        console.log("Admin notification failed:", e.message);
      }
    }

    res.json({ ok: true, order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Server error. Please try again." });
  }
});

app.get("/api/orders", (req, res) => {
  const telegramId = String(req.query.telegramId || "");
  if (!telegramId) return res.status(400).json({ ok: false, error: "telegramId is required." });
  const orders = readOrders().filter((o) => String(o.telegramId) === telegramId).slice(-20).reverse();
  res.json({ ok: true, orders });
});

function updateOrderStatus(id, status) {
  const orders = readOrders();
  const order = orders.find((o) => o.id.toUpperCase() === String(id).toUpperCase());
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  writeOrders(orders);
  return order;
}

async function requireAdmin(ctx, next) {
  if (!ADMIN_CHAT_ID || String(ctx.chat.id) !== String(ADMIN_CHAT_ID)) {
    await ctx.reply("🔒 Admin access is not configured for this chat.");
    return;
  }
  return next();
}

bot.command("admin", requireAdmin, async (ctx) => {
  const orders = readOrders().slice(-20).reverse();
  if (!orders.length) return ctx.reply("📦 No orders yet.");
  const text = orders.map((o) => `🧾 ${o.id}\n${o.productName} — ${money(o.price)}\n🎮 ${o.uid}\n📌 ${o.status}`).join("\n\n");
  await ctx.reply(`👨‍💼 ADMIN ORDERS\n\n${text}`);
});

bot.command("paid", requireAdmin, async (ctx) => {
  const id = ctx.message.text.split(/\s+/)[1];
  if (!id) return ctx.reply("Use: /paid ORDER_ID");
  const order = updateOrderStatus(id, "Payment verified — ready for fulfillment");
  if (!order) return ctx.reply("Order not found.");
  await ctx.reply(`✅ Payment verified\n${order.id}`);
  if (order.telegramId) {
    await ctx.telegram.sendMessage(order.telegramId, `✅ PAYMENT VERIFIED\n\n${order.id}\n${order.productName}\n\nYour payment has been verified. Your order is now being processed manually.`);
  }
});

bot.command("complete", requireAdmin, async (ctx) => {
  const id = ctx.message.text.split(/\s+/)[1];
  if (!id) return ctx.reply("Use: /complete ORDER_ID");
  const order = updateOrderStatus(id, "Completed");
  if (!order) return ctx.reply("Order not found.");
  await ctx.reply(`🎉 Order completed\n${order.id}`);
  if (order.telegramId) {
    await ctx.telegram.sendMessage(order.telegramId, `🎉 ORDER COMPLETED\n\n${order.id}\n${order.productName}\n\nYour order has been manually fulfilled. Thank you for using DAGITOPUP! 🇪🇹`);
  }
});

app.get("/health", (req, res) => res.json({ ok: true, service: "DAGITOPUP" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DAGITOPUP web server running on port ${PORT}`);
});

bot.launch().then(() => console.log("DAGITOPUP Telegram bot started")).catch(console.error);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
