
# 🍓 Pic a Fruit

**Pic a Fruit** is a cross-platform mobile application built with **React Native** that uses **Deep Learning** to detect the ripeness level of fruits from images. This project consists of two main components, **Frontend: React Native + Expo**, **Backend: FastAPI + Deep Learning Model**


## 🛠️ Installation & Setup

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/rifqimaruf/Pic-a-Fruit.git
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

## 📱Application Interface Overview

Here are the screenshots of the main pages in Pic a Fruit, an Android-based application for detecting the ripeness level of fruits.

### 1. 🏠 Dashboard Screen
The Dashboard Screen  serves as the main hub of the Pic a Fruit application. From here, users can:

- View a welcome message and connection status to the AI server

- Read fruit ripeness tips (e.g., how to identify a ripe banana)

- See their latest scan results with fruit names, ripeness status, and scan dates

- Access a quick button to start scanning new fruits

- Read important tips for accurate scanning

### 2. 🍎 Scan Fruit Screen
On this screen, users are prompted to choose a method to scan a fruit. PixiePulse provides two scanning options:

- Take a Photo – Open the camera and capture an image of the fruit directly.

- Choose from Gallery – Select an existing image from the device gallery for analysis.

This screen ensures that users have flexibility in how they provide input to the AI detection engine.

### 3. ✅ Result Screen
The Result Screen displays the AI’s analysis of the fruit’s ripeness level. After scanning, users are shown:

- A clear label indicating the fruit’s condition (e.g., Rotten, Unripe, Ripe)

- The fruit name and a short advisory message

- AI Confidence Level (%) with a visual bar

- Scan Date and the AI classification result

- This screen ensures users can make informed decisions based on the AI's detection outcome.
