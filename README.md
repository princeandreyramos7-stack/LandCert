# CPDO Locational Clearance System

Online locational clearance and zoning compliance for the City Planning and
Development Office (CPDO), City of Ilagan, Isabela.

Live: https://cityofilaganzoningadministration.online

---

## What it does

**Applicants**
- Register with an SMS one-time code; the address is picked from the PSGC list
- File an application (CZC, TUP, SUP or ZC) through a step-by-step form and upload the requirements
- Follow it through five steps (filed → verified → approved → paid → released), fix and resubmit when it is returned, upload the payment receipt, and download the certificate or clearance
- Notifications in the app, by e-mail, by SMS, and as push notifications on the installable app (PWA)

**Zoning Officer**
- Dashboard with the applications waiting on them and their Citizen's Charter deadlines, plus notices from the Zoning Administrator
- Document verification, review, fee computation and the order of payment
- Payment verification, certificate preparation and release
- Reports (by applicant, by day / month / year) as PDF and Excel, SMS broadcast to applicants, the audit log

**Zoning Administrator**
- Final approval of what the officers have reviewed
- User management (staff accounts, positions, e-signatures), notices to officers, SMS to officers
- Oversight reports, including what each Zoning Officer reviewed
- Backups, with optional off-site copies (S3 / Google Cloud Storage) and one-click restore

Issued documents carry a QR code that anyone can check at `/verify`.
Processing time is measured in working days against the Citizen's Charter
limits, and closed applications are archived automatically.

---

## Tech stack

- Laravel 12 (PHP 8.2+), MySQL / MariaDB
- React 18 + Inertia.js 2, Tailwind CSS, shadcn/ui, Vite 7
- Semaphore (SMS), SMTP mail through a queue, Web Push (VAPID)
- spatie/laravel-backup, spatie/laravel-permission

---

## Local development

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed          # roles, staff accounts, PSGC address list
php artisan storage:link
composer run dev             # app server + queue worker + Vite, together
```

Demo data (local only - it refuses to run in production):

```bash
php artisan db:seed --class=DemoSeeder   # 21 applications across every status
```

### Tests

```bash
php artisan test
```

The suite runs against its own database (`zoning_compliance_test`, see
`phpunit.xml`), never the working one. Run it before every deploy. Stop the
Vite dev server first (or move `public/hot` aside) so pages load the built
assets.

---

## Deploying to production

The host has no Node.js, so **the compiled frontend travels in the
repository**: run `npm run build` and commit `public/build` whenever frontend
code changes. `public/hot` (written by the Vite dev server) must never be on
the server - it is git-ignored for that reason.

### 1. Environment (`.env` on the host - never committed)

- `APP_ENV=production`, `APP_DEBUG=false` (set it directly; `php artisan optimize` fails otherwise)
- `APP_URL=https://cityofilaganzoningadministration.online`, `SESSION_SECURE_COOKIE=true`
- `QUEUE_CONNECTION=database`, `MAIL_*`, `SMS_ENABLED=true` and the SMS key
- `SMS_PROCESSING_FEE` - the SMS automated processing fee added to every payment (default ₱10)
- `DB_*`, and `DB_DUMP_PATH` pointing at the server's `mysqldump` directory (backups)
- Push notifications: generate a fresh key pair on the host with `php artisan webpush:vapid` - never reuse the development keys
- Optional off-site backups: `AWS_*` and/or `GOOGLE_CLOUD_*`

### 2. After every deploy

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan route:clear && php artisan config:clear && php artisan cache:clear && php artisan view:clear
php artisan optimize
```

Clearing the caches is not optional: a stale route cache on the host has
broken every public page before (`Ziggy error: route ... is not in the route list`).

### 3. Once, on a new server

```bash
php artisan storage:link
php artisan db:seed --force          # prints each staff password once
php artisan signatures:sync          # links the e-signature images to the staff accounts
```

- Writable: `storage/`, `bootstrap/cache/`, `public/images/E-signitures/uploads/`
- Apache `mod_rewrite` and `mod_headers` on (`public/.htaccess` sends the
  `Service-Worker-Allowed` header the installable app needs)

### 4. Cron - required

```
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

Without it **no e-mail is sent** (all mail is queued) and reminders, nightly
archiving, unverified-account cleanup and backups never run.

---

## Accounts

There are no default passwords. `php artisan db:seed` creates the office's
staff accounts with random passwords (or the `SEED_PASSWORD_<NAME>` values in
`.env`, e.g. `SEED_PASSWORD_CRISANTA`), prints them once, and never resets an
account that already exists. Applicants register themselves at `/register`.

To reset a staff password:

```bash
php artisan admin:reset-password someone@cpdo.com          # prints a random one
php artisan admin:reset-password someone@cpdo.com --password=...
```

---

## Useful commands

| Command | What it does |
|---|---|
| `admin:reset-password {email}` | Reset a staff password |
| `admin:info` | Show the staff accounts |
| `signatures:sync` | Match the e-signature images to staff accounts |
| `applications:archive` | Archive closed and long-unpaid applications (also runs nightly) |
| `reminders:send` | Send the reminders that are due (also runs hourly) |
| `users:prune-unverified` | Remove sign-ups that never finished SMS verification (also runs daily) |
| `diagnose:email` | Check the mail configuration |
| `webpush:vapid` | Generate push-notification keys |
| `backup:run` | Take a backup now |

---

## Troubleshooting

**404s, or "route ... is not in the route list" after a deploy** - the route
cache is stale:

```bash
php artisan route:clear && php artisan config:clear && php artisan cache:clear && php artisan view:clear
```

**`php artisan optimize` fails with `laravel-exceptions-renderer::topbar`** -
`APP_DEBUG` is not `false` in the host's `.env`.

**No e-mails arrive** - the cron above is not running, so the mail queue is
never worked.

**A signature is missing from a printed document** - run
`php artisan signatures:sync` on the host.

---

## Documentation

- [Fee computation](docs/FEE_COMPUTATION.md) - how the Treasury fee is calculated for each application type

---

## License

Proprietary software developed for the City Planning and Development Office of
the City of Ilagan, Isabela, Philippines.
