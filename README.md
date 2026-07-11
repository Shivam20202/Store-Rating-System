# Store Rating Web Application

A full-stack web application where users can browse stores, submit ratings (1–5 stars), and store owners can view their store's ratings and average score. An admin dashboard provides full management over users, stores, and ratings.

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | Vite + React (JavaScript) + Tailwind CSS v4 |
| Backend    | Node.js + Express.js               |
| Database   | MySQL (via `mysql2`)               |
| Auth       | JWT + bcrypt                        |
| API        | REST                                |

## Features

### Admin Dashboard
- View dashboard statistics (total users, stores, ratings)
- Create and manage users (any role)
- Create and manage stores
- View user details (store owners show their average rating)
- Filter, sort, and paginate through users and stores

### User Dashboard
- Register and log in
- Search stores by name and address
- Sort stores by name or rating
- Submit and update ratings (1–5 stars)
- Change password

### Store Owner Dashboard
- View their store information and average rating
- See a list of all users who rated their store
- Change password

## Project Structure

```
project/
├── frontend/          (or project root - Vite + React app)
│   ├── src/
│   │   ├── api/       Axios API layer
│   │   ├── components/  Shared UI components
│   │   ├── context/    Auth context
│   │   └── pages/       Page components
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├
│   │── config/     Database config
│   │── controllers/ Route controllers
│   │── middleware/  Auth, validation, error handling
│   │── models/      Data access layer
│   │── routes/      Express routers
│   ├── package.json
│   ├── server.js
│   └── schema.sql
└── README.md
```

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- MySQL 8+ (or Railway MySQL)
- npm

### 1. Database Setup

Create the database and tables by running the schema file in your MySQL server:

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `store_rating_db` database, all tables, indexes, and a default admin account.

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
npm run dev
```

The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
# From the project root (frontend directory)
npm install
cp .env.example .env
# Edit .env to set VITE_API_URL if your backend runs elsewhere
npm run dev
```

The frontend runs on `http://localhost:5173`.

### 4. Default Admin Login

- Email: `shivam@admin.com`
- Password: `Shivam@@`

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=store_rating_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## API Routes

### Auth (`/api/auth`)
| Method | Path               | Description           | Auth     |
| ------ | ------------------ | --------------------- | -------- |
| POST   | `/register`        | Register new user     | Public   |
| POST   | `/login`           | Login, returns JWT    | Public   |
| PUT    | `/change-password` | Change own password   | Auth     |

### Admin (`/api/admin`) — requires admin role
| Method | Path          | Description                  |
| ------ | ------------- | ---------------------------- |
| GET    | `/stats`      | Dashboard statistics         |
| GET    | `/users`      | List users (filter/sort/page)|
| POST   | `/users`      | Create user                  |
| GET    | `/users/:id`  | User detail                  |
| GET    | `/stores`     | List stores (filter/sort/page)|
| POST   | `/stores`     | Create store                 |

### User (`/api/user`) — requires user role
| Method | Path           | Description                          |
| ------ | -------------- | ------------------------------------ |
| GET    | `/stores`     | List stores with user's ratings      |
| POST   | `/ratings`    | Submit a rating                      |
| PUT    | `/ratings/:storeId` | Update own rating              |

### Owner (`/api/owner`) — requires store_owner role
| Method | Path         | Description                              |
| ------ | ------------ | ---------------------------------------- |
| GET    | `/dashboard` | Store info, avg rating, list of raters   |

## Input Validation

| Field    | Rules                                              |
| -------- | -------------------------------------------------- |
| Name     | 20–60 characters                                   |
| Email    | Standard email format                              |
| Address  | Max 400 characters                                 |
| Password | 8–16 chars, at least one uppercase, one special char |
| Rating   | Integer 1–5                                        |

## Deployment

### Frontend → Vercel

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repo.
3. Set the root directory to the frontend folder (or project root if frontend is at root).
4. Framework preset: **Vite**.
5. Add environment variable:
   - `VITE_API_URL` = your backend Render URL + `/api` (e.g. `https://your-app.onrender.com/api`)
6. Deploy.

### Backend → Render

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) and create a new **Web Service**.
3. Set the root directory to `backend/`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `PORT` = `5000` (Render assigns one, but set this if needed)
   - `DB_HOST` = your Railway MySQL host
   - `DB_USER` = your Railway MySQL user
   - `DB_PASSWORD` = your Railway MySQL password
   - `DB_NAME` = `store_rating_db`
   - `DB_PORT` = `3306`
   - `JWT_SECRET` = a strong random string
   - `JWT_EXPIRES_IN` = `7d`
   - `FRONTEND_URL` = your Vercel frontend URL
7. Deploy.
8. After first deploy, run the schema: connect to Railway MySQL and execute `schema.sql` contents.

### Database → Railway MySQL

1. Go to [railway.app](https://railway.app) and create a new **MySQL** database.
2. Railway provides connection details (host, port, user, password, database name).
3. Create the database schema by connecting to the Railway MySQL instance and running:
   ```bash
   mysql -h <railway-host> -P <port> -u <user> -p < database/schema.sql
   ```
   Or use Railway's query tab to paste and run the SQL from `backend/schema.sql`.
4. Use the Railway connection credentials in your Render backend environment variables.

## License

This project is for educational purposes.
