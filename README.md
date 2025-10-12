# 🌌 CosmoMeet: A Modern Video Conferencing Application

## 📖 Project Overview

CosmoMeet is a feature-rich video conferencing application developed to facilitate seamless and secure communication for professional teams. The platform is engineered with a contemporary, space-themed user interface and provides a robust environment for real-time collaboration.

---

## 📚 Table of Contents

- ✨ [Key Features](#-key-features)  
- 🛠️ [Technology Stack](#-technology-stack)  
- 🚀 [Getting Started](#-getting-started)  
- ▶️ [Running the Application](#️-running-the-application)  
- 🌐 [Application URLs](#-application-urls)  
- 🧾 [License](#-license)  
- 🙌 [Support](#-support)

---

## ✨ Key Features

The application incorporates a suite of advanced functionalities designed to enhance the virtual meeting experience:

- 🔐 **Secure Authentication**  
  Implements a robust JWT-based system for secure registration, login, and session management.

- 📹 **High-Quality Video Conferencing**  
  Enables seamless meetings with high-fidelity video and audio powered by the ZegoCloud SDK.

- 🔴 **Meeting Recording & Management**  
  Hosts can record meetings which are then uploaded to Cloudinary. Users can access, review, and delete recordings via the "My Recordings" page.

- 🗂️ **Meeting History**  
  The "My Meetings" page provides a complete history of meetings hosted or attended, with elegant pagination.

- ↪️ **Rejoin Capability**  
  Users can rejoin active meetings directly from their meeting history.

- 🚪 **Pre-Join Lobby**  
  A preparatory screen lets users test camera and microphone settings before joining.

- 🤝 **Support Page**  
  A static page includes official contact links (GitHub, LinkedIn, email) for user support and feedback.

---

## 🛠️ Technology Stack

CosmoMeet is built using the **MERN** stack and other modern technologies:

| Category          | Technology                                      |
|------------------|--------------------------------------------------|
| **Frontend**      | React, React Router, Axios, Tailwind CSS         |
| **Backend**       | Node.js, Express.js                              |
| **Database**      | MongoDB with Mongoose                            |
| **Authentication**| JSON Web Tokens (JWT) with HTTP-Only Cookies     |
| **Video Platform**| ZegoCloud UI Kit                                 |
| **File Storage**  | Cloudinary                                       |

---

## 🚀 Getting Started

This guide helps you set up a local instance of CosmoMeet for development and testing.

### ✅ System Prerequisites

Ensure the following are installed on your machine:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) (for `mongorestore`)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/kuldeepsinh2005/project.git
cd project
```

### 2️⃣ Backend Configuration

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Then, fill in the required environment variables with your credentials.

---

### 3️⃣ Frontend Configuration

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Then add your **ZegoCloud credentials** to the file.

---

### 4️⃣ Database Initialization

From the **root** of the project directory, run the following command:

```bash
mongorestore --uri="your_mongodb_connection_string" --db test ./db-backup/test
```

> ⚠️ **Important:** Replace `"your_mongodb_connection_string"` with the actual connection URI found in your `backend/.env` file.
> The database name must be `test` to correctly match the backup folder.

---

## ▶️ Running the Application

To run both backend and frontend concurrently:

### 🧪 Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

### 🖥️ Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

---

## 🌐 Application URLs

* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **Frontend UI:** [http://localhost:5173](http://localhost:5173)

---

## 🧾 License

This project is intended for **educational and demonstration purposes only**.

---

## 🙌 Support

For questions, suggestions, or technical support, feel free to reach out via:

* 📂 [GitHub Issues](https://github.com/kuldeepsinh2005/project/issues)
* 💼 [LinkedIn](https://www.linkedin.com/in/kuldeepsinh-dabhi-b78a36330/)
* 📧 Email: `kuldeepsinh2005kad@gmail.com`

