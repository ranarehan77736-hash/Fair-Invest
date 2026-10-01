# FairInvest cPanel Deployment Guide

This guide walks you through deploying **FairInvest** to cPanel hosting with:
- **Frontend User Portal:** `https://fairinvest.site`
- **Admin Panel:** `https://fairinvest.site/admin`
- **Backend API:** `https://api.fairinvest.site`
- **Database:** MySQL / MariaDB

---

## 📦 Generated Deployment Artifacts

The deployment packaging command (`npm run pack:all`) has generated clean, ready-to-upload files in the root folder:

| File | Where to Upload in cPanel | Description |
| :--- | :--- | :--- |
| `site-deploy-clean.zip` (or `.tar.gz`) | `/public_html/` | User Frontend SPA + `.htaccess` |
| `admin-deploy-clean.zip` (or `.tar.gz`) | `/public_html/admin/` | Admin Panel SPA + `.htaccess` |
| `backend-deploy-clean.zip` (or `.tar.gz`) | `/home/USER/api.fairinvest.site/` | Express API + Socket.io + Knex |
| `fairinvest_mysql_schema.sql` | cPanel **phpMyAdmin** | Full database tables + initial seed data |

---

## Step 1: Create the Subdomain & Folders in cPanel

1. Log into your **cPanel** dashboard.
2. Go to **Domains** > **Subdomains** (or **Domains**).
3. Create the subdomain:
   - **Subdomain:** `api`
   - **Domain:** `fairinvest.site`
   - **Document Root:** `api.fairinvest.site` (or `/home/USER/api.fairinvest.site`)
4. In **File Manager**, navigate to `public_html`:
   - Create a subfolder named `admin` inside `public_html` (path: `public_html/admin`).

---

## Step 2: Create MySQL Database & User

1. In cPanel, click **MySQL® Databases** (or **MySQL® Database Wizard**).
2. Create a new database: e.g. `fairinvest_db` (full name will be `yourcpaneluser_fairinvest_db`).
3. Create a new database user: e.g. `fairinvest_usr` with a strong password.
4. Add the user to the database and grant **ALL PRIVILEGES**.
5. Save your database credentials:
   - **DB Name:** `yourcpaneluser_fairinvest_db`
   - **DB User:** `yourcpaneluser_fairinvest_usr`
   - **DB Password:** `YourPassword`
   - **DB Host:** `localhost` (in 99% of cPanels it is `localhost`, or `127.0.0.1`)

### Import the Database Schema:
1. In cPanel, open **phpMyAdmin**.
2. Select your newly created database from the left sidebar.
3. Click the **Import** tab at the top.
4. Click **Choose File** and select `fairinvest_mysql_schema.sql`.
5. Click **Import** (or **Go**).
   > *All 28 tables, relationships, and default admin/investment plans are now created!*

---

## Step 3: Deploy the Backend API (`api.fairinvest.site`)

### 1. Upload Backend Files:
1. In cPanel **File Manager**, navigate to your backend directory (e.g. `/home/USER/api.fairinvest.site`).
2. Upload `backend-deploy-clean.zip`.
3. Right-click and **Extract** the files here.
4. Delete the zip file after extraction.

