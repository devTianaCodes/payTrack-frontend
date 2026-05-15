# Presentation PayTrack

## Project Overview

PayTrack is a mobile-first full-stack web application for managing recurring subscriptions. It helps users track what they pay for, when renewals happen, which payment method is used, and how subscription spending evolves over time.

The product goal is simple: give users one calm, organized place to understand recurring payments before they become forgotten expenses.

PayTrack supports mobile, tablet, and desktop web layouts. The interface starts from a mobile-first experience and expands into larger responsive views for tablets and desktop browsers.

## Core Problem

Many users subscribe to services such as Netflix, Spotify, software tools, cloud storage, newsletters, fitness memberships, and productivity apps. Over time, these subscriptions become hard to remember and easy to waste money on.

PayTrack solves this by giving users:

- A clear overview of active subscriptions.
- Renewal dates and upcoming renewal reminders.
- Monthly and yearly spending totals.
- Subscription grouping by category.
- Safe payment-method labels.
- Payment history for each subscription.
- Archive and restore flows instead of risky permanent deletion.

## Target Users

PayTrack is designed for people who want better control over recurring expenses without using a full finance/banking application.

Typical users include:

- Individuals managing entertainment, fitness, and cloud subscriptions.
- Students tracking software, education, and productivity tools.
- Freelancers tracking work-related tools such as Codex, Claude, Figma, storage, and newsletters.
- Anyone who wants reminders before renewals and a cleaner picture of recurring spending.

## Technology Stack

### Frontend

- React
- Vite 6
- JavaScript
- React Router
- Tailwind CSS
- i18next for translations
- Recharts for spending visualizations
- lucide-react for UI icons
- simple-icons for selected real service logos

### Backend

- Node.js
- Express
- JavaScript
- Prisma ORM
- MySQL
- Zod for request validation
- JWT-based auth stored in HTTP-only cookies
- Nodemailer for email reminders
- node-cron for scheduled jobs

### Database

- MySQL schema: `paytrack`
- Prisma schema as the source of truth for tables and relations
- Migrations used to create and evolve the database structure

### Local Development

- Frontend local server: `http://localhost:5317` or alternate port when needed
- Backend local server: `http://localhost:5318`
- MySQL available through local MySQL or Docker configuration
- Demo credentials after seeding:
  - Email: `demo@paytrack.local`
  - Password: `PayTrack123!`

## Architecture

PayTrack uses a classic full-stack web architecture:

```text
React Frontend
  -> REST JSON API
    -> Express Backend
      -> Prisma ORM
        -> MySQL Database
```

The frontend never communicates directly with MySQL. It calls backend API endpoints under `/api`. The backend validates requests, applies business logic, and reads or writes data through Prisma.

Authentication uses HTTP-only cookies so session tokens are not handled directly by frontend JavaScript.

## Main Application Areas

### Authentication

Users can register, log in, and stay authenticated through secure HTTP-only cookie sessions.

Current auth responsibilities:

- Register user account.
- Log in with email and password.
- Load the current authenticated user.
- Log out.
- Protect app routes from unauthenticated access.

The backend stores password hashes, never plain passwords.

### Dashboard

The dashboard gives users a fast financial snapshot:

- Monthly subscription spending.
- Yearly projected spending.
- Active subscription count.
- Upcoming renewals.
- Spending mix chart by category.
- Subscription breakdown inside each category.

The dashboard is designed to answer: “How much am I spending, and what renews soon?”

### Subscriptions

Subscriptions are the core domain object in PayTrack.

Users can track:

- Service name.
- Price.
- Currency.
- Renewal date.
- Billing frequency.
- Category.
- Payment method label.
- Notes.
- Status.

Supported statuses:

- `active`
- `cancelled`
- `archived`

Subscription management avoids dangerous one-click deletion. Instead, users open a Manage Subscription menu where actions live in a safer, intentional flow.

### Payment Methods

PayTrack stores payment-method labels only. It does not store full card numbers or real payment credentials.

Examples:

- `Visa **** 4242`
- `Mastercard **** 1188`
- `PayPal`
- `Bank account`

This keeps the app useful for organization while avoiding sensitive payment processing responsibilities.

### Payment History

PayTrack supports manual payment tracking.

Users can mark a subscription as paid and confirm:

- Amount.
- Paid date.
- Currency.
- Payment method.
- Notes.

When a subscription is marked as paid, PayTrack records a payment entry and advances the next renewal date based on the billing frequency.

Each subscription has a dedicated payment timeline page showing:

- Total paid.
- Number of payments.
- Average payment.
- Last paid date.
- Next renewal.
- Year filtering.
- Timeline of payment entries.

This creates a lightweight recurring-payment ledger without charging real cards.

### Reminders

PayTrack includes reminder logic for upcoming renewals.

Default reminder windows:

- 7 days before renewal.
- 1 day before renewal.

The backend scheduled reminder job checks active subscriptions, sends email reminders through SMTP when configured, and records reminder logs.

The frontend includes a Reminders page where sent reminder history can be reviewed.

### Archive

Subscriptions are archived instead of immediately deleted.

Archive behavior:

