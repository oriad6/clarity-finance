# 💸 Clarity — Personal Finance & Savings Tracker

An advanced full-stack application designed for students and professionals to track income, manage expenses, and automate savings goals with visual insights.

---

## 📸 Screenshots

| Dashboard Overview | Budget vs Actual |
| :---: | :---: |
| <img width="1901" height="1032" alt="dashboard" src="https://github.com/user-attachments/assets/458fea5e-7fef-4123-a2a5-8c233be86df8" />
 | <img width="1890" height="1026" alt="transactions" src="https://github.com/user-attachments/assets/e0588c20-223a-46d1-bc72-9c49a6a5f51b" />
 |

| Savings Goals | Assets Management |
| :---: | :---: |
| <img width="1917" height="1027" alt="goals" src="https://github.com/user-attachments/assets/e5769d19-2823-4e7d-a902-3724fe0bf2f6" />
 | <img width="1891" height="1026" alt="assets" src="https://github.com/user-attachments/assets/23dc593e-bdd6-490c-88c3-bc96911f621b" />
 |

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

* **Frontend:** React.js (Vite), Tailwind CSS.
* **Charts:** Recharts.
* **Backend & DB:** Supabase (PostgreSQL).
* **Security:** Row Level Security (RLS).
* **Deployment:** Vercel.
* **Development Tools:** Cursor, Claude Code.

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
