content = """# 💸 Clarity — Personal Finance & Savings Tracker

An advanced full-stack application designed for students and professionals to track income, manage expenses, and automate savings goals with visual insights.

---

## 🌐 Live Demo
**Access the application here:** 👉 [https://clarity-finance.vercel.app](https://clarity-finance.vercel.app)

---

## 🌟 Key Features

* **Financial Dashboard:** High-level overview of total balance, monthly income, and expenses.
* **Automated Savings Engine:** Smart logic to calculate and allocate savings based on user-defined targets.
* **Visual Analytics:** Interactive **Donut Charts** (via Recharts) for category-based expense distribution.
* **Multi-Currency & RTL Support:** Fully responsive UI with native **Hebrew (RTL)** and English support.
* **Secure Authentication:** User management powered by **Supabase Auth**.
* **Data Export:** Export financial reports directly to **Excel** for deep analysis.
* **Persistence:** Real-time data sync and storage with **PostgreSQL**.

---

## 🛠 Tech Stack

* **Frontend:** [React.js](https://reactjs.org/) (Vite), [Tailwind CSS](https://tailwindcss.com/).
* **Charts:** [Recharts](https://recharts.org/).
* **Backend & DB:** [Supabase](https://supabase.com/) (PostgreSQL).
* **Security:** [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security).
* **Deployment:** [Vercel](https://vercel.com/).
* **Development Tools:** [Cursor](https://cursor.com/), [Claude Code](https://claude.ai/).

---

## 🏗 System Architecture & Security

This project was built with a focus on **Security** and **Scalability**:
* **Row Level Security (RLS):** Every database query is restricted at the engine level, ensuring users can only access their own data.
* **AI-Augmented Development:** Built using AI-native workflows (Cursor/Claude) for rapid prototyping and architectural validation.
* **Environment Safety:** Sensitive API keys are managed via environment variables (Vercel/`.env`).

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Supabase Account

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/clarity-finance.git](https://github.com/YOUR_USERNAME/clarity-finance.git)
   cd clarity-finance
