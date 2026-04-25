# 🎬 CineTube — Movie & Series Rating Portal (Backend)

> RESTful API server for the CineTube Movie & Series Rating & Streaming Portal. Built with Node.js, Express.js, Prisma ORM, and PostgreSQL. Handles authentication, media library management, reviews, payments (Stripe), and more.

---

## 🌐 Live URLs

| Service  | URL                                          |
| -------- | -------------------------------------------- |
| Frontend | https://cinetube-frontend-vert.vercel.app/   |
| Backend  | https://cinetube-backend-wine.vercel.app/    |

---

## 📦 GitHub Repositories

| Repository         | Link                                              |
| ------------------ | ------------------------------------------------- |
| Frontend (Next.js) | https://github.com/shuvo2011/cinetube-frontend    |
| Backend (Express)  | https://github.com/shuvo2011/cinetube-backend     |

---

## 🔐 Test Credentials

| Role  | Email                      | Password  |
| ----- | -------------------------- | --------- |
| Admin | shuvombstu2013@gmail.com   | Pa$$w0rd! |
| User  | samiha.tasnim@example.com  | Pa$$w0rd! |

---

## ✨ Features

- JWT-based authentication with access & refresh tokens
- Google OAuth via Better Auth
- Email verification, forgot password & OTP flows
- Role-based access control (ADMIN / USER)
- Full CRUD for movies, genres, platforms, cast members, tags
- Review system with admin approval workflow
- Review likes (one per user per review)
- Nested comment system
- Watchlist management
- Stripe subscription (monthly & yearly plans) with webhook handling
- Cloudinary image upload
- PDF invoice generation (pdfkit)
- Email notifications (Nodemailer + Gmail SMTP)
- Admin analytics & stats dashboard
- Modular folder structure with clean separation of concerns

---

## 🛠️ Tech Stack

| Layer           | Technology                              |
| --------------- | --------------------------------------- |
| Runtime         | Node.js                                 |
| Framework       | Express.js v5                           |
| ORM             | Prisma v7 (PostgreSQL adapter)          |
| Database        | PostgreSQL                              |
| Auth            | JWT (jsonwebtoken) + Better Auth        |
| Payment         | Stripe                                  |
| File Upload     | Cloudinary                              |
| Email           | Nodemailer (Gmail SMTP)                 |
| Validation      | Zod v4                                  |
| PDF             | pdfkit                                  |
| Language        | TypeScript                              |
| Build Tool      | tsup                                    |
| Package Manager | pnpm                                    |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── config/
│   │   ├── cloudinary.config.ts
│   │   ├── env.ts
│   │   └── stripe.config.ts
│   ├── errorHelpers/
│   │   ├── AppError.ts
│   │   ├── handlePrismaErrors.ts
│   │   └── handleZodError.ts
│   ├── interfaces/
│   │   ├── error.interface.ts
│   │   ├── index.d.ts
│   │   ├── query.interface.ts
│   │   └── requestUser.interface.ts
│   ├── lib/
│   │   ├── auth.ts              # Better Auth setup
│   │   └── prisma.ts            # Prisma client instance
│   ├── middleware/
│   │   ├── checkAuth.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── notFound.ts
│   │   ├── optionalCheckAuth.ts
│   │   └── validateRequest.ts
│   ├── module/
│   │   ├── admin/               # Admin controller, service, routes, validation
│   │   ├── auth/                # Auth controller, service, routes, validation
│   │   ├── castMember/          # Cast member CRUD
│   │   ├── comment/             # Comment CRUD
│   │   ├── genre/               # Genre CRUD
│   │   ├── movie/               # Movie CRUD
│   │   ├── payment/             # Stripe payment + webhook
│   │   ├── platform/            # Streaming platform CRUD
│   │   ├── review/              # Review CRUD + approval
│   │   ├── reviewLike/          # Review like/unlike
│   │   ├── stats/               # Analytics & stats
│   │   ├── tag/                 # Tag CRUD
│   │   ├── user/                # User management
│   │   └── watchlist/           # Watchlist management
│   ├── routes/
│   │   └── index.ts             # Central route registry
│   ├── shared/
│   │   ├── catchAsync.ts        # Async error wrapper
│   │   └── sendResponse.ts      # Standardized API response
│   ├── templates/               # Email & HTML templates
│   │   ├── changeEmailTemplate.ts
│   │   ├── forgotPasswordTemplate.ts
│   │   ├── googleRedirectHtml.ts
│   │   ├── invoiceTemplate.ts
│   │   └── otpTemplate.ts
│   └── utils/
│       ├── cookie.constants.ts
│       ├── cookie.ts
│       ├── deleteUploadedFilesFromCloudinary.ts
│       ├── email.ts
│       ├── emailHelpers.ts
│       ├── emailTemplates.ts
│       ├── jwt.ts
│       ├── QueryBuilder.ts
│       ├── seed.ts
│       ├── token.ts
│       └── toWebHeaders.ts
├── app.ts
└── server.ts

