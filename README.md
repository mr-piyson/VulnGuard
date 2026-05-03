<div align="center">

# TeachNLearn

**A modern, robust learning platform for seamless course management and student engagement.**

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white" /></a>
<a href="https://react.dev">
  <img src="https://img.shields.io/badge/React-232730?logo=react&logoColor=#58C4DC" />
</a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" /></a>
  <a href="https://prisma.io"><img src="https://img.shields.io/badge/Prisma-0C344B?logo=prisma&logoColor=white" /></a>
  <a href="https://trpc.io"><img src="https://img.shields.io/badge/tRPC-398CCB?logo=trpc&logoColor=white" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-ffffff?logo=tailwindcss&logoColor=#3FBFF8" /></a>
<a href="https://nextjs.org"><img src="https://img.shields.io/badge/Shadcn%2Fui-Radix-ffffff?style=plastic&labelColor=000000&logo=shadcnui" alt="Badge"></a>
  </a>
</p>

<img src="public/overview.png" alt="TeachNLearn Dashboard Overview" width="80%" style="border-radius: 8px; margin-top: 16px;" />

</div>

---

## ✨ Features

- **Admin Control** – Manage courses, modules, and users

- **Interactive Learning** – Structured lessons, modules, and assessments
- **Authentication System** – Secure sign-up and login flows
- **Student Dashboard** – Track progress and enrolled courses
- **Certificates & Milestones** – Automated progress tracking and achievements
- **Type-Safe Backend** – End-to-end type safety with tRPC + Prisma + TypeScript

---

## 🏗️ Architecture

The platform uses a **type-safe, full-stack architecture** connecting UI → API → Database seamlessly.

```mermaid
flowchart TD
  subgraph Client
    A[Browser / UI] -->|Next.js App Router| B[Components]
    B -->|tRPC Calls| C[tRPC Client]
  end

  subgraph Server
    C --> D[tRPC Router]
    D --> E[Procedures: auth, admin, courses, certificates]
    E --> F[Prisma Client]
  end

  subgraph Database
    F --> G[(SQLite / PostgreSQL)]
  end
```

---

## ⚡ Getting Started

### 📦 Prerequisites

- Node.js (recommended: latest LTS)
- SQLite or PostgreSQL database

---

### 🔧 Installation

1. **Clone & install dependencies**

```bash
npm install
```

2. **Setup environment variables**

```bash
cp .env.example .env
```

3. **Generate Prisma client**

```bash
npm run db:generate
```

4. **Run database migrations**

```bash
npm run db:migrate
```

5. **Start development server**

```bash
npm run dev
```

App will be running at:
👉 [http://localhost:5231](http://localhost:5231)

---

## 📁 Project Structure

```plaintext
📂 app/             # Next.js App Router routes and layouts
 ┣ 📂 auth/         # Authentication routes
 ┣ 📂 (auth)/admin/ # Admin-specific protected routes
📂 components/      # Reusable UI, admin panels, and auth forms
📂 lib/             # Utility functions, tRPC provider, auth/db helpers
📂 server/          # tRPC router registration and context
📂 prisma/          # Database schema and migrations
📂 public/          # Static assets and images
📂 scripts/         # SQL seed data and initialization helpers
```

---

## 🛠️ Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start dev server (Turbopack) |
| `npm run build`      | Build for production         |
| `npm run start`      | Start production server      |
| `npm run lint`       | Run ESLint                   |
| `npm run db:studio`  | Open Prisma Studio           |
| `npm run db:push`    | Push schema (no migrations)  |
| `npm run db:migrate` | Run migrations               |
