# Faktubuh (فَاكْتُبُوهُ)

A debt management application inspired by Ayat al-Dayn (the Verse of Debt) from the Quran. The name means "write it down" in Arabic, reflecting the Islamic directive to document financial obligations.

Users can record debts, track payments, schedule installments, invite witnesses, and manage settlements — all with full Arabic (RTL) and English (LTR) support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Ruby 3.4.7, Rails 8.1 |
| Frontend | React 19, TypeScript, Vite 7 |
| Bridge | Inertia.js (server-driven SPA) |
| Database | PostgreSQL 18 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Auth | Devise + Google OAuth |
| Jobs | GoodJob |
| i18n | react-i18next + Rails I18n (Arabic default) |
| Deployment | Kamal, Docker, Thruster |

## Core Features

**Debt Management**
- **Mutual debts** between two platform users (requires counterparty confirmation)
- **Personal debts** with non-users (tracked by name, auto-active)
- Upgrade personal debts to mutual when the counterparty joins

**Payments & Installments**
- Flexible installment schedules: lump sum, monthly, bi-weekly, quarterly, yearly
- Payment submission with lender approval flow (mutual) or auto-approval (personal)
- Auto-settlement when remaining balance reaches zero

**Witnesses**
- Up to 2 witnesses per debt, invited by personal ID
- Witness confirmation/decline flow

**Notifications**
- In-app notifications for all debt lifecycle events
- Email notifications respecting user locale

**Background Jobs**
- `OverdueDetectionJob` — daily midnight check marking overdue installments (UTC)
- `InstallmentReminderJob` — daily 8AM reminders (3 days, 1 day, due today) (UTC)

## Project Structure

```
app/
  controllers/         # Rails controllers (Debts, Payments, Witnesses, etc.)
  models/              # ActiveRecord models with business logic
  mailers/             # DebtMailer for all email notifications
  services/            # NotificationService, InstallmentScheduleGenerator
  jobs/                # GoodJob background jobs
  frontend/
    components/        # Shared React components (shadcn/ui based)
    layouts/           # PersistentLayout (all pages), AppLayout (authenticated)
    pages/             # Inertia pages (dashboard, debts, auth, profile, etc.)
    i18n/locales/      # ar.json, en.json frontend translations
    lib/               # Utilities, types, hooks
config/
  locales/             # ar.yml, en.yml backend translations
  routes.rb            # All application routes
db/
  schema.rb            # Database schema
  migrate/             # Migrations
```

### Layout System

- `PersistentLayout` wraps every page (theme, flash toasts, direction provider)
- `AppLayout` wraps authenticated pages (navbar, navigation)
- Pages declare layouts via: `Page.layout = [AppLayout]`
- `PersistentLayout` is auto-prepended in `inertia.tsx`

## Local Development

### Prerequisites

- Ruby 3.4.7, Node 25.2.1, Yarn 4.12.0 (use [mise](https://mise.jdx.dev/) or `.tool-versions`)
- Docker (for PostgreSQL)

### Setup

```bash
# Start PostgreSQL
docker compose -f dev-docker-compose.yml up -d

# Install dependencies
bundle install
yarn install

# Setup database
bin/rails db:create db:migrate db:seed

# Start dev servers (Rails + Vite)
bin/dev
```

The app runs at `http://localhost:3000`. Vite dev server handles frontend HMR.

### Environment

Dev database config uses `postgres:postgres@localhost:5432` by default (see `config/database.yml`). No `.env` file needed for local development.

### Google OAuth (Optional)

Google OAuth is configured via Rails credentials (not hardcoded in `config/initializers/devise.rb`).

- Set `google.client_id` and `google.client_secret` via `bin/rails credentials:edit`

Redirect URIs to add in Google Cloud Console:
- `http://localhost:3000/users/auth/google_oauth2/callback`
- `https://<your-domain>/users/auth/google_oauth2/callback`

### Running Tests

```bash
# View-rendering tests expect a built Vite manifest in test mode
bin/rails vite:build RAILS_ENV=test

# Recommended quick run (no coverage gating, serial to avoid Vite manifest flakiness)
NO_COVERAGE=1 PARALLEL_WORKERS=1 bin/rails test
```

Coverage thresholds are configured in `test/test_helper.rb` (95% line / 90% branch). Omit `NO_COVERAGE=1` to enforce.

### Linting

```bash
bundle exec rubocop          # Ruby
yarn check                   # TypeScript
yarn lint                    # JavaScript/TypeScript (Oxlint)
yarn format:check            # JavaScript/TypeScript formatting (Oxfmt)
bundle exec brakeman         # Security scan
bundle exec bundler-audit    # Dependency audit
```

## Deployment

Deployed via [Kamal](https://kamal-deploy.org/) to a single server with Docker.

```bash
kamal setup    # First-time server setup
kamal deploy   # Deploy updates
```

### Required Secrets

Set these as Kamal secrets (`.kamal/secrets`):

- `RAILS_MASTER_KEY` — Rails credentials decryption key
- `POSTGRES_PASSWORD` — Production database password
- `KAMAL_REGISTRY_PASSWORD` — GitHub Container Registry token

### Required Environment (Kamal)

- `SERVER_IP` — used by `config/deploy.yml`
- `APP_HOST` — used for mailer links (defaults to `faktubuh.com` in production)
- `MAILER_FROM` — optional (defaults to `faktubuh@gmail.com`)

### Email (Required)

Devise confirmation/password reset/unlock emails are enqueued with `deliver_later`, so a GoodJob worker must be running.

- Gmail SMTP: set `google.gmail_application_password` in Rails credentials
- Other SMTP: configure `config.action_mailer.smtp_settings` in `config/environments/production.rb`

### Infrastructure

- **Domain**: faktubuh.com (SSL via Kamal proxy)
- **Registry**: ghcr.io/aliosm/faktubuh
- **Server roles**: `web` (Rails + Thruster) and `worker` (GoodJob)
- **Accessory**: PostgreSQL 18 container managed by Kamal
- **Storage**: Persistent volume at `/rails/storage`

### Kamal Aliases

```bash
kamal console   # Rails console
kamal shell     # Bash shell
kamal logs      # Tail application logs
kamal dbc       # Database console
```

## Key Design Decisions

- **Inertia.js** bridges Rails and React without a separate API layer — controllers render React pages directly
- **React Compiler** is enabled for automatic memoization
- **RTL-first** design with `DirectionProvider` for Radix UI components
- **Pessimistic locking** on payment creation prevents race conditions
- **Rate limiting** on debt (20/hr) and payment (10/hr) creation
- **Personal IDs** (3-12 char alphanumeric; generated as 6) are used for user lookup instead of exposing emails
- **User deletion** is blocked if the user has any associated debts, payments, or witness records
