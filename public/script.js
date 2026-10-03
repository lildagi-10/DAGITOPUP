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

let verifiedPlayer = null;
let checkingPlayer = false;

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
  return
