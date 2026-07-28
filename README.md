# 🚀 Project Management System

A modern full-stack **Project Management System** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**. The application enables teams to collaborate efficiently by managing projects, assigning tasks, tracking progress, and communicating in real time through an intuitive and responsive interface.

---

## 📸 Screenshots

> Add screenshots of your application here.

| Dashboard | Project Details |
|-----------|-----------------|
| ![Dashboard](screenshots/dashboard.png) | ![Project](screenshots/project.png) |

---

# ✨ Features

## 🔐 Authentication & Authorization
- Secure JWT Authentication
- User Registration & Login
- Protected Routes
- Role-Based Access Control (Admin & Members)

## 📁 Project Management
- Create, Update, and Delete Projects
- Invite Team Members
- Manage Project Information
- Project Ownership

## ✅ Task Management
- Create Tasks
- Edit & Delete Tasks
- Assign Tasks to Team Members
- Task Priority (Low, Medium, High)
- Task Status (Todo, In Progress, Completed)
- Due Date Management

## 👥 Team Collaboration
- Invite Members to Projects
- Manage Team Members
- Real-time Notifications
- Activity Tracking

## 📊 Dashboard
- Project Statistics
- Task Progress Overview
- Pending vs Completed Tasks
- Recent Activities

## 🔔 Notifications
- Project Invitations
- Task Assignment Notifications
- Status Update Notifications

## 🎨 UI Features
- Responsive Design
- Clean Dashboard
- Loading Indicators
- Form Validation
- Mobile Friendly

---

# 🛠 Tech Stack

### Frontend
- React.js
- Redux Toolkit
- React Router DOM
- Axios
- Ant Design
- CSS3

### Backend
- Node.js
- Express.js
- JWT Authentication
- Bcrypt.js
- Multer

### Database
- MongoDB
- Mongoose

### Cloud Storage
- Cloudinary

---

# 📂 Folder Structure

```
ProjectManagement
│
├── client
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── redux
│   │   ├── apicalls
│   │   └── utils
│
├── server
│   ├── config
│   ├── middlewares
│   ├── models
│   ├── routes
│   └── server.js
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/purushotham-07/Project-Management.git
```

Move into the project directory:

```bash
cd Project-Management
```

---

## Install Backend

```bash
cd server
npm install
```

---

## Install Frontend

```bash
cd ../client
npm install
```

---

## Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Run Backend

```bash
cd server
npm run dev
```

---

## Run Frontend

```bash
cd client
npm start
```

The application will run at:

```
Frontend : http://localhost:3000
Backend  : http://localhost:5000
```

---

# 📌 Future Enhancements

- Kanban Board
- File Attachments
- Comments on Tasks
- Email Notifications
- Calendar View
- Project Timeline
- Advanced Search & Filters
- Export Reports (PDF/Excel)
- Dark Mode

---

# 🤝 Contributing

Contributions are welcome!

1. Fork this repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Developer

**Purushotham Reddy**

- GitHub: https://github.com/purushotham-07
- LinkedIn: https://www.linkedin.com/in/purushotham-reddy-4b94b2355

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.
