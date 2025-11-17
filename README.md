# AI_BadgerChat

AI-Powered Chatbot Web App

---

## 🚀 Project Overview

**AI_BadgerChat** is a web-based chatbot application that leverages AI to enable natural, context-aware conversation. It integrates a front-end chat interface with a backend that supports authentication, intent recognition, and dynamic responses — making it easy for users to chat, and for developers to extend. Main outcome goal is to integrated features within existing frontend architecture without altering the structure.


---

## 🔍 Features

- Web-based chat UI with a clean, responsive design  
- User authentication (sign in / sign up)  
- Intent detection via an AI/NLP model. Example: JWS authentication, HTTP request to view chatrooms and post/delete in chatrooms (depending on user sign in status), and user chat app assistance.
- Backend API for managing chatrooms, messages, and user sessions  
- Emoji feedback for user engagement  
- Real-time conversation handling  

---

## 🧰 Tech Stack

- **Frontend:** JavaScript, HTML, CSS, Vite  
- **Backend:** (you didn’t specify, but mention whatever you used — e.g., Node.js / Express, Python / Flask)  
- **AI / NLP:** (e.g., Wit.AI, OpenAI, or whatever you used)  
- **Authentication:** JWT or other method (depending on your implementation)  
- **Deployment:** (if applicable — e.g., Vercel, Netlify, Heroku)

---

---

# ⚙️ Installation & Setup Instructions (Frontend)

Clone and run the **frontend** locally.

---

## **1️⃣ Clone the Repository**

```bash
git clone https://github.com/JuanEulogio/AI_BadgerChat.git
cd AI_BadgerChat
```

2️⃣ Install Dependencies
```bash
npm install
```
or
```bash
yarn install
```

3️⃣ Create a .env File
Create a .env file in the project root.
Example values:
```bash
VITE_BACKEND_URL=http://localhost:5000
VITE_WIT_AI_TOKEN=your_witai_api_key
VITE_AUTH_SECRET=your_jwt_secret
```
These must match the backend as well.


4️⃣ Start the Frontend
```bash
npm run dev
```

Vite will usually run at:
```bash
http://localhost:5173
```

🖥 Backend Setup (General Guidance)
This repository doesn't contain the hosted backend code.
Refer to the API_DOCUMENTATION.md to integrate your own version.

🎉 Usage
Once the frontend is running:

📖 API Documentation
See API_DOCUMENTATION.md for:
- Auth endpoints
- Chatroom endpoints
- Message endpoints
- AI intent handling
- Request/response examples


📫 Contact
Created by Juan Eulogio
LinkedIn: https://www.linkedin.com/in/jceulogio/
