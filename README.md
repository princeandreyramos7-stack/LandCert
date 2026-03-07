# CPDO Land Certification System

City Planning and Development Office (CPDO) - Land Certification Management System for Ilagan City, Isabela, Philippines.

---

## 🚀 Quick Start

```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Build frontend
npm run build

# Start server
php artisan serve
```

---

## 📚 Documentation

All documentation is located in the **`docs/`** folder.

### Essential Guides
- **[Getting Started](docs/START_HERE.md)** - New user guide
- **[GIS & Zoning User Guide](docs/GIS_ZONING_USER_GUIDE.md)** - Complete GIS features guide
- **[Property Management](docs/PROPERTY_MANAGEMENT_GUIDE.md)** - How to add and manage properties
- **[DSS Implementation](docs/LANDCERT_DSS_IMPLEMENTATION.md)** - Decision Support System guide

### Full Documentation Index
See **[docs/README.md](docs/README.md)** for complete documentation index.

---

## ✨ Key Features

### Land Certification Management
- Request submission and tracking
- Multi-step application form
- Payment processing and verification
- Certificate generation and download
- Email notifications

### GIS & Zoning System
- Interactive map (Leaflet + OpenStreetMap)
- Property location visualization
- Zoning classification management
- Ilagan City-specific boundaries

### Decision Support System (DSS)
- Automated zoning compliance checks
- Risk assessment (0-100 score)
- Compliance scoring (0-100 score)
- AI-powered recommendations
- 7 zoning rules, 8 risk factors

### Admin Features
- User management with roles
- Request approval workflow
- Payment verification
- Audit logging
- Analytics dashboard
- PDF exports

---

## 🛠️ Tech Stack

- **Backend**: Laravel 12.x, PHP 8.2
- **Frontend**: React, Inertia.js, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: MySQL
- **Maps**: Leaflet.js + OpenStreetMap
- **Email**: Laravel Mail

---

## 📋 Requirements

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0
- XAMPP/WAMP (for local development)

---

## 🔐 Default Credentials

### Admin Account
- Email: `admin@example.com`
- Password: `password`

### Test User
- Email: `user@example.com`
- Password: `password`

---

## 🗺️ GIS Features

### Zoning Map
- View all properties on interactive map
- Click markers for property details
- Restricted to Ilagan City area
- Free (no API keys required)

### Add Properties
Two methods:
1. **From Application** - Select from existing requests
2. **Manual Entry** - Fill form manually

Access: **Admin Panel → GIS & Zoning → Add Property**

---

## 🎯 Decision Support System

### Features
- Zoning compliance validation
- Environmental risk assessment
- Infrastructure availability checks
- Automated recommendations

### Usage
1. Go to **Admin Panel → Requests**
2. Click **"Evaluate with DSS"** on any request
3. Review compliance score and recommendations

---

## 📦 Database Seeding

```bash
# Seed all data
php artisan db:seed

# Seed specific data
php artisan db:seed --class=AdminUserSeeder
php artisan db:seed --class=ZoningRuleSeeder
php artisan db:seed --class=RiskFactorSeeder
php artisan db:seed --class=PropertyLocationSeeder
```

---

## 🧪 Useful Commands

```bash
# Check properties
php artisan check:properties

# Update property zones
php artisan update:property-zones

# Reset admin password
php artisan reset:admin-password

# Show admin info
php artisan show:admin-info

# Clear caches
php artisan optimize:clear
```

---

## 📁 Project Structure

```
cpdo_project/
├── app/
│   ├── Http/Controllers/
│   ├── Models/
│   ├── Services/
│   └── Observers/
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   └── Pages/
│   └── views/
├── routes/
│   └── web.php
├── docs/              # All documentation
└── public/
```

---

## 🔧 Configuration

### Environment Variables
Key settings in `.env`:
- `APP_URL` - Application URL
- `DB_*` - Database configuration
- `MAIL_*` - Email configuration

### Map Configuration
- Center: Ilagan City (16.9754°N, 121.8947°E)
- Zoom: 13
- Bounds: Ilagan City area only

---

## 🐛 Troubleshooting

### Common Issues

**404 Errors**
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

**Map Not Loading**
- Check internet connection
- Verify Leaflet CSS is loaded
- See `docs/FREE_MAP_SETUP.md`

**No Properties on Map**
```bash
php artisan check:properties
php artisan db:seed --class=PropertyLocationSeeder
```

---

## 📖 Learn More

- **Full Documentation**: [docs/README.md](docs/README.md)
- **GIS Guide**: [docs/GIS_ZONING_USER_GUIDE.md](docs/GIS_ZONING_USER_GUIDE.md)
- **DSS Guide**: [docs/LANDCERT_DSS_IMPLEMENTATION.md](docs/LANDCERT_DSS_IMPLEMENTATION.md)
- **Architecture**: [docs/LANDCERT_ARCHITECTURE.md](docs/LANDCERT_ARCHITECTURE.md)

---

## 📄 License

This project is proprietary software developed for the City Planning and Development Office of Ilagan City, Isabela, Philippines.

---

## 👥 Credits

Developed for CPDO - Ilagan City, Isabela, Philippines

**Last Updated**: February 24, 2026
