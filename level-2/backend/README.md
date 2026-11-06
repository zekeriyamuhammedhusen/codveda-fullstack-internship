# Products API with MongoDB (Level 2, Task 3)

Express REST API backed by MongoDB using Mongoose.

## Setup

```
npm install
```

Create a `.env` file:

```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/codveda_products
```

Run:

```
npm run dev
```

## Models

- **Category**: `name` (required, unique, 2-50 characters)
- **Product**: `name` (required, 2-100 characters), `price` (required, minimum 0), `category` (reference to a Category), `inStock` (default true)

## Relationship

Each product stores the `_id` of a category. `populate` returns the category's name with the product.

## Indexes

- Unique index on `Category.name`
- Compound index on `Product` (`category`, `price`) for filtering by category and sorting by price
- Text index on `Product.name` for search

## Validation

Mongoose validates data before saving. Invalid data returns `400` with the schema's message. Duplicate category names return `409`.

## Endpoints

| Method | Route               | Description                                                         |
| ------ | ------------------- | ------------------------------------------------------------------- |
| GET    | /api/categories     | List categories                                                     |
| POST   | /api/categories     | Create a category                                                   |
| DELETE | /api/categories/:id | Delete a category (409 if it still has products)                    |
| GET    | /api/products       | List products (`?category=`, `?search=`, `?sort=price` or `-price`) |
| GET    | /api/products/:id   | Get one product                                                     |
| POST   | /api/products       | Create a product                                                    |
| PUT    | /api/products/:id   | Update a product                                                    |
| DELETE | /api/products/:id   | Delete a product                                                    |

## Optimizations

- `.lean()` on read queries returns plain objects, which is faster
- Indexes support the common filter, sort, and search queries

## Authentication and Authorization (Level 2, Task 2)

Users sign up and log in with JWT. Passwords are hashed with bcrypt, and the token is stored in an HTTP-only cookie.

Add these to your `.env`:

```
JWT_SECRET=a-long-random-string
JWT_EXPIRES_IN=1h
```

### Auth endpoints

| Method | Route            | Description                               |
| ------ | ---------------- | ----------------------------------------- |
| POST   | /api/auth/signup | Create an account (role is always `user`) |
| POST   | /api/auth/login  | Log in and receive the token cookie       |
| POST   | /api/auth/logout | Clear the token cookie                    |
| GET    | /api/auth/me     | Get the logged-in user (protected)        |

### Access rules

| Route                              | Who can use it     |
| ---------------------------------- | ------------------ |
| GET products, GET categories       | Anyone             |
| POST/PUT products, POST categories | Any logged-in user |
| DELETE products, DELETE categories | Admins only        |

### Security

- Passwords are hashed with bcrypt (10 salt rounds) before saving, and are never returned by the API
- The JWT is stored in an HTTP-only cookie (`sameSite: lax`, `secure` in production), so browser scripts cannot read it
- Tokens expire after 1 hour
- Signup ignores any `role` in the request, so nobody can create an admin account
- Login returns the same error for a wrong email and a wrong password
- Status codes: `401` not logged in or invalid token, `403` wrong role, `409` duplicate email
