# Marvin Hub - Render Deployment Guide

## Step 1: Push to GitHub

```bash
cd /home/haden/marvin-hub
git init
git add .
git commit -m "Initial Marvin Hub"
gh repo create marvin-hub --public --source=. --push
```

## Step 2: Create Render Web Service

1. Go to: https://render.com
2. Sign in with GitHub
3. Click: **New +** → **Web Service**
4. Configure:
   - **Name:** marvin-hub
   - **Root Directory:** marvin-hub
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

## Step 3: Environment Variables

In Render dashboard, add:
```
PORT=10000
```

## Step 4: Deploy

Click **Create Web Service**

## Your Marvin Hub URL:
```
https://marvin-hub.onrender.com
```

---

## Note on Database

The local Marvin Hub uses PostgreSQL at 192.168.0.164. For cloud deployment:
- Use Render's free PostgreSQL database, OR
- Keep it local and use local Marvin for database features
- Cloud Marvin works for dashboard only without the database
