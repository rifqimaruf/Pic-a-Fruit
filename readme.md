
# 🍓 Pic a Fruit

**Pic a Fruit** is a cross-platform mobile application built with **React Native** that uses **Deep Learning** to detect the ripeness level of fruits from images. This project consists of two main components, **Frontend: React Native + Expo**, **Backend: FastAPI + Deep Learning Model**


## 🛠️ Installation & Setup

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone [https://github.com/your-username/your-project-repo.git](https://github.com/rifqimaruf/Pic-a-Fruit.git)
cd your-project-repo
```

### 2. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # For Windows
# source venv/bin/activate  # For Linux/MacOS

pip install -r requirements.txt
python main.py
```

🔗 By default, the backend runs on `http://127.0.0.1:8000`.
You can access the API documentation at:
➡️ `http://127.0.0.1:8000/docs`

### 3. Frontend Setup (React Native + Expo)

```bash
cd ../frontend
npm install
npx expo start
```

📱 You can run the app using the **Expo Go App** on Android/iOS by scanning the QR code displayed in the terminal or browser.


## 📂 Project Structure

```
project-root/
│
├── backend/         # FastAPI backend + deep learning model (.h5)
│   ├── model/       # Contains trained model files
│   ├── routes/      # API route definitions
│   └── main.py      # Entry point for FastAPI app
│
└── frontend/        # React Native + Expo frontend
    ├── assets/      # Images and static files
    ├── components/  # Reusable React Native components
    └── App.js       # Main application file
```
