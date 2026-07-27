# DeenByte Digital Services

A production-quality SaaS platform for wallet-funded digital services: airtime, data, electricity, cable TV, and identity/education verification (NIN, BVN, CAC, WAEC, NECO, JAMB).

## Stack

| Layer      | Technology                                                        |
|------------|--------------------------------------------------------------------|
| Frontend   | React 18 + Vite, Bootstrap 5, Bootstrap Icons, React Router, Context API, React Hook Form, Zod, Chart.js, react-toastify |
| Backend    | Node.js, Express.js, JWT auth, bcrypt, Helmet, CORS, rate limiting |
| Database   | PostgreSQL + Prisma ORM                                            |
| Payments   | Provider-agnostic abstraction: Paystack (live), Monnify, Flutterwave, Stripe |
| Docs       | Swagger / OpenAPI at `/api/docs`                                   |
| Deployment | Docker, Docker Compose, Nginx, GitHub Actions                      |

## Project structure

```
deenbyte/
├── backend/
│   ├── prisma/                # schema.prisma, seed.js
│   └── src/
│       ├── config/            # env, db, logger
│       ├── middleware/        # auth, error, rateLimiter, validate
│       ├── utils/             # jwt, password, mailer, reference, response
│       ├── payments/          # PaymentProvider interface + Paystack/Monnify/Flutterwave/Stripe adapters
│       ├── modules/
│       │   ├── auth/          # register, login, refresh, forgot/reset password, email verify
│       │   ├── user/          # profile, avatar upload
│       │   ├── wallet/        # balance, fund, history, ledger operations
│       │   ├── services/      # catalog-driven purchase engine (all 10 service types)
│       │   ├── notifications/
│       │   └── admin/         # dashboard, users, transactions, wallets, services, reports, announcements
│       ├── docs/swagger.js
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── api/axiosClient.js # axios instance + silent refresh-token interceptor
│       ├── context/           # AuthContext, ThemeContext (dark mode), WalletContext
│       ├── routes/            # ProtectedRoute, AdminRoute
│       ├── components/        # Navbar, Sidebar, AppLayout, Skeleton loaders
│       └── pages/
│           ├── auth/           # Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│           ├── services/       # ServicePurchase (generic, config-driven), OrderReceipt
│           └── admin/          # AdminDashboard, AdminUsers, AdminTransactions, AdminServices, AdminReports, AdminAnnouncements
├── nginx/                     # reverse-proxy.conf (used by docker-compose)
├── .github/workflows/ci.yml
└── docker-compose.yml
```

## How the "10 services" requirement is implemented

Rather than duplicating near-identical Airtime/Data/Electricity/Cable/NIN/BVN/CAC/WAEC/NECO/JAMB code ten times, the platform is **catalog-driven**:

- The `Service` table stores each service's category, backing provider key, fees, min/max bounds, and a `fieldsSchema` JSON that describes the exact input fields the frontend form needs (e.g. Airtime needs `network` + `phone` + `amount`; NIN needs `nin` + `fullName`).
- The frontend has **one** `ServicePurchase.jsx` component that reads a service's `fieldsSchema` and renders the correct form automatically. Visiting `/services/airtime`, `/services/waec_pin`, etc. all use it.
- The backend has **one** purchase pipeline (`services.service.js`) that: validates input against the schema → computes fees → debits the wallet atomically → creates an `Order` → dispatches to the correct provider adapter → on success attaches a token/PIN and produces a receipt → on failure automatically reverses the wallet debit.
- Adding an 11th service later means inserting one `Service` row — no new pages or controllers required, unless it needs a genuinely new provider adapter (in which case you add one file under `backend/src/modules/services/providers/`).

## Payment abstraction

`backend/src/payments/PaymentFactory.js` is the single source of truth for which gateway is active. Every adapter (`PaystackProvider`, `MonnifyProvider`, `FlutterwaveProvider`, `StripeProvider`) implements the same 4 methods: `initializePayment()`, `verifyPayment()`, `refundPayment()`, `webhook()`. **Switching providers only requires changing `PAYMENT_PROVIDER` in `.env`** — no code changes anywhere else. Paystack is implemented as a live, working integration; the other three are complete, ready-to-run implementations against their documented APIs — just add real credentials.

## Getting started (local development)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or use `docker-compose up postgres` to run just the database)

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL, JWT secrets, SMTP creds, and PAYSTACK_SECRET_KEY/PAYSTACK_PUBLIC_KEY
npm install
npm run migrate:dev   # creates tables from prisma/schema.prisma
npm run seed          # seeds admin user, demo customer, and all 10 services
npm run dev            # starts on http://localhost:5000
```

Seeded accounts:
- Admin: `admin@deenbyte.com` / `Admin@12345`
- Customer: `customer@deenbyte.com` / `Customer@12345` (wallet pre-funded with ₦5,000)

API docs: `http://localhost:5000/api/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # starts on http://localhost:5173
```

### 4. Using your Paystack keys

In `backend/.env`:

```
PAYMENT_PROVIDER=paystack
PAYSTACK_SECRET_KEY=sk_live_or_test_xxx
PAYSTACK_PUBLIC_KEY=pk_live_or_test_xxx
PAYSTACK_WEBHOOK_SECRET=sk_live_or_test_xxx   # Paystack signs webhooks with your secret key
```

Then in the Paystack dashboard, point your webhook URL to:
```
https://your-domain.com/api/payments/webhook/paystack
```

Wallet funding flow: `POST /wallet/fund` (initializes) → user is redirected to Paystack's hosted checkout → Paystack redirects back to `CLIENT_URL/wallet/fund/callback?reference=...` → frontend calls `POST /wallet/fund/confirm` → wallet is credited. The webhook endpoint is a redundant, more reliable confirmation path in case the user closes the browser before redirect completes.

To switch to Monnify, Flutterwave, or Stripe later, just change `PAYMENT_PROVIDER` and fill in that provider's keys — the rest of the app needs no changes.

## Running everything with Docker Compose

```bash
cp backend/.env.example backend/.env   # fill in real secrets first
docker compose up --build
```

This starts: PostgreSQL, the backend API (auto-runs migrations on boot), the built frontend served by Nginx, and a top-level Nginx reverse proxy on port 80 routing `/api/*` to the backend and everything else to the frontend.

## Security notes

- Passwords hashed with bcrypt (12 rounds).
- JWT access tokens are short-lived (15 min default); refresh tokens are stored server-side (rotatable/revocable) and delivered as httpOnly, sameSite cookies — never exposed to JS.
- Helmet sets standard security headers; CORS is locked to `CLIENT_URL`.
- All mutating endpoints are behind `authenticate` middleware; admin endpoints additionally require `authorize('ADMIN')`.
- Zod validates every request body before it reaches business logic.
- Rate limiting: 200 req/15min globally, 10 req/15min on auth endpoints (brute-force protection).
- Webhook signatures are verified per-provider before any wallet mutation occurs.
- Wallet debits/credits run inside Prisma `$transaction` blocks to prevent race conditions on balance.

## What's genuinely live vs. ready-for-credentials

- **Live and fully working out of the box:** auth, wallet ledger, admin panel, the entire purchase pipeline, Paystack payment integration (given real keys).
- **Fully coded, ready for your credentials:** Monnify, Flutterwave, and Stripe payment adapters; VTU/NIMC/BVN/CAC/WAEC/NECO/JAMB service adapters (these call third-party aggregator APIs — plug in your chosen vendor's base URL/API key in `.env` and, if their request/response shape differs from the generic one assumed here, adjust the relevant adapter file — each is under 60 lines).

## License

Proprietary — DeenByte Digital Services.
