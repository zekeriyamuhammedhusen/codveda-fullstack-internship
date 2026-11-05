# Products REST API

A simple REST API built with Node.js and Express, with CRUD operations on a products resource. Data is stored in memory (a database comes in Level 2).

## Run locally

```
npm install
npm run dev
```

The server runs on http://localhost:3000

## Endpoints

| Method | Route | Description | Success |
|--------|-------|-------------|---------|
| GET | /api/products | Get all products | 200 |
| GET | /api/products/:id | Get one product | 200 |
| POST | /api/products | Create a product | 201 |
| PUT | /api/products/:id | Update a product | 200 |
| DELETE | /api/products/:id | Delete a product | 204 |

## Example body (POST)

```json
{ "name": "Phone", "price": 800, "category": "Electronics" }
```

## Error responses

| Status | When |
|--------|------|
| 400 | Invalid or missing data, or invalid JSON |
| 404 | Product or route not found |
| 500 | Unexpected server error |

## Tested with

Thunder Client (VS Code extension)
