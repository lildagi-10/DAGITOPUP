DAGITOPUP SETUP

1. Keep your BotFather token private. Put it only in BOT_TOKEN on your hosting service.
2. Deploy this Node/Express project to a web service such as Render.
3. Environment variables: BOT_TOKEN=your new token, ADMIN_CHAT_ID=your Telegram chat ID.
4. Start the bot and send /myid to get your Telegram chat ID; put that number in ADMIN_CHAT_ID.
5. Payment account in this project: Telebirr — Abebaw Adamu — 0978454451.
6. Prices are deliberately not invented. Replace the 0 values in public/script.js with your actual prices.
7. After deployment, Render gives an HTTPS onrender.com URL. Put that URL into BotFather /setmenubutton after selecting DAGITOPUP_BOT.
8. The bot records orders and payment references; payment confirmation and Free Fire fulfillment are manual.
9. orders.json is prototype storage. For important real business use, move orders to persistent database/storage.
