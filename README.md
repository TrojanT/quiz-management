# Quiz Hub

Full-stack web application: **Node.js**, **Express**, and **MongoDB** on the server; **React** on the client. Includes authenticated end-user flows and a protected **administration** area for quiz and question management.

---

## Project setup

### Prerequisites

- Node.js (LTS recommended)
- MongoDB 

### Backend

1. From the repository root, open a terminal in the `backend` directory.
2. Create the environment file from the template:
  - Windows: `copy .env.example .env`
  - macOS / Linux: `cp .env.example .env`
3. Edit `.env` and configure:

  | Variable                                      | Description                                                         |
  | --------------------------------------------- | ------------------------------------------------------------------- |
  | `MONGO_URI`                                   | MongoDB connection string                                           |
  | `JWT_SECRET`                                  | Secret used to sign JWTs (use a strong, unique value in production) |
  | `PORT`                                        | HTTP port for the API (default: `5001` if omitted)                  |
  | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Initial administrator account (see **Administrator seeding** below) |

4. Install dependencies and start the API in development mode:
  ```bash
   npm install
   npm run dev
  ```
   The API listens on `http://localhost:5001`
5. Run automated tests:
  ```bash
   npm test
  ```

### Frontend

1. Open a terminal in the `frontend` directory.
2. Install dependencies:
  ```bash
   npm install
  ```
3. Set the API base URL in `frontend/src/axiosConfig.jsx` (`baseURL`):
  - Local development: `http://localhost:5001`
4. Start the development server:
  ```bash
   npm start
  ```
   The application is served at `http://localhost:3000` by default.

### Administrator seeding

After a successful database connection, the server executes `seedAdmin.js`. If no document exists with `role: 'admin'`, the process creates or promotes an administrator using `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from `.env`. If `ADMIN_EMAIL` or `ADMIN_PASSWORD` is unset, seeding is skipped; refer to server logs for messages prefixed with `[Admin seed]`.

---

## Public URL


| Environment | Base URL                                     |
| ----------- | -------------------------------------------- |
| Production  | [http://3.27.158.122/](http://3.27.158.122/) |


---

## Administrator credentials


| Field    | Value             |
| -------- | ----------------- |
| Email    | `admin@gmail.com` |
| Password | `Admin@123`       |


## User credentials


| Field    | Value           |
| -------- | --------------- |
| Email    | testu@gmail.com |
| Password | `123456`        |




---

