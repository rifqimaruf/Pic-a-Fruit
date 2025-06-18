# 🍓 Pic a Fruit

**Pic a Fruit** adalah aplikasi mobile **cross-platform** berbasis **React Native** yang menggunakan **Deep Learning** untuk mendeteksi **tingkat kematangan buah** melalui gambar. Proyek ini terdiri dari dua komponen utama: **Frontend (React Native + Expo)** dan **Backend (FastAPI + Deep Learning model)**.


## 🛠️ Instalasi & Setup

### 1. Clone Repositori

```bash
git clone https://github.com/your-username/your-project-repo.git
cd your-project-repo
```

### 2. Setup Backend (FastAPI)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate         

pip install -r requirements.txt
python main.py
```

> 🔗 Secara default, backend berjalan di `http://127.0.0.1:8000`. Anda dapat mengakses dokumentasi API di `http://127.0.0.1:8000/docs`.


### 3. Setup Frontend (React Native + Expo)

```bash
cd ../frontend
npm install
npx expo start
```

> 📱 Aplikasi dapat dijalankan menggunakan **Expo Go App** di Android/iOS dengan memindai QR code yang ditampilkan di terminal atau browser.


## 📂 Struktur Proyek

```
project-root/
│
├── backend/         # FastAPI backend + model deep learning (.h5)
│   ├── model/
│   ├── routes/
│   └── main.py
│
└── frontend/        # React Native + Expo frontend
    ├── assets/
    ├── components/
    └── App.js
```
