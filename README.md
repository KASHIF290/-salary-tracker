# 💰 Salary Tracker — Personal Finance Manager

> A premium personal finance web app built for salaried individuals. Track every rupee, plan every goal, and stay in control of your money — all from your browser, with zero data leaving your device.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-salary--tracker--azure.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://salary-tracker-azure.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-2-FF6384?style=flat-square)](https://recharts.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## ✨ Features

- **📊 Dashboard** — Salary cycle progress, daily budget calculator, payday countdown, no-spend streak
- **💸 Expense Tracking** — Quick-add with 11 categories + custom categories, cash/digital tags, recurring expenses
- **📈 Budget Planner** — Per-category limits, 50/30/20 rule auto-split, over-budget warnings
- **🎯 Savings Goals** — Visual progress bars, monthly contribution tracker, emergency fund calculator
- **📉 Reports** — Pie chart, 6-month bar chart, spending heatmap calendar, AI-style insight cards
- **🏦 EMI Tracker** — Loan management, interest tracking, salary burden percentage
- **📱 Subscriptions** — Renewal alerts, monthly burn calculation, unused flag
- **🤝 Split Expenses** — Track who owes whom, one-tap settle
- **🔒 PIN Lock** — 4-digit app lock stored locally
- **🌙 Dark / Light Mode** — Respects device default, manually overridable
- **💾 Local-First** — All data in localStorage, JSON export/import backup, CSV export

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/KASHIF290/salary-tracker.git
cd salary-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Folder Structure

```
salary-tracker/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── src/
│   ├── hooks/
│   │   └── useLocalStorage.js    # Persistent state hook
│   ├── utils/
│   │   └── format.js             # Currency, date, and cycle utilities
│   ├── App.jsx                   # Main app with all screens
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Tailwind base styles
├── index.html                    # SEO-optimised HTML shell
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🔐 Data & Privacy

**All your data lives entirely on your own device.** There is no backend, no database, no analytics, and no data is ever transmitted to any server. Your salary figures and expenses are stored in your browser's `localStorage` only. Use the **Export Backup** feature in Settings to download a JSON copy of your data.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Recharts 2 | Charts (pie, bar) |
| localStorage | Client-side data persistence |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/KASHIF290/salary-tracker/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<p align="center">Made with ❤️ by <a href="https://github.com/KASHIF290">KASHIF</a></p>