### 2. Configure Backend `.env`:
1. In the backend directory, make sure you can see hidden dot-files (Settings > Show Hidden Files in File Manager).
2. If `.env` does not exist, copy `.env.example` to `.env` and click **Edit**:
```env
NODE_ENV=production
PORT=5000

# Database
DB_CLIENT=mysql2
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yourcpaneluser_fairinvest_db
DB_USER=yourcpaneluser_fairinvest_usr
DB_PASSWORD=YourPassword
MYSQL_TIMEZONE=+05:00

# CORS & Allowed Domains
CLIENT_URL=https://fairinvest.site,https://www.fairinvest.site
ADMIN_URL=https://fairinvest.site/admin

# Security Secrets (Replace with random strings)
JWT_ACCESS_SECRET=c28f61a09804b281f6920392c68a4192b0c9f1a238
JWT_REFRESH_SECRET=7f918e001c7694d939a3f019b84a921d7b320ec910

# cPanel SMTP Email Settings
SMTP_HOST=mail.fairinvest.site
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@fairinvest.site
SMTP_PASS=YourEmailPassword
SMTP_FROM_NAME=FairInvest
SMTP_FROM_EMAIL=info@fairinvest.site

# Feature toggles
REQUIRE_SIGNUP_OTP=false
ENABLE_FORGOT_PASSWORD_OTP=true
AUTO_PROFIT_ENABLED=true
AUTO_PROFIT_INTERVAL_MINUTES=5
PROFIT_DAY_MODE=calendar
PROFIT_UTC_OFFSET_HOURS=5
ENABLE_PRINCIPAL_REFUND=false
```
3. Save the `.env` file.

### 3. Setup Node.js App in cPanel:
1. In cPanel, find **Setup Node.js App** (CloudLinux Phusion Passenger).
2. Click **Create Application**.
3. Fill in the parameters:
   - **Node.js version:** `20.x` or `22.x` (or highest available)
   - **Application mode:** `Production`
   - **Application root:** `api.fairinvest.site` (or the folder path where backend was extracted)
   - **Application URL:** `api.fairinvest.site`
   - **Application startup file:** `server.js` (or `app.js`)
4. Click **Create**.
5. Once created, click **Run NPM Install** (or enter the terminal command shown at the top of the cPanel Node.js page: `source /home/.../nodevenv/... && npm install`).
6. Click **Restart**.

### 4. Verify Backend Health:
Visit `https://api.fairinvest.site/api/health` in your browser.
You should see:
```json
{"success": true, "message": "Backend healthy", "db": "connected"}
```
Visiting `https://api.fairinvest.site/` will show:
```json
{"status": "online", "service": "FairInvest API", "health": "/api/health"}
```

---

## Step 4: Deploy the Frontend (`fairinvest.site`)

1. In cPanel **File Manager**, navigate to `public_html/`.
2. (Optional: backup/delete old placeholder files like `default.html` or `index.html` if present).
3. Upload `site-deploy-clean.zip`.
4. Right-click and **Extract** into `public_html/`.
5. Ensure `public_html/.htaccess` and `public_html/index.html` exist.
6. Delete `site-deploy-clean.zip`.

---

## Step 5: Deploy the Admin Panel (`fairinvest.site/admin`)

1. In cPanel **File Manager**, navigate to `public_html/admin/`.
2. Upload `admin-deploy-clean.zip`.
3. Right-click and **Extract** inside `public_html/admin/`.
4. Ensure `public_html/admin/.htaccess` and `public_html/admin/index.html` exist.
5. Delete `admin-deploy-clean.zip`.

---

## Step 6: SSL Certificates (HTTPS)

1. In cPanel, go to **SSL/TLS Status**.
2. Select:
   - `fairinvest.site`
   - `www.fairinvest.site`
   - `api.fairinvest.site`
3. Click **Run AutoSSL**.
4. Once completed, your browser will show the secure padlock on all 3 URLs.

---

## 🔑 Default Admin Credentials

- **Admin Login URL:** `https://fairinvest.site/admin`
- **Email:** `admin@fairinvest.site`
- **Password:** `Admin@12345`

> **Note:** If you want to change the admin password at any time, run from the backend folder terminal:
> ```bash
> node reset-admin.js admin@fairinvest.site YourNewPassword123
> ```

---

## 🛠 Rebuilding in the Future

Whenever you make changes to the code, simply run:
```bash
npm run pack:all
```
This automatically:
1. Compiles frontend targeting `https://api.fairinvest.site/api`
2. Compiles admin panel targeting `https://api.fairinvest.site/api`
3. Injects `.htaccess` with SPA rewrite rules
4. Re-dumps the database schema
5. Packages all three `.zip` and `.tar.gz` distribution archives
