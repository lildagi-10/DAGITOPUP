const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const state = { selected: null };

const PRODUCTS = {
  diamonds: [
    ["d100","100 + 20 Diamonds",190],
    ["d310","310 + 21 Diamonds",380],
    ["d520","520 Diamonds",1080],
    ["d1060","1,060 Diamonds",3080],
    ["d2180","2,180 Diamonds",5000],
    ["d5600","5,600 Diamonds",12000],
  ],
  membership: [
    ["weekly","Weekly Membership",450],
    ["monthly","Monthly Membership",1000],
  ],
  levelup: [
    ["l6","Level 6 — 120 Diamonds",170],
    ["l10","Level 10 — 200 Diamonds",240],
    ["l15","Level 15 — 200 Diamonds",240],
    ["l20","Level 20 — 200 Diamonds",240],
    ["l25","Level 25 — 200 Diamonds",240],
    ["l30","Level 30 — 350 Diamonds",300],
  ],
  booyah: [["booyah","Booyah Pass",600]]
};

const byId = {};
Object.values(PRODUCTS).flat().forEach(p => byId[p[0]] = {id:p[0],name:p[1],price:p[2]});

function money(n){ return Number(n).toLocaleString("en-US") + " ETB"; }

function render(sectionId, items){
  const el = document.getElementById(sectionId);
  el.innerHTML = items.map(p => `
    <button class="product" data-id="${p[0]}">
      <div class="name">${p[1]}</div>
      <div class="price">${money(p[2])}</div>
      <div class="buy">Tap to select • 🛒 Order</div>
    </button>
  `).join("");
  el.querySelectorAll(".product").forEach(btn => {
    btn.addEventListener("click", () => selectProduct(btn.dataset.id));
  });
}

Object.entries(PRODUCTS).forEach(([key,items]) => render(key,items));

function selectProduct(id){
  state.selected = byId[id];
  document.querySelectorAll(".product").forEach(b => b.classList.toggle("selected", b.dataset.id === id));
  document.getElementById("chosen").innerHTML = `✅ <strong>${state.selected.name}</strong><br>💰 ${money(state.selected.price)}`;
  document.getElementById("order").scrollIntoView({behavior:"smooth",block:"start"});
}

document.getElementById("cancel").addEventListener("click", () => {
  state.selected = null;
  document.querySelectorAll(".product").forEach(b => b.classList.remove("selected"));
  document.getElementById("chosen").textContent = "Choose a product above.";
  document.getElementById("uid").value = "";
  document.getElementById("ref").value = "";
  document.getElementById("out").textContent = "";
});

document.getElementById("submit").addEventListener("click", async () => {
  const out = document.getElementById("out");
  out.className = "output";
  if (!state.selected) { out.textContent = "Please choose a product first."; out.classList.add("error"); return; }

  const uid = document.getElementById("uid").value.trim();
  const paymentRef = document.getElementById("ref").value.trim();
  if (!/^\d{5,20}$/.test(uid)) { out.textContent = "Please enter a valid Free Fire UID (5–20 digits)."; out.classList.add("error"); return; }
  if (paymentRef.length < 3) { out.textContent = "Please enter your Telebirr transaction/reference number."; out.classList.add("error"); return; }

  const user = tg?.initDataUnsafe?.user || {};
  const payload = {
    productId: state.selected.id,
    uid,
    paymentRef,
    telegramId: user.id || "",
    telegramUsername: user.username || "",
    telegramName: [user.first_name,user.last_name].filter(Boolean).join(" ")
  };

  out.textContent = "⏳ Sending your order...";
  try {
    const res = await fetch("/api/order", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Order failed");
    out.classList.add("success");
    out.innerHTML = `🎉 <strong>Order received!</strong><br><br>🧾 Order ID: <strong>${data.order.id}</strong><br>💰 ${money(data.order.price)}<br>📌 ${data.order.status}<br><br>Keep this Order ID for support.`;
    document.getElementById("loadOrders").click();
  } catch(e) {
    out.classList.add("error");
    out.textContent = "❌ " + e.message;
  }
});

document.getElementById("loadOrders").addEventListener("click", async () => {
  const box = document.getElementById("myOrders");
  const userId = tg?.initDataUnsafe?.user?.id;
  if (!userId) {
    box.innerHTML = '<div class="order-item">Open the shop from Telegram to view your orders.</div>';
    return;
  }
  box.innerHTML = '<div class="order-item">⏳ Loading...</div>';
  try {
    const res = await fetch("/api/orders?telegramId=" + encodeURIComponent(userId));
    const data = await res.json();
    if (!data.orders?.length) { box.innerHTML = '<div class="order-item">No orders yet.</div>'; return; }
    box.innerHTML = data.orders.map(o => `
      <div class="order-item">
        <strong>${o.id}</strong><br>${o.productName}<br>💰 ${money(o.price)}
        <div class="status">📌 ${o.status}</div>
        <small>${new Date(o.createdAt).toLocaleString()}</small>
      </div>
    `).join("");
  } catch {
    box.innerHTML = '<div class="order-item">Could not load orders.</div>';
  }
});

document.getElementById("openTelegram").addEventListener("click", () => {
  if (tg) tg.close();
  else window.location.href = "https://t.me/DAGITOPUP_BOT";
});
