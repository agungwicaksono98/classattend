# Documentation Standards & Architecture

This directory serves as the **Single Source of Truth** for the entire product development lifecycle. In an Agentic Workflow, these documents are not just for humans—they are the context instructions for our AI Agents.

## 📂 Recommended Directory Structure

```bash
docs/
├── README.md                # (You are here) Guide to documentation
├── standards/               # Global Guidelines/Standards (User Rules)
│   ├── api/                 # API Guidelines (split by topic)
│   │   ├── api-versioning.md      # API Versioning Rules
│   │   ├── naming-convention.md   # URL Naming & HTTP Methods
│   │   ├── response-structure.md  # Standard Response Format
│   │   └── status-code.md         # HTTP Status Codes Usage
│   └── ui-guidelines.md     # (Planned) Visual Style Guide
├── product/                 # Product Specifications (PM Domain)
│   ├── app-structure.md     # App Structure
│   ├── user-flows.md        # Diagrams of core journeys
│   └── user-stories.md      # High-level stories not tied to specific features
├── templates/               # MASTER TEMPLATES (Copy the template to create new docs)
│   ├── API_INVENTORY_TEMPLATE.md
│   ├── API_SPEC_TEMPLATE.md
│   ├── APP_STRUCTURE_TEMPLATE.md
│   ├── DB_SCHEMA_TEMPLATE.md
│   ├── FEATURE_DESIGN_TEMPLATE.md
│   ├── PRD_TEMPLATE.md
│   ├── UI_GUIDELINES_TEMPLATE.md
│   ├── USER_FLOWS_TEMPLATE.md
│   └── USER_STORIES_TEMPLATE.md
├── features/
│   └── [feature-name]/          # Feature-Specific Documentation (Living Docs)
│   │   ├── api.md               # API spec for this feature
│   │   ├── design.md            # Specific UI specs for this feature
│   │   └── prd.md               # Specific requirements for this feature
│   │   └── test.md              # Test Plan for this feature
│   └── [feature-name]/
│       ...
└── tech/                    # Technical Implementation Details
    ├── api-inventory.md     # Master API List
    └── database-schema.md   # Master DB Schema
```

## 📝 Document Creation Guide

When a role starts a task, they should **COPY** the relevant template to the appropriate folder.

### 1. Product Manager (@product-management)
*   **To Define Product**: Copy `USER_STORIES_TEMPLATE.md` -> `docs/product/user-stories.md`.
*   **To Define Architecture**: Copy `APP_STRUCTURE_TEMPLATE.md` -> `docs/product/app-structure.md`.
*   **To Define Feature**: Copy `PRD_TEMPLATE.md` -> `docs/features/[feature-name]/prd.md`.

### 2. Frontend & Design (@ux-design)
*   **To Define Style**: Copy `UI_GUIDELINES_TEMPLATE.md` -> `docs/standards/ui-guidelines.md`.
*   **To Define Feature UI**: Copy `FEATURE_DESIGN_TEMPLATE.md` -> `docs/features/[feature-name]/design.md`.

### 3. Backend Developer (@backend-dev)
*   **To Define DB**: Copy `DB_SCHEMA_TEMPLATE.md` -> `docs/tech/database-schema.md`.
*   **To Define API List**: Copy `API_INVENTORY_TEMPLATE.md` -> `docs/tech/api-inventory.md`.

## 📝 Required Documentation by Role

Each role is responsible for maintaining specific documents to ensure the "Brain" (AI) has the correct context.

### 1. Product Manager (@product-management)
*   **Artifact**: `docs/features/[feature-name]/prd.md`
*   **Template**: `templates/PRD_TEMPLATE.md`
*   **Purpose**: Defines *what* to build and *why*. Contains Success Metrics and AI Feasibility checks.
*   **Critical For**: Backend Agent (logic), Frontend Agent (UI states).

### 2. Backend Developer (@backend-dev / @ai-engineering)
*   **Artifact**: `docs/tech/database-schema.md`, `docs/standards/api-spec.md`, `docs/tech/api-inventory.md` & `docs/features/[feature-name]/api.md`
*   **Template**: `templates/DB_SCHEMA_TEMPLATE.md` / `templates/API_INVENTORY_TEMPLATE.md` / `templates/API_SPEC_TEMPLATE.md`
*   **Purpose**: Defines the data contract.
*   **Critical For**: AI Engineering (Logic), Frontend Agent (Data binding).

### 3. Frontend & UX (@frontend-dev / @ux-design)
*   **Artifact**: `docs/design/design_system.md`, `docs/features/[feature-name]/design.md`
*   **Template**: `templates/DESIGN_SYSTEM_TEMPLATE.md`
*   **Purpose**: Defines visual uniformity and state handling (especially Streaming/Loading).
*   **Critical For**: Frontend Agent (CSS consistency).

### 4. QA & AI Engineer (@quality-assurance / @ai-engineering)
*   **Artifact**: `docs/features/[feature-name]/test.md` (feature-specific) or `docs/qa/test_plan.md` (global)
*   **Template**: `templates/TEST_PLAN_TEMPLATE.md`
*   **Purpose**: Defines *Done*. Contains the "Golden Dataset" to verify AI intelligence.
*   **Critical For**: All roles (Release Gate).

## 🚀 Workflow

1.  **PM** creates the PRD.
2.  **Backend** reads PRD -> creates API Spec.
3.  **Frontend** reads API Spec -> builds UI (mocked).
4.  **AI Engineer** reads DB Schema -> builds RAG pipeline.
5.  **QA** verifies against PRD Acceptance Criteria.
