# Resume Details — Project Management System

**Project:** Project Management System
**Repo:** https://github.com/purushotham-07/Project-Management
**Role:** Full-Stack Engineer (MERN)
**Type:** Individual full-stack web application

---

## 🛠 Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React.js 18, Redux Toolkit, React Router DOM 6, Axios, Ant Design, Tailwind CSS, React Big Calendar, Recharts |
| **Backend** | Node.js, Express.js, JWT, Bcrypt.js, Multer, Cloudinary |
| **Database** | MongoDB, Mongoose |
| **Cloud & Deployment** | Render (backend), Vercel (frontend), Cloudinary (file storage) |
| **Other** | CORS, dotenv, Nodemon, Git |

---

## 🔑 Key Features & Implementations

### 1. Authentication & Authorization
- **JWT-based stateless authentication** with Bcrypt password hashing
- Custom `authMiddleware` verifying JWT tokens on every protected request
- Protected route wrapper in React preventing access without a valid session token; auto-redirects to login on expiry
- **Role-Based Access Control (RBAC)** via custom `roleMiddleware` — users get roles **Owner / Admin / Employee** per project; middleware validates membership and role before permitting destructive actions (HTTP 403)

### 2. Project Management
- Full CRUD for projects with a rich schema: name, description, tags, tech stack, status (Planning/Active/On Hold/Completed), visibility (Public/Private), deadline, cover image, owner, and embedded team-member sub-documents with roles

### 3. Task Management
- Create, edit, delete tasks linked to projects; assign to team members
- Priority levels: Low, Medium, High, Urgent
- Status workflow: To Do → In Progress → Done
- **Drag-and-drop Kanban board** (HTML5 Drag API) with role-aware permissions — employees can only move their own tasks, owners/admins can move any

### 4. Team Collaboration
- Join request workflow with pending/approved/rejected states (with `respondedBy`/`respondedAt` tracking)
- Real-time **push notifications** (invitations, task assignments, status updates) with unread-count badges
- **Activity logging** — all project actions logged (task created, member joined, etc.)
- Task-level **comments** system
- Discover page for browsing public projects

### 5. Analytics & Dashboard
- Recharts pie/bar charts for project stats, task breakdown, priority distribution, completion rates, overdue/due-this-week counts, and per-member workload
- Aggregations using Mongoose `$or` queries and `populate()` across User, Project, and Task collections

### 6. Calendar Integration
- Interactive calendar (React Big Calendar) rendering tasks as color-coded priority events with project filtering

### 7. UI/UX
- Fully responsive design (mobile/first) with Tailwind CSS
- Light/dark mode toggle with localStorage persistence
- Global loading spinner via Redux state management
- Form validation + Ant Design components

---

## API Endpoints (8 REST modules)

| Module | Route | Operations |
|---|---|---|
| Users | `/api/users` | Register, Login, Get/Update Profile |
| Projects | `/api/projects` | CRUD, fetch-by-role, share/invite |
| Tasks | `/api/tasks` | CRUD, assign, update status/priority |
| Notifications | `/api/notifications` | Read/unread, mark all read |
| Comments | `/api/comments` | Add/read task comments |
| Activity Logs | `/api/activity-logs` | Log/retrieve activity history |
| Join Requests | `/api/join-requests` | Request/approve/reject join |
| Analytics | `/api/analytics` | Dashboard statistics |

---

## 📁 File Structure
```
ProjectManagement/
├── client/                     # React frontend (Vercel)
│   ├── src/
│   │   ├── apicalls/           # Axios API wrappers
│   │   ├── components/         # Notifications, Comments, Spinner, ProtectedPage
│   │   ├── pages/              # Home, Dashboard, Calendar, ProjectInfo (Kanban/Members/Tasks), Discover, Profile
│   │   └── redux/              # Redux Toolkit slices (users, loaders)
│   └── vercel.json             # SPA rewrite fallback
├── server/                     # Express backend (Render)
│   ├── config/                 # dbConfig, cloudinaryConfig, emailConfig
│   ├── middlewares/            # authMiddleware, roleMiddleware
│   ├── models/                 # 6 Mongoose schemas
│   ├── routes/                 # 8 route modules
│   ├── render.yaml             # Render deployment spec
│   └── server.js               # Entry: health check, global error handler, graceful shutdown
├── README.md
└── package.json
```

---

## 🎯 Resume Bullet Points (Copy-Paste Ready)

- **Built a full-stack project management web application** using MongoDB, Express.js, React.js, and Node.js, with 8 RESTful API modules (80+ endpoints) consumed by a responsive React frontend deployed on Vercel.
- **Implemented JWT-based authentication** with Bcrypt password hashing and a custom `authMiddleware` that verifies tokens on every protected request with graceful session-expiry handling.
- **Designed a role-based authorization system** (`roleMiddleware`) enforcing per-project Owner/Admin/Employee permissions by querying MongoDB to validate membership and role before allowing destructive operations.
- **Developed a drag-and-drop Kanban board** using the HTML5 Drag API with role-aware drag permissions — employees can only move their own tasks while owners/admins can move any task.
- **Engineered a data analytics dashboard** with Recharts, computing project/task statistics, priority distributions, overdue/due-this-week counts, and per-member workload via Mongoose `$or` and `populate()` aggregations.
- **Modeled 6 MongoDB schemas** (User, Project, Task, Comment, ActivityLog, JoinRequest) with `ObjectId` references, embedded sub-documents, and enums for status/priority.
- **Integrated Cloudinary** for image uploads via Multer middleware and configured CORS with dynamic origin validation for cross-origin deployment (Vercel + Render).
- **Orchestrated deployment** on Render (backend with `render.yaml`, health checks, graceful `SIGTERM`/`SIGINT` shutdown) and Vercel (frontend SPA rewrite fallback), with environment management via `.env` across multiple environments.
