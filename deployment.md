# KhetSetu Deployment Guide

This guide provides instructions for deploying the KhetSetu platform to production environments.

## Prerequisites
- A [GitHub](https://github.com) account.
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (for the cloud database).
- A [Render](https://render.com) account (for the backend).
- A [Vercel](https://vercel.com) account (for the frontend).

---

## 1. Database Setup (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas.
2. Under "Network Access", allow access from anywhere (`0.0.0.0/0`) or specific IP addresses if you have a static IP for your backend.
3. Under "Database Access", create a user with read/write permissions.
4. Copy the connection string (SRV) for your cluster. It will look like: 
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/khetsetu?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render)
1. Push your code to a GitHub repository.
2. Log in to Render and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Name**: `khetsetu-backend`
   - **Environment**: `Docker` (Render will automatically detect the `Dockerfile` in the `backend` folder).
   - **Root Directory**: `backend`
5. Add the following **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A long, random string*
   - `JWT_REFRESH_SECRET`: *Another long, random string*
   - `FRONTEND_URL`: *The URL of your deployed frontend (you'll update this after deploying the frontend)*
6. Click **Create Web Service**. Render will build and deploy your backend.
7. Note down the backend URL (e.g., `https://khetsetu-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)
1. Log in to Vercel and click **Add New** > **Project**.
2. Connect your GitHub repository.
3. Set the following configurations:
   - **Project Name**: `khetsetu`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Add the following **Environment Variables**:
   - `VITE_API_URL`: *The URL of your deployed backend followed by `/api`* (e.g., `https://khetsetu-backend.onrender.com/api`)
5. Click **Deploy**. Vercel will build and host your frontend.
6. Note down your frontend URL (e.g., `https://khetsetu.vercel.app`).

---

## 4. Final Connection
1. Go back to your **Render** dashboard for the `khetsetu-backend` service.
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL.
3. Render will redeploy automatically.

---

## Verification
- Visit your Vercel URL.
- Try to sign up or log in.
- Verify that features like job posting and chat (which use Socket.io) are working correctly across the deployed environment.
