# 💸 Clarity — Personal Finance & Savings Tracker

An advanced full-stack application designed for students and professionals to track income, manage expenses, and automate savings goals with visual insights.

---

## 📸 Screenshots

| Dashboard Overview | Budget vs Actual |
| :---: | :---: |
| ![Dashboard](https://github.com/user-attachments/assets/dd7cede4-0bbe-4fd1-8118-134ea6309d89) | ![Transactions](https://github.com/user-attachments/assets/c8b186e8-32a6-4685-b785-d9e5f7abe776) |

| Savings Goals | Assets Management |
| :---: | :---: |
| ![Goals](https://github.com/user-attachments/assets/3125111c-e954-46fd-9f43-1bf72e733930) | ![Assets](https://github.com/user-attachments/assets/2ea536be-3eb6-41df-aa80-ac6c683c547b) |

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
