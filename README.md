# 🌾 KhetSetu (खेतसेतु)

> **Connecting Farmers with Agricultural Workers** — A mobile-first, bilingual (Hindi/English) platform for rural India.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, Framer Motion, i18next |
| Backend | Node.js, Express 4, Socket.io, Mongoose |
| Database | MongoDB (Atlas) |
| Auth | Phone OTP + JWT (Access + Refresh tokens) |
| Deploy | Vercel (frontend) + Railway (backend) |

## 📋 Features

- 📱 **Mobile-first** responsive UI (375px base)
- 🌐 **Bilingual** Hindi / English toggle
- 🔐 **Phone OTP** authentication (+91)
- 📍 **Location-based** job matching (< 50km radius)
- 💬 **Real-time chat** via Socket.io
- 💰 **UPI payments** + cash receipts
- ⭐ **Ratings & reviews** system
- 🌙 **Dark/Light** theme toggle
- 🔔 **Real-time notifications** for applications

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, etc.
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (Backend)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `TWILIO_ACCOUNT_SID` | Twilio SID (optional in dev) |
| `TWILIO_AUTH_TOKEN` | Twilio token (optional in dev) |
| `TWILIO_PHONE` | Twilio phone number |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NODE_ENV` | `development` or `production` |

> **Dev Mode**: OTP is always `123456` when `NODE_ENV=development`

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```
Set env: `VITE_API_URL=https://your-railway-backend.up.railway.app/api`

### Backend → Railway
1. Connect your GitHub repo
2. Set root directory to `backend`
3. Add all environment variables
4. Deploy!

## 📁 Project Structure
```
khetsetu/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── i18n.js
│   └── ...
├── backend/           # Express + MongoDB
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
└── README.md
```

## 🌾 Agricultural Categories
| Hindi | English |
|-------|---------|
| बुवाई | Sowing |
| कटाई | Harvesting |
| निराई | Weeding |
| गुड़ाई | Hoeing |
| सिंचाई | Irrigation |
| छिड़काव | Spraying |
| जुताई | Plowing |
| अन्य | Other |

## 📄 License
MIT
