url-shortener 2026

// File: README.md
```markdown
# Modern-Shortly

Shortly is a modern, full-featured URL shortener built with the T3 stack principles but implemented with Node.js, Express, MongoDB, and Vanilla JS. It's designed to be deployed as a serverless application on Vercel.

## Features

- **URL Shortening**: Create short links with optional custom aliases, password protection, and expiry dates.
- **Interstitial Ads Page**: Monetize your links with a 15-second countdown page before redirecting.
- **User Authentication**: JWT-based auth for user accounts.
- **Dashboard & Analytics**: Users can manage their links and view detailed analytics, including daily clicks, referrers, countries, and device breakdowns.
- **QR Code Generation**: Instantly generate a QR code for any short link.
- **Admin Panel**: Manage users, links, and ad snippets from a protected admin view.
- **API Keys**: Generate API keys for programmatic access.
- **Security**: Includes rate limiting, URL validation, and hashed passwords.
- **Theming**: Light and Dark mode support.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML, Tailwind CSS (via CDN), Vanilla JavaScript
- **Deployment**: Vercel Serverless Functions

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)
- [Vercel](https://vercel.com/) account for deployment

### 2. Local Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd modern-shortly
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Now, edit the `.env` file with your own configuration:
    - `MONGODB_URI`: Your MongoDB connection string.
    - `JWT_SECRET`: A long, random string for signing tokens.
    - `BASE_URL`: For local development, use `http://localhost:3000`.
    - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Credentials for the initial admin user.

4.  **Seed the database with an admin user:**
    Run the seed script to create the first admin user based on your `.env` file.
    ```bash
    npm run seed:admin
    ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### 3. Deploying to Vercel

1.  **Push to a Git Repository:**
    Push your project to a GitHub, GitLab, or Bitbucket repository.

2.  **Import Project in Vercel:**
    - Log in to your Vercel dashboard.
    - Click "Add New... -> Project".
    - Import the Git repository.
    - Vercel should automatically detect the project as a Node.js application. The `vercel.json` file will handle all the routing configuration.

3.  **Configure Environment Variables:**
    - In your Vercel project settings, navigate to "Environment Variables".
    - Add all the variables from your `.env` file (`MONGODB_URI`, `JWT_SECRET`, `BASE_URL`, etc.).
    - **Important**: For `BASE_URL`, use your production Vercel URL (e.g., `https://your-project-name.vercel.app`).

4.  **Deploy:**
    Trigger a deployment. Vercel will build the serverless functions and deploy your static frontend. Once deployed, you can run the `seed:admin` script against your production database if needed (or create an admin manually).

### API Usage (Curl Examples)

**1. Sign Up**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
