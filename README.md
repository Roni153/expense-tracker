# Roommate Expense Tracker

A full-stack web app for roommates to track and split grocery/household expenses.

## Features
- Email/password authentication
- Shared group expense tracking
- Member management (add/edit/photo)
- Item master list
- Add expenses (equal or custom splits)
- Dashboard with pie chart (Recharts)
- Balance calculations + settlement suggestions

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Photos: base64 stored in DB

## Local Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env  # Add your MONGO_URI, JWT_SECRET
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
