# 🌸 BeautyOps AI

**The AI Workflow Engine for Beauty Account Executives**

BeautyOps AI is a production-ready intelligent assistant designed to streamline the daily workflow of Beauty Account Executives (AEs). It automates store visit reporting, POS analysis, training preparation, and more — helping field teams save hours each week while improving sell‑through and operational consistency.

---

## ✨ Key Features

- **📝 Store Visit → AI Report**: Transcribe voice notes into structured reports with action items and follow-up emails.
- **📊 POS Data → Sales Insights**: AI identifies top sellers, slow movers, shade gaps, and trends from POS spreadsheets.
- **🎓 Training & Education Generator**: Generate scripts, selling points, and quizzes for product launches.
- **📸 Content Creation Assistant**: Generate Instagram captions and TikTok scripts for events.
- **📅 Task Management**: AI-prioritized task engine for daily follow-ups.
- **💳 Tiered Monetization**: Built-in support for Solo, Pro, and Enterprise subscription tiers.

---

## 💰 Monetization & Business Model

BeautyOps AI utilizes a **Value-Aligned Hybrid Model**:

- **🟢 Solo AE ($49/mo)**: Unlimited visit reports, basic tasks, 10 POS analysis credits, and basic Calendar Sync.
- **🔵 Pro AE ($149/mo)**: Everything in Solo + Unlimited POS analysis, Training & Content generators, **Proactive AI Briefing Engine**, and Smart Calendar Time-Blocking.
- **💎 Enterprise (Custom)**: SSO, direct CRM/ERP/Calendar ecosystem integrations, **AI Vision Competitive Snapshot**, and custom-trained brand-voice LLMs.

---

## 🌎 Expansion Strategy

The BeautyOps engine is designed as a **Verticalized SaaS (vSaaS)** platform, ready to pivot into:
- **PharmaOps AI**: Focus on medical device training and clinical visit compliance.
- **ShelfOps AI**: Focus on CPG shelf audits and large-scale retail execution.
- **LuxuryOps AI**: Focus on high-end wholesale recap and content creation.

---

## 🧱 System Architecture

- **Frontend**: Next.js 16.1.1 with a premium, glassmorphic dark-themed UI.
- **Backend**: FastAPI + LangChain 1.2.0 for AI orchestration.
- **Database/Auth**: Supabase integration.
- **AI Layer**: OpenAI GPT-4o and Whisper for transcription.

---

## 🆕 Recent Updates (Dec 2025)

### LangChain 1.2.0 Migration
- Refactored AI chains to use `PydanticOutputParser` with Pydantic v2 models
- Updated imports to use `langchain_core` namespace
- Fixed dependency issues (`jsonpatch`, `python-multipart`)

### API Standardization
- All POST endpoints now use Pydantic models for request bodies
- Standardized frontend-backend communication with typed JSON contracts

### Dashboard Improvements
- All Quick Action buttons are now functional with proper navigation:
  - **Record Store Visit** → `/visits`
  - **Upload POS Data** → `/pos`
  - **Competitive Snapshot** → `/integrations`
  - **Open Strategic Brief** → `/visits`

---

## 🛠️ Getting Started

### Prerequisites

- [uv](https://github.com/astral-sh/uv) (for backend dependency management)
- Node.js 18+
- OpenAI API Key
- Supabase Project

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies and create a virtual environment:
   ```bash
   uv sync
   ```
3. Create a `.env` file based on the template:
   ```env
   OPENAI_API_KEY=your_key
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```
4. Run the API:
   ```bash
   uv run --link-mode=copy uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
BeautyOps AI/
├── backend/                # FastAPI Application
│   ├── chains/             # LangChain AI Orchestration (Pydantic v2)
│   ├── routers/            # API Endpoints with typed request models
│   ├── services/           # Business logic services
│   └── main.py             # Entry Point
└── frontend/               # Next.js 16 Application
    ├── app/                # App Router Pages
    │   ├── visits/         # Store Visit Intelligence
    │   ├── pos/            # POS Analysis
    │   ├── training/       # Training Generator
    │   ├── integrations/   # Ecosystem Integrations
    │   └── pricing/        # Plans & Billing
    └── globals.css         # Premium Design System
```

---

## 🚀 Deployment

The project is structured to be deployed on platforms like Vercel (frontend) and Render/Railway (backend).

**GitHub Repository**: [https://github.com/theotorku/BeautyOps.git](https://github.com/theotorku/BeautyOps.git)

---

## 📄 License

MIT License - See LICENSE file for details.
