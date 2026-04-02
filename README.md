# Trivya Care – Hospital Management System

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Backend Design](#backend-design)
- [Data Models](#data-models)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Overview

Trivya Care is a full-stack Hospital Management System built with Next.js (App Router) and MongoDB. The platform provides role-based dashboards for Admin, Doctor, and Patient personas with secure authentication, appointment scheduling, and comprehensive medical record management.

---

## Features

| Module            | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| Authentication    | JWT-based login, registration, logout, and token refresh         |
| Role Management   | Granular access control for Admin, Doctor, and Patient roles     |
| Admin Dashboard   | Centralized management of doctors, patients, and appointments    |
| Doctor Dashboard  | Manage availability, view appointments, maintain medical records |
| Patient Dashboard | Book appointments, discover doctors, view medical history        |
| Appointments      | Dynamic scheduling with real-time status tracking                |
| Availability      | Weekly configurable time slots per doctor                        |
| Medical Records   | Digital storage for diagnosis, prescriptions, and clinical notes |
| UI System         | Radix UI components styled with Tailwind CSS                     |

---

## Tech Stack

| Category       | Technology                      |
| -------------- | ------------------------------- |
| Framework      | Next.js 16 (App Router)         |
| Language       | TypeScript 5                    |
| Styling        | Tailwind CSS, Radix UI          |
| Backend        | Next.js API Routes              |
| Database       | MongoDB with Mongoose ODM       |
| Authentication | JWT, bcryptjs                   |
| Form Handling  | React Hook Form, Zod validation |
| Charts         | Recharts                        |

---

## Architecture

The application follows a modern full-stack architecture:

- Monorepo structure using Next.js for both frontend and backend
- API routes handle server-side business logic
- MongoDB serves as the primary persistent data store
- Context API manages global authentication state
- Middleware pattern for request authentication and authorization

```
Client Browser -> Next.js Frontend -> API Routes -> MongoDB
                                    |
                                    v
                              Auth Middleware
```

---

## Folder Structure

```
app/
├── admin/           # Admin dashboard pages
├── doctor/          # Doctor dashboard pages
├── patient/         # Patient dashboard pages
├── api/             # Backend API routes
├── login/           # Login page
└── register/        # Registration page

components/
├── ui/              # Reusable UI components
└── auth/            # Authentication components

context/
└── AuthContext.tsx  # Global authentication context

lib/
├── api/             # API service layer
├── models/          # Mongoose data models
├── middleware/      # Auth middleware
└── utils/           # Utility functions

public/              # Static assets
styles/              # Global styles
```

---

## Backend Design

| Layer      | Responsibility                                     |
| ---------- | -------------------------------------------------- |
| API Routes | Handle HTTP requests and responses                 |
| Services   | Abstraction layer for API operations               |
| Models     | MongoDB schema definitions and validations         |
| Middleware | Authentication and authorization guards            |
| Utils      | JWT operations, password hashing, helper functions |

---

## Data Models

### User Model

| Field              | Type    | Description                          |
| ------------------ | ------- | ------------------------------------ |
| name               | string  | Full name of the user                |
| email              | string  | Unique email address                 |
| password           | string  | Hashed password                      |
| role               | enum    | Admin, Doctor, or Patient            |
| mustChangePassword | boolean | Force password change on first login |

### Doctor Model

| Field          | Type     | Description             |
| -------------- | -------- | ----------------------- |
| user           | ObjectId | Reference to User model |
| specialization | string   | Medical specialty       |
| experience     | number   | Years of practice       |
| availability   | array    | Weekly schedule slots   |

### Patient Model

| Field   | Type     | Description             |
| ------- | -------- | ----------------------- |
| user    | ObjectId | Reference to User model |
| gender  | enum     | Male, Female, Other     |
| contact | string   | Phone number            |

### Appointment Model

| Field   | Type     | Description                              |
| ------- | -------- | ---------------------------------------- |
| patient | ObjectId | Reference to Patient model               |
| doctor  | ObjectId | Reference to Doctor model                |
| date    | Date     | Appointment date and time                |
| status  | enum     | Pending, Confirmed, Completed, Cancelled |

### Medical Record Model

| Field        | Type   | Description               |
| ------------ | ------ | ------------------------- |
| diagnosis    | string | Medical diagnosis         |
| prescription | string | Prescribed medications    |
| notes        | string | Additional clinical notes |

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
TOKEN_SECRET=your_jwt_secret_key
DOMAIN=http://localhost:3000

ADMIN_EMAIL=admin@trivya.com
ADMIN_PASSWORD=admin123
```

---

## Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd your-project

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Build production bundle                  |
| `npm start`     | Run production server                    |
| `npm run lint`  | Run ESLint for code quality              |

---

## API Endpoints

| Endpoint                    | Method | Description                       |
| --------------------------- | ------ | --------------------------------- |
| `/api/auth/register`        | POST   | Register a new user               |
| `/api/auth/login`           | POST   | Authenticate and receive JWT      |
| `/api/auth/me`              | GET    | Retrieve current user information |
| `/api/auth/change-password` | POST   | Update user password              |
| `/api/doctors`              | GET    | Fetch all doctors                 |
| `/api/patients`             | GET    | Fetch all patients                |
| `/api/appointments`         | POST   | Create a new appointment          |
| `/api/medical-records`      | POST   | Create a medical record           |

---

## Security

| Measure             | Implementation                             |
| ------------------- | ------------------------------------------ |
| Password Protection | bcrypt hashing with salt rounds            |
| Session Management  | JWT tokens with expiration                 |
| Access Control      | Role-based authorization middleware        |
| Request Validation  | Zod schema validation for all inputs       |
| Route Protection    | Middleware guards for authenticated routes |

---

## Deployment

| Platform | Suitability                                               |
| -------- | --------------------------------------------------------- |
| Vercel   | Recommended for Next.js applications with automatic CI/CD |
| AWS      | Scalable hosting with EC2 and Elastic Beanstalk           |
| Render   | Simple deployment with built-in environment management    |

---

## Future Enhancements

| Feature                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| Real-time Notifications | WebSocket-based alerts for appointment updates |
| Payment Integration     | Stripe or Razorpay for online payments         |
| File Uploads            | Medical reports and document management        |
| Analytics Dashboard     | Data visualization for hospital metrics        |
| Audit Logs              | Track all system actions for compliance        |

---
