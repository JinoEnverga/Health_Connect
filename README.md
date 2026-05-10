# 🏥 HealthConnect — Patient Portal

A fully functional telemedicine web app built with **React + Vite + TailwindCSS**. Runs 100% offline with mock data — perfect for thesis demos.

---

## ⚡ Quick Setup (5 minutes)

### Step 1 — Prerequisites
Make sure you have **Node.js 18+** installed.  
Download: https://nodejs.org

### Step 2 — Place the project folder
Copy the `healthconnect-patient-portal` folder to your Desktop (or anywhere).

### Step 3 — Install dependencies
Open a terminal inside the project folder and run:
```bash
npm install
```

### Step 4 — Start the development server
```bash
npm run dev
```

### Step 5 — Open in browser
Visit: **http://localhost:5173**

---

## 🔑 Demo Login
Pre-filled on the login screen — just click **Sign In**:
- **Email:** demo@healthconnect.ph  
- **Password:** password123

---

## 📁 Folder Structure

```
healthconnect-patient-portal/
├── index.html                  ← App entry point
├── vite.config.js              ← Vite configuration
├── tailwind.config.js          ← Tailwind CSS configuration
├── postcss.config.js           ← PostCSS configuration
├── package.json                ← Dependencies
└── src/
    ├── main.jsx                ← React DOM render
    ├── App.jsx                 ← Router + providers
    ├── index.css               ← Global styles + Tailwind
    ├── context/
    │   ├── AuthContext.jsx     ← Login/logout state
    │   └── AppointmentContext.jsx  ← Appointments state
    ├── components/
    │   ├── Layout.jsx          ← Sidebar + header navigation
    │   └── ProtectedRoute.jsx  ← Auth guard
    ├── data/
    │   └── mockData.js         ← All demo data (doctors, patient, appointments)
    └── pages/
        ├── Login.jsx           ← Patient login
        ├── Register.jsx        ← New patient registration
        ├── Dashboard.jsx       ← Overview + quick actions
        ├── FindDoctors.jsx     ← Doctor search & browse
        ├── BookAppointment.jsx ← Schedule appointments
        ├── MyAppointments.jsx  ← View, track, cancel appointments
        ├── Teleconsultation.jsx ← Video call + chat UI
        └── Profile.jsx        ← Patient info + medical history
```

---

## 🌟 Features

| Page | Description |
|------|-------------|
| **Login** | Email + password form with demo hint |
| **Register** | Full registration with password strength meter |
| **Dashboard** | Stats, upcoming appointments, quick actions |
| **Find Doctors** | 8 mock doctors, search + specialization filter |
| **Book Appointment** | Doctor picker, date/time slots, notes |
| **My Appointments** | Tab filter (All/Upcoming/Completed/Cancelled), cancel modal |
| **Teleconsultation** | Video call placeholder, live chat with doctor replies |
| **Profile** | Personal info, medical history, edit mode |

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool
- **React Router 6** — Navigation
- **TailwindCSS 3** — Styling
- **React Icons** — Icon library
- **Axios** — HTTP client (ready for real API integration)

---

## 🎓 Thesis Defense Tips

1. Start at **Login page** → click Sign In  
2. Show **Dashboard** → point out stats and upcoming appointments  
3. Go to **Find Doctors** → demonstrate search filter  
4. Book an appointment → show confirmation flow  
5. Go to **Teleconsultation** → click "Start Call", send a chat message  
6. Show **Profile** → click Edit, modify a field, Save  

---

*Built for HealthConnect Thesis — Patient Portal v1.0*