prisma/
├── schema/
│   ├── auth.prisma
│   ├── cast.prisma
│   ├── comment.prisma
│   ├── enums.prisma
│   ├── genre.prisma
│   ├── movie.prisma
│   ├── payment.prisma
│   ├── platform.prisma
│   ├── review.prisma
│   ├── schema.prisma
│   └── tag.prisma
└── migrations/
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```dotenv
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET=your_better_auth_secret_here
BETTER_AUTH_URL=http://localhost:5000

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRES_IN="1d"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

# Frontend
FRONTEND_URL=http://localhost:3000

# Gmail SMTP
EMAIL_SENDER_SMTP_USER=your_email@gmail.com
EMAIL_SENDER_SMTP_PASS=your_app_password_here
EMAIL_SENDER_SMTP_HOST=smtp.gmail.com
EMAIL_SENDER_SMTP_PORT=465
EMAIL_SENDER_SMTP_FROM=your_email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Seed
SUPER_ADMIN_EMAIL=admin@cinetube.com
SUPER_ADMIN_PASSWORD=your_super_admin_password_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id_here
STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id_here
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database
- Stripe account (for payment)
- Cloudinary account (for image upload)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/shuvo2011/cinetube-backend.git
cd cinetube-backend

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Fill in the values in .env

# 4. Run database migrations
pnpm migrate

# 5. Generate Prisma client
pnpm generate

# 6. Start the development server
pnpm dev
```

The API will be available at `http://localhost:5000`.

---

## 📡 API Endpoints (Base: `/api/v1`)

| Module       | Route           | Description                                     |
| ------------ | --------------- | ----------------------------------------------- |
| Auth         | `/auth`         | Register, login, refresh, logout, Google OAuth  |
| Movies       | `/movies`       | CRUD for movies & series                        |
| Genres       | `/genres`       | CRUD for genres                                 |
| Platforms    | `/platforms`    | CRUD for streaming platforms                    |
| Cast Members | `/cast-members` | CRUD for cast members                           |
| Tags         | `/tags`         | CRUD for review tags                            |
| Reviews      | `/reviews`      | Create, read, approve, delete reviews           |
| Review Likes | `/review-likes` | Like/unlike reviews                             |
| Comments     | `/comments`     | CRUD for comments                               |
| Watchlist    | `/watchlist`    | Add/remove/list watchlist items                 |
| Payment      | `/payments`     | Stripe checkout, webhook, history               |
| Users        | `/users`        | User management (admin)                         |
| Admin        | `/admin`        | Admin-specific operations                       |
| Stats        | `/stats`        | Analytics & dashboard stats                     |

---

## 🧪 Scripts

```bash
pnpm dev             # Start development server (tsx watch)
pnpm build           # Build for production (tsup)
pnpm start           # Start production server
pnpm migrate         # Run Prisma migrations
pnpm generate        # Generate Prisma client
pnpm studio          # Open Prisma Studio
pnpm push            # Push schema to DB (no migration)
pnpm lint            # Run ESLint
pnpm stripe:webhook  # Forward Stripe webhooks to localhost
```

---

## 🗂️ Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Stripe webhook handler for subscription events
fix: resolve JWT refresh token expiry bug
chore: update Prisma schema for review model
refactor: extract QueryBuilder to shared utility
```

---

## 📋 Assignment Info

- **Assignment:** 5 — Batch 6
- **Project Type:** Movie & Series Rating & Streaming Portal

---

## 📄 License

This project is submitted as a university course assignment. All rights reserved.