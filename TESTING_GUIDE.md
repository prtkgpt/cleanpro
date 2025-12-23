# 🧪 Testing Guide for CleanPro CRM (Mac)

This guide will walk you through testing the CRM step-by-step. No coding experience needed!

---

## ✅ Prerequisites Check

Before we start, let's make sure you have everything installed:

### 1. Check if Node.js is installed

Open Terminal and type:
```bash
node --version
```

**Expected result:** You should see something like `v18.0.0` or higher

**If you see an error:** You need to install Node.js
- Visit: https://nodejs.org/
- Download the "LTS" version (recommended for most users)
- Run the installer
- After installation, close and reopen Terminal, then check again

---

### 2. Check if PostgreSQL is installed

In Terminal, type:
```bash
psql --version
```

**Expected result:** You should see something like `psql (PostgreSQL) 14.x`

**If you see an error:** You need to install PostgreSQL

**Option A - Easy way (Postgres.app):**
1. Visit: https://postgresapp.com/
2. Download and install Postgres.app
3. Open Postgres.app
4. Click "Initialize" to create a new server

**Option B - Using Homebrew:**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install PostgreSQL
brew install postgresql@14
brew services start postgresql@14
```

---

## 📦 Step 1: Install Project Dependencies

In Terminal, make sure you're in the cleanpro folder:

```bash
cd ~/cleanpro
```

Then install all the required packages:

```bash
npm install
```

**What this does:** Downloads all the code libraries the project needs
**How long it takes:** 2-5 minutes
**What you'll see:** Lots of text scrolling by - this is normal!

**Wait for it to complete** - you'll see a message like "added X packages"

---

## 🗄️ Step 2: Create the Database

### Create a new database

In Terminal, type:

```bash
createdb cleanpro
```

**What this does:** Creates a new PostgreSQL database called "cleanpro"

**If you get an error:** Try this instead:
```bash
psql -U postgres -c "CREATE DATABASE cleanpro;"
```

---

## 🔑 Step 3: Set Up Environment Variables

We need to create a file with your secret keys and settings.

### Copy the example file:

```bash
cp .env.example .env
```

### Edit the .env file:

```bash
nano .env
```

**You'll see a text editor.** Update these values:

#### Database Connection (REQUIRED):
```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/cleanpro"
```

**To find your username:**
- If you used Postgres.app: Usually your Mac username (type `whoami` in Terminal)
- If you used Homebrew: Usually your Mac username

**Example:**
```env
DATABASE_URL="postgresql://john@localhost:5432/cleanpro"
```

#### NextAuth Secret (REQUIRED):

Generate a secret key:
```bash
# In a new Terminal window/tab, run:
openssl rand -base64 32
```

Copy the output and paste it in .env:
```env
NEXTAUTH_SECRET="paste-the-secret-here"
```

#### Other Settings (OPTIONAL for now):

For testing, you can leave these empty. The app will warn you but still work:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Leave these blank for now - we'll add them later if needed
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
POSTMARK_API_TOKEN=""
```

### Save the file:
- Press `Control + O` (that's the letter O) to save
- Press `Enter` to confirm
- Press `Control + X` to exit

---

## 🏗️ Step 4: Set Up the Database Tables

Now we'll create all the tables in the database:

```bash
npm run db:migrate
```

**What this does:** Creates all the tables (customers, bookings, etc.) in your database
**What you'll see:** Text showing the database being set up

**When asked "Enter a name for the new migration":** Just press `Enter` (uses default name)

**Expected result:** You should see "Your database is now in sync with your schema."

---

## 🌱 Step 5: Add Test Data

Let's add some example data so you can see how everything works:

```bash
npm run db:seed
```

**What this does:** Adds sample customers, cleaners, bookings, etc.
**What you'll see:**
- ✅ Created workspace: Clean Sweep Demo
- ✅ Created admin user
- ✅ Created cleaners
- ✅ Created customers
- ✅ Created bookings

**At the end, you'll see test login accounts:**
```
📋 Test Accounts:
Admin:      admin@cleansweep.com / Admin123!
Dispatcher: dispatcher@cleansweep.com / Admin123!
Cleaner 1:  maria@cleansweep.com / Admin123!
Customer 1: jane.doe@example.com / Admin123!
```

---

## 🚀 Step 6: Start the Application

Now let's start the web server:

```bash
npm run dev
```

**What you'll see:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

**IMPORTANT:** Keep this Terminal window open! The server needs to keep running.

---

## 🌐 Step 7: Open the Website

1. Open your web browser (Chrome, Safari, etc.)
2. Go to: **http://localhost:3000**

**What you should see:** The CleanPro landing page with:
- "CleanPro CRM" heading
- "Start Free Trial" button
- "Sign In" button

---

## 🧪 Step 8: Test the Features

### Test 1: View the Landing Page ✅

You should already see the homepage with:
- Blue gradient background
- Feature cards (Smart Scheduling, Online Payments, Auto Reminders)
- Everything you need section

**Status:** If you see this, the basic app is working! ✅

---

### Test 2: Login as Admin

1. Click the **"Sign In"** button
2. Enter:
   - Email: `admin@cleansweep.com`
   - Password: `Admin123!`
3. Click **"Sign in"**

**Expected result:** You should be redirected to the home page

**Note:** The dashboard isn't built yet, so you won't see much. But if login works, the authentication system is working! ✅

---

### Test 3: Create a New Workspace

1. Go to: http://localhost:3000/signup
2. Fill in the form:
   - Company Name: `Test Cleaning Co`
   - Workspace URL: (auto-fills as `test-cleaning-co`)
   - First Name: `Your Name`
   - Last Name: `Your Last Name`
   - Email: `test@example.com`
   - Password: `Test123!` (needs uppercase, lowercase, number)
3. Click **"Create workspace"**

**Expected result:** You should be redirected to the login page

**This tests:** Workspace creation, database writes, password hashing ✅

---

### Test 4: Test the API Endpoints

Open a **new Terminal window** (keep the server running in the other one).

#### Test the Customer API:

```bash
# First, let's login and get a session
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cleansweep.com",
    "password": "Admin123!"
  }'
```

**What you should see:** Some authentication data (might be hard to read - that's okay!)

#### Test fetching customers:

Open your browser and go to:
```
http://localhost:3000/api/customers
```

**Expected result:** You might see "Unauthorized" - this is because the API requires authentication. The fact that you got a response means the API is working! ✅

---

### Test 5: View the Database

Let's look at the actual data in the database:

```bash
npm run db:studio
```

**What this does:** Opens Prisma Studio - a visual database viewer

**What you'll see:**
```
Prisma Studio is up on http://localhost:5555
```

**Open your browser and go to:** http://localhost:5555

**What you can do:**
- Click "Workspace" on the left - see your test workspaces
- Click "User" - see all the test users
- Click "Customer" - see test customers
- Click "Booking" - see test bookings

**This proves:** Your database is set up correctly and has data! ✅

---

## 🎉 Success Checklist

If you've made it this far, here's what's working:

- ✅ Node.js and PostgreSQL installed
- ✅ Project dependencies installed
- ✅ Database created and connected
- ✅ Database tables created (via migrations)
- ✅ Test data loaded (via seed)
- ✅ Web server running
- ✅ Landing page loads
- ✅ Login page works
- ✅ Signup creates new workspaces
- ✅ Database has real data
- ✅ API endpoints responding

---

## 🛑 Stopping the Application

When you're done testing:

1. Go to the Terminal window running the server (shows `npm run dev`)
2. Press `Control + C` to stop it
3. If Prisma Studio is running, go to that Terminal and press `Control + C` too

---

## ❓ Troubleshooting

### "Command not found: npm"
**Solution:** Node.js is not installed. Go back to Prerequisites Check.

### "Database connection error"
**Solution:**
1. Check PostgreSQL is running: `brew services list` (should show postgresql started)
2. Check your DATABASE_URL in .env has the correct username
3. Try: `createdb cleanpro` again

### "Port 3000 already in use"
**Solution:** Something else is using port 3000
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Then try npm run dev again
```

### "Prisma Client not generated"
**Solution:**
```bash
npm run db:generate
```

### Login doesn't work
**Solution:**
1. Make sure you seeded the database: `npm run db:seed`
2. Use exact credentials: `admin@cleansweep.com` / `Admin123!`
3. Check Terminal for error messages

---

## 📞 What Works vs. What Doesn't

### ✅ WORKS (Backend is complete):
- Creating workspaces
- User authentication
- Database with all tables
- API endpoints for customers, bookings, calendar
- Payment processing logic (Stripe integration ready)
- Messaging service (SMS/Email ready - needs API keys)

### ⏳ NOT BUILT YET (Frontend):
- Dashboard with calendar view
- Customer management interface
- Booking creation form
- Cleaner app interface
- Customer portal
- Reports and analytics pages

### What You're Testing:
You're testing the **foundation** - the backend API, database, and authentication. Think of it like testing a car's engine before building the interior!

---

## 🎯 Next Steps After Testing

Once you confirm everything works, the next phase is:
1. Build the UI components (buttons, forms, tables)
2. Create the admin dashboard
3. Build the customer portal
4. Create the cleaner app
5. Add automations and reporting

All the "brain" (backend) is done - now we need to build the "face" (frontend)!

---

## 📋 Quick Command Reference

```bash
# Start the development server
npm run dev

# Stop the server: Control + C

# View the database
npm run db:studio

# Reset the database (careful - deletes all data!)
npm run db:migrate reset

# Re-seed test data
npm run db:seed

# Check for errors
npm run type-check
```

---

**Need help?** Open an issue with:
1. What command you ran
2. What error you saw
3. Screenshot if possible
