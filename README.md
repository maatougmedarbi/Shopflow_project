# ShopFlow

ShopFlow is a full-stack e-commerce project built with Spring Boot and Next.js.

## Stack

- Backend: Java 17, Spring Boot 3, Spring Security 6, Spring Data JPA, JWT
- Frontend: Next.js 16, React 19, Tailwind CSS
- Database: H2 for development and tests, PostgreSQL-ready configuration

## Features

- JWT authentication with access and refresh tokens
- Public product browsing with search, pagination, image upload, and top-selling products
- Cart management, coupon application, checkout, and order history
- Role-based areas for admin and seller dashboards
- Reviews, categories, and coupon administration
- Swagger/OpenAPI documentation

## Run Backend

```powershell
cd backend
.\mvnw.cmd clean test
.\mvnw.cmd spring-boot:run
```

Backend runs on `http://127.0.0.1:8081`.

## Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## API Documentation

- Swagger UI: `http://127.0.0.1:8081/swagger-ui`
- Swagger UI direct path: `http://127.0.0.1:8081/swagger-ui.html`
- OpenAPI JSON: `http://127.0.0.1:8081/v3/api-docs`

## Postman

Import [shopflow.postman_collection.json](shopflow.postman_collection.json) to test the backend endpoints.

## Notes

- The frontend stores auth tokens in localStorage and mirrors them into cookies so protected routes can be enforced by middleware.
- Protected frontend routes include `/cart`, `/orders`, `/profile`, `/dashboard`, and `/products/create`.
- Uploaded product images are stored under `backend/uploads/products`.
