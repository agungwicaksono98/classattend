# Agentic Documentation Starter Kit 🚀

Welcome to the **Agentic Development** baseline. This repository provides a pre-configured environment designed for **AI-Assisted Software Development** using the Antigravity (or similar) agentic framework.

It turns your AI assistant from a "Chatbot" into a "Virtual Team" by enforcing **Documentation Standards**, **Role-Based Skills**, and **Strict Workflows**.

---

## 📂 Repository Structure

```bash
.
├── .agent/                  # 🧠 The Brain
│   ├── skills/              # Specialized Personas (PM, Backend, QA, etc.)
│   ├── rules/               # Global Governance (e.g., "Doc First")
│   └── workflows/           # Orchestration Scripts (e.g., Feature Dev)
├── docs/                    # 📚 The Knowledge Base
│   ├── standards/           # Active Guidelines (API, UI)
│   ├── templates/           # Master Templates (Copy these!)
│   ├── product/             # Epics & Sitemap
│   └── tech/                # DB Schema & API Inventory
└── README.md                # (You are here)
```

## 🤖 The Virtual Team (Roles)

We have pre-configured 6 specialized Agent Skills in `.agent/skills/`. Each role knows:
1.  **What they do** (Responsibilities).
2.  **How they do it** (SOPs).
3.  **What documents they own** (Templates).

| Role | Handle | Focus | Key Documents |
| :--- | :--- | :--- | :--- |
| **Product Manager** | `@product-management` | Requirements, Roadmap | `user-stories.md`, `prd.md` |
| **Backend Dev** | `@backend-dev` | API, Database, Logic | `database-schema.md`, `api.md` |
| **Frontend Dev** | `@frontend-dev` | UI Components, State | `app-structure.md`, `design.md` |
| **UX Designer** | `@ux-design` | Visuals, Flows | `ui-guidelines.md`, `design.md` |
| **AI Engineer** | `@ai-engineering` | Prompts, RAG, Models | `prd.md` (AI Section) |
| **QA Engineer** | `@quality-assurance` | Testing, Safety | `test_plan.md` |

## 📜 Core Philosophy: Documentation First

This starter kit enforces a simple rule: **"No Code without Spec"**.

1.  **Before coding a feature**, the PM must create a `PRD`.
2.  **Before building an API**, the Backend Dev must define the `Schema`.
3.  **Before styling a page**, the UX Designer must define the `Wireflow`.

This ensures that Agents don't "hallucinate" implementations but follow a strict plan.

## 🚀 Getting Started

### 1. Initialize Global Standards
*   [ ] Copy `docs/templates/UI_GUIDELINES_TEMPLATE.md` -> `docs/standards/ui-guidelines.md`.
*   [ ] Copy `docs/templates/API_INVENTORY_TEMPLATE.md` -> `docs/tech/api-inventory.md`.

### 2. Start a New Feature
Run the **Feature Development Workflow** strategy:

1.  **Define**: Ask `@product-management` to "Draft PRD for [Feature Name]".
2.  **Design**: Ask `@ux-design` to "Create wireflow for [Feature Name]".
3.  **Spec**: Ask `@backend-dev` to "Draft API Spec for [Feature Name]".
4.  **Build**: Ask Agents to implement based on the docs above.
5.  **Test**: Ask `@quality-assurance` to "Create Test Plan".

## 🛠 Included Workflows

- **`/feature-development`**: End-to-end orchestration from Idea to Code.
- **`/bug-fix`**: Standardized triage and resolution process.