# CareMate App

Welcome to the CareMate App repository! This project consists of a React Native (Expo) frontend and a Node.js (Express + PostgreSQL) backend. 

There are 3 developers collaborating on this project. Please follow the setup instructions below to get your local environment running, and adhere to the GitHub Workflow to avoid merge conflicts and keep our code clean!

---

## 🛠️ Prerequisites

Before you start, make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or access to a remote database URL)
- [Git](https://git-scm.com/)
- Expo Go app installed on your physical smartphone (iOS or Android) for testing.

---

## 🚀 Local Setup Instructions

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd CareMateApp
```

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory and add your credentials:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/caremate
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Set up the Database: Make sure your Postgres database has the `app_users` and `profiles` tables created (as required by the auth endpoints).
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:3000`.*

### 3. Frontend Setup
1. Open a **new** terminal window and navigate to the frontend folder:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Connect to the Backend:
   Make sure the API calls in the frontend code (like `SignInScreen.tsx`) are pointing to your computer's local IP address (e.g., `http://192.168.x.x:3000`), NOT `localhost`, because the mobile emulator/device needs your network IP to reach the backend.
4. Start the Expo server:
   ```bash
   npm start
   ```
5. Scan the QR code with your Expo Go app, or press `a` for Android Emulator / `i` for iOS Simulator.

---

## 🤝 GitHub Workflow

With 3 people working on the same codebase, **never push directly to the `master` branch.** Doing so will cause messy merge conflicts. 

Please follow this strict branching and Pull Request (PR) workflow:

### 1. Sync your local repository
Before starting any new work, always pull the latest changes from the master branch to ensure you are up to date:
```bash
git checkout master
git pull origin master
```

### 2. Create a Feature Branch
Create a new branch for the specific feature or bug you are working on. Name it clearly:
```bash
# Format: <type>/<short-description>
git checkout -b feature/login-ui
# OR
git checkout -b bugfix/auth-crash
```

### 3. Commit your changes
As you code, commit your changes in logical, bite-sized chunks:
```bash
git add .
git commit -m "feat: added email validation to sign up screen"
```
*(Tip: Use prefixes like `feat:`, `fix:`, `chore:`, or `refactor:` in your commit messages!)*

### 4. Push and Open a Pull Request (PR)
When your feature is finished and tested locally:
```bash
git push origin feature/login-ui
```
1. Go to the repository on GitHub.
2. Click **Compare & pull request**.
3. Add a description of what you changed.
4. **Request a review** from at least 1 of the other 2 collaborators.

### 5. Review and Merge
- Reviewers will look at the code and test it if necessary.
- Once it is **Approved**, click the "Merge pull request" button on GitHub.
- After it merges, the branch can be deleted, and everyone should run `git pull origin master` to get your new code!