- Archived subscriptions are removed from active totals.
- Archived subscriptions are excluded from reminder jobs.
- Users can restore archived subscriptions.
- Old archived subscriptions can be cleaned up automatically after a long retention period.

This protects users from accidental deletion while keeping the interface clean.

### Settings

Settings allow users to personalize their account and app behavior.

Current settings include:

- Display name.
- Language.
- Default currency.
- Timezone.
- Dark mode.
- Payment methods.

Payment methods now include a confirmation step before deletion, reducing accidental loss.

## Database Model Summary

The core database tables are:

- `User`
- `Category`
- `PaymentMethod`
- `Subscription`
- `SubscriptionPayment`
- `ReminderLog`
- `PasswordResetToken`

Important relationships:

- A user owns subscriptions, payment methods, and reminder logs.
- A subscription may belong to a category.
- A subscription may reference a payment method.
- A subscription can have many payment records.
- A subscription can have many reminder logs.

## API Structure

The backend exposes REST JSON endpoints under `/api`.

Main API groups:

- `/api/auth`
- `/api/me`
- `/api/categories`
- `/api/payment-methods`
- `/api/subscriptions`
- `/api/dashboard`
- `/api/reminders`

Example flows:

```text
GET /api/dashboard
  -> dashboard totals, upcoming renewals, category mix

GET /api/subscriptions
  -> list subscriptions

POST /api/subscriptions
  -> create subscription

POST /api/subscriptions/:id/payments
  -> record manual payment and advance renewal date

GET /api/subscriptions/:id/payments
  -> payment timeline

DELETE /api/subscriptions/:id
  -> archive subscription instead of hard delete
```

## UI Direction

PayTrack uses a calm, minimal visual style:

- Professional but friendly.
- Mobile-first.
- Rounded panels and clear spacing.
- Strong readable typography.
- Dense enough for repeated use, but not visually heavy.

Base colors:

- Ink: `#101828`
- Mint: `#2EE59D`
- Coral: `#FF6B5F`

The design avoids feeling like a banking app. It feels more like a focused personal finance assistant for recurring payments.

## Responsive Design

PayTrack is designed for:

- Mobile phones.
- Tablets.
- Desktop browsers.

The mobile version uses bottom navigation. Tablet and desktop layouts use a side navigation structure with more horizontal space for cards, filters, and summaries.

Important responsive areas already checked:

- Login and register.
- Dashboard.
- Subscriptions.
- Manage subscription controls.
- Payment history page.
- Settings.

## Internationalization

PayTrack supports multiple languages through i18next.

Current languages:

- English
- Italian
- German
- French
- Romanian
- Russian

This makes the app better suited for portfolio presentation because it demonstrates early internationalization planning rather than late-stage translation.

## Security And Data Safety

Important safety decisions:

- No full card numbers are stored.
- Payment methods are labels only.
- Passwords are hashed.
- Auth tokens are stored in HTTP-only cookies.
- Backend request validation uses Zod.
- Users can only access their own subscriptions, payment methods, reminders, and profile data.
- Deletion-sensitive actions use confirmation or archive flows.

PayTrack intentionally does not process real third-party subscription payments. It tracks and organizes them safely.

## Current Product Status

PayTrack is past the initial scaffold phase and has a working MVP structure.

Already implemented:

- Full-stack React + Express architecture.
- MySQL database with Prisma models.
- Authentication.
- Dashboard analytics.
- Subscription CRUD.
- Category and payment-method support.
- Manual payment history.
- Payment timeline page.
- Reminder job foundation.
- Reminder history page.
- Archive and restore logic.
- Multi-currency choices.
- Multi-language support.
- Dark mode.
- Responsive mobile/tablet/desktop layouts.

Remaining future work:

- More automated tests.
- Password reset completion.
- More advanced analytics.
- Stronger reminder preferences per subscription.
- Production deployment setup.
- Production SMTP setup.
- More accessibility and visual QA.
- Code splitting for frontend bundle size.

## Portfolio Highlights

PayTrack demonstrates:

- Full-stack architecture.
- Real database modeling.
- Authenticated user flows.
- Secure handling of sensitive-adjacent payment information.
- REST API design.
- Prisma/MySQL data modeling.
- Mobile-first responsive UI.
- Internationalization.
- Scheduled backend jobs.
- Dashboard analytics and charting.
- Product thinking around safe destructive actions.

## Presentation Narrative

The strongest way to present PayTrack is:

1. Start with the real-world problem: users forget recurring subscriptions.
2. Show the dashboard: monthly spend, yearly projection, upcoming renewals.
3. Show subscription management: add, edit, manage, archive.
4. Show payment safety: labels only, no real card storage.
5. Show payment history: mark as paid, timeline, summaries.
6. Show reminders: scheduled renewal notifications.
7. Show architecture: React -> Express -> Prisma -> MySQL.
8. Close with scalability: tests, deployment, advanced reminders, analytics.

## One-Sentence Summary

PayTrack is a secure, mobile-first subscription manager that helps users understand, organize, and control recurring payments through real full-stack architecture, safe payment labels, reminders, analytics, and payment history.
