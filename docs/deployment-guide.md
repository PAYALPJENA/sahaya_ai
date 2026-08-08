# Sahaya AI: Live Deployment Guide

This guide explains how to deploy the Sahaya AI full-stack application for free using **Render** (for the FastAPI backend) and **Netlify** (for the Next.js frontend). We have already added the automated configuration files (`render.yaml` and `netlify.toml`) to the root of the repository to make this as seamless as possible.

---

## Step 1: Deploy the Backend to Render

Render will host the FastAPI server and the SQLite database.

1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub account and select the `sahaya_ai` repository.
4. Render will automatically detect the `render.yaml` file we just created.
5. Click **Apply** or **Deploy**.
6. Render will install Python dependencies and start the backend.
7. **Important**: Once it finishes deploying, copy the live URL of your backend (it will look something like `https://sahaya-backend-xxxxx.onrender.com`).

*Note: The free tier of Render spins down after 15 minutes of inactivity and uses ephemeral storage (your SQLite database will reset to the seeded defaults if the server restarts). This is perfect for a clean, reproducible demo environment!*

---

## Step 2: Deploy the Frontend to Netlify

Netlify will host the Next.js user interface.

1. Go to [Netlify.com](https://www.netlify.com/) and log in.
2. Click **Add new site** -> **Import an existing project**.
3. Connect your GitHub account and select the `sahaya_ai` repository.
4. Netlify will automatically detect the `netlify.toml` file we just created and configure the build settings.
5. **CRITICAL STEP**: Before clicking deploy, click on **Add environment variables**.
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://sahaya-backend-xxxxx.onrender.com/api/v1` *(Paste the Render URL from Step 1 here, making sure to append `/api/v1` to the end).*
6. Click **Deploy site**.
7. Wait a couple of minutes for the build to finish.

---

## Step 3: Test the Live System

1. Visit your new live Netlify URL (e.g., `https://sahaya-ai.netlify.app`).
2. Submit an SOS report on the home page.
3. Go to `/login` and log in with `collector@sahaya.ai` and `password123`.
4. Verify that the incident appears in the dashboard and that the AI triage data was processed successfully by the Render backend!
