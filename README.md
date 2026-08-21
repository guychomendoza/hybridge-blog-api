# hybridge-blog-api

REST API for a blog platform, built with Node.js and Express. Handles user registration and login with JWT authentication, and exposes protected endpoints for creating and managing posts and comments. Data is persisted in PostgreSQL through Sequelize ORM.

**Live API:** `https://<your-render-url>.onrender.com`

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| ORM | Sequelize (with migrations) |
| Database | PostgreSQL |
| Auth | Passport.js + JSON Web Tokens |
| Deployment | Render |

---

## Features

- User registration and login with hashed passwords
- Stateless authentication via JWT, verified by custom middleware
- Protected routes: only authenticated users can create, edit or delete content
- Ownership checks so users can only modify their own resources
- Schema managed through Sequelize migrations, not auto-sync
- CORS enabled for cross-origin clients
- Environment-based configuration (development / production), with SSL enforced in production

---

## Project structure

```
.
├── config/          # Sequelize database configuration per environment
├── middlewares/     # Authentication and authorization middleware
├── migrations/      # Sequelize migration files (schema history)
├── models/          # Sequelize model definitions and associations
├── app.js           # Application entry point and route mounting
├── .sequelizerc     # Custom paths for Sequelize CLI
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
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Database setup

```bash
npx sequelize-cli db:migrate
```

### Run

```bash
npm start
```

The API will be available at `http://localhost:3000`.

---

## API reference

All protected endpoints require an `Authorization` header:

```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create a new user account |
| `POST` | `/auth/login` | No | Authenticate and receive a JWT |

### Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/posts` | No | List all posts |
| `GET` | `/posts/:id` | No | Retrieve a single post |
| `POST` | `/posts` | Yes | Create a post |
| `PUT` | `/posts/:id` | Yes | Update a post the user owns |
| `DELETE` | `/posts/:id` | Yes | Delete a post the user owns |

### Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/posts/:id/comments` | No | List comments on a post |
| `POST` | `/posts/:id/comments` | Yes | Add a comment to a post |
| `DELETE` | `/comments/:id` | Yes | Delete a comment the user owns |

---

## Example requests

**Register**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"guycho","email":"user@example.com","password":"secret123"}'
```

**Login**

```bash
curl -X POST http://localhost:3000/auth/login \
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
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"First post","body":"Post content here"}'
```

---

## Data model

- **User** has many **Posts**
- **User** has many **Comments**
- **Post** belongs to **User**, has many **Comments**
- **Comment** belongs to **User** and to **Post**

---

## Author

Luis Aurelio Mendoza Michel — [GitHub](https://github.com/guychomendoza)

Built as part of the Software Engineering coursework at Hybridge Education.
