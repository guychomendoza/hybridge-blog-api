# hybridge-blog-api

REST API for a blog platform, built with Node.js and Express. Handles authentication with Passport.js and JSON Web Tokens, and exposes protected endpoints for managing posts and authors. Data is persisted in PostgreSQL (Supabase) through Sequelize ORM.

**Live API:** https://hybridge-blog-api-9iiu.onrender.com

> Hosted on Render's free tier: the instance sleeps after ~15 minutes without traffic, so the first request may take 30–60 seconds to respond.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| ORM | Sequelize (with migrations) |
| Database | PostgreSQL (Supabase) |
| Auth | Passport.js (local + JWT strategies), bcryptjs, jsonwebtoken |
| Deployment | Render |

---

## Features

- User registration and login with passwords hashed via bcryptjs
- Two Passport strategies: local for login, JWT for protecting routes
- Stateless authentication through a reusable auth middleware
- Full CRUD for posts and authors, with write operations behind authentication
- Soft deletes on users (`paranoid: true`, `deletedAt`)
- Schema managed through Sequelize migrations rather than auto-sync
- Environment-based configuration, with SSL enforced on the production connection to Supabase
- CORS enabled

---

## Project structure

```
.
├── config/                  # Sequelize configuration per environment
├── models/                  # Sequelize models and associations
├── migrations/              # Schema migration history
├── middlewares/
│   └── auth.js              # JWT verification middleware
├── hybridge-blog-api/
│   ├── index.js             # Application entry point
│   └── posts.js             # Post routes
├── .sequelizerc             # Custom paths for the Sequelize CLI
└── package.json
```

---

## Getting started

### Requirements

- Node.js 18 or newer
- A PostgreSQL database (local or hosted)

### Installation

```bash
git clone https://github.com/guychomendoza/hybridge-blog-api.git
cd hybridge-blog-api
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your_secret_key
PORT=3000
NODE_ENV=development
```

### Database setup

```bash
npx sequelize-cli db:migrate
```

### Run

```bash
node hybridge-blog-api/index.js
```

The API will be available at `http://localhost:3000`.

---

## API reference

Protected endpoints require an `Authorization` header:

```
Authorization: Bearer <token>
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | No | Health check |
| `POST` | `/api/login` | No | Authenticate and receive a JWT |
| `GET` | `/api/posts` | No | List all posts |
| `GET` | `/api/posts/:id` | No | Retrieve a single post |
| `POST` | `/api/posts` | Yes | Create a post |
| `PUT` | `/api/posts/:id` | Yes | Update a post |
| `DELETE` | `/api/posts/:id` | Yes | Delete a post |
| `GET` | `/api/authors` | No | List all authors |
| `POST` | `/api/authors` | Yes | Create an author |

Requests without a valid token on protected routes return `401 Unauthorized`.

---

## Example requests

**Login**

```bash
curl -X POST https://hybridge-blog-api-9iiu.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Create a post**

```bash
curl -X POST https://hybridge-blog-api-9iiu.onrender.com/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"First post","content":"Post content here","authorId":1}'
```

---

## Data model

- **Author** has many **Posts**
- **Post** belongs to **Author** (`authorId`)
- **User** holds credentials for authentication, with soft-delete enabled

---

## Notes

Deployment surfaced two differences between local and production worth recording: Supabase requires SSL on the production connection, which had to be declared explicitly in the Sequelize `production` config, and dependencies had to be consolidated into the root `package.json` since the build only installs from the repository root.

---

## Author

Luis Aurelio Mendoza Michel — [GitHub](https://github.com/guychomendoza)

Built as coursework for the Software Engineering program at Hybridge Education.
