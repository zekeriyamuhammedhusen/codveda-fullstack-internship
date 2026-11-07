# Level 3 - Advanced

A full-stack MERN application with authentication, role-based access, and real-time updates with Socket.io.

- **Frontend:** React (Vite), React Router, Axios, socket.io-client
- **Backend:** Node.js, Express, MongoDB with Mongoose, Socket.io
- **Folders:** [backend](./backend) and [frontend](./frontend)

## Task 1: Full-Stack Application (MERN)

- Signup, login, and logout with bcrypt password hashing and JWT stored in an HTTP-only cookie
- The login state survives a page refresh, because the app asks the server who is logged in
- Protected pages: logged-out users are redirected to the login page
- Role-based access: any logged-in user can add and edit products, and only admins can delete
- Sidebar layout that is shown only after login, and responsive on small screens
- Products and categories stored in MongoDB, with validation, a product-category relationship, and indexes

### Performance and security

- Response compression, security headers (helmet), and a limit on request body size
- Rate limiting on the login and signup routes
- Read queries use `.lean()`, and the database has indexes for filtering, sorting, and searching
- The production build of the frontend is about 117 kB gzipped

## Task 2: Real-Time Communication (Socket.io)

- Only logged-in users can open a socket connection (the same JWT cookie is checked)
- Product changes appear live in every open browser, without a refresh
- Admins receive a private notification when a normal user adds a product
- Each user has a private room and admins share an `admins` room, for user-specific messages

### Efficient updates

- The server sends only the changed product (or just its id for a delete), not the whole list
- Each browser changes just that one item in its list
- The list is reloaded once after a dropped connection comes back, so missed events are recovered

### Socket events

| Event                | Sent to            | Contains                            |
| -------------------- | ------------------ | ----------------------------------- |
| `product:created`    | Everyone connected | The new product                     |
| `product:updated`    | Everyone connected | The updated product                 |
| `product:deleted`    | Everyone connected | `{ _id }`                           |
| `categories:changed` | Everyone connected | Nothing (clients reload categories) |
| `notification`       | Admins only        | `{ message }`                       |

## Run locally

You need Node.js and a running MongoDB.

### Backend

```
cd level-3/backend
npm install
npm run dev
```

Create `level-3/backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/codveda_fullstack
JWT_SECRET=a-long-random-string
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
```

### Frontend

```
cd level-3/frontend
npm install
npm run dev
```

Create `level-3/frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Open http://localhost:5173. New accounts are always regular users. To make an admin, change the user's `role` to `admin` in the database.

## API

| Method | Route               | Access    |
| ------ | ------------------- | --------- |
| POST   | /api/auth/signup    | Public    |
| POST   | /api/auth/login     | Public    |
| POST   | /api/auth/logout    | Public    |
| GET    | /api/auth/me        | Logged in |
| GET    | /api/products       | Public    |
| GET    | /api/products/:id   | Public    |
| POST   | /api/products       | Logged in |
| PUT    | /api/products/:id   | Logged in |
| DELETE | /api/products/:id   | Admin     |
| GET    | /api/categories     | Public    |
| POST   | /api/categories     | Logged in |
| DELETE | /api/categories/:id | Admin     |

## Live demo

- **Frontend:** https://codveda-fullstack-internship-zak.vercel.app
- **Backend API:** https://codveda-fullstack-internship-flem.onrender.com

The backend runs on a free hosting plan, so the first request after a period of inactivity can take about 30 seconds while the server wakes up.

## Deployment

- **Database:** MongoDB Atlas
- **Backend:** Render (Node.js web service, environment variables for the secrets)
- **Frontend:** Vercel (Vite build, with a rewrite rule so React Router pages work on refresh)
- The login cookie is `HttpOnly`, `Secure`, and `SameSite=None` in production, so it works between the two domains
