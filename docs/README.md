# CPDO Project Documentation

This folder contains all documentation for the City Planning and Development Office (CPDO) Land Certification System.

---

## 📚 Documentation Index

### Getting Started
- **START_HERE.md** - Quick start guide for new developers
- **SETUP_SUCCESS.md** - Initial setup completion guide
- **IMPLEMENTATION_COMPLETE.md** - System implementation overview

### GIS & Zoning System
- **GIS_ZONING_USER_GUIDE.md** - Complete user guide for GIS features
- **GIS_MAP_SETUP_COMPLETE.md** - GIS map setup documentation
- **PROPERTY_MANAGEMENT_GUIDE.md** - How to manage properties
- **FREE_MAP_SETUP.md** - Free map (Leaflet/OSM) setup guide
- **UPGRADE_COMPLETE_FREE_MAPS.md** - Map upgrade documentation
- **WHATS_NEW_FREE_MAPS.md** - New features in free maps

### LandCert Decision Support System (DSS)
- **LANDCERT_DSS_IMPLEMENTATION.md** - Complete DSS implementation guide
- **LANDCERT_ARCHITECTURE.md** - System architecture overview
- **LANDCERT_QUICK_START.md** - Quick start for DSS
- **LANDCERT_SUMMARY.md** - DSS feature summary
- **DSS_SETUP_CHECKLIST.md** - Setup checklist
- **DSS_API_EXAMPLES.md** - API usage examples
- **SYSTEM_FLOW_DIAGRAM.md** - System flow diagrams

### Feature Documentation
- **SPECIAL_CHARACTERS_SUPPORT.md** - Special character handling
- **FINAL_IMPLEMENTATION_SUMMARY.md** - Final implementation notes

### Scripts
- **setup-landcert-dss.ps1** - PowerShell setup script
- **setup-landcert-dss.sh** - Bash setup script
- **apply-all-optimizations.sh** - Performance optimization script
- **refactor-components.ps1** - Component refactoring script
- **migrate-to-toast.js** - Toast notification migration

---

## 🗂️ Documentation by Topic

### For New Users
1. Read **START_HERE.md**
2. Follow **SETUP_SUCCESS.md**
3. Review **GIS_ZONING_USER_GUIDE.md**

### For Administrators
1. **GIS_ZONING_USER_GUIDE.md** - Learn GIS features
2. **PROPERTY_MANAGEMENT_GUIDE.md** - Manage properties
3. **LANDCERT_DSS_IMPLEMENTATION.md** - Understand DSS

### For Developers
1. **LANDCERT_ARCHITECTURE.md** - System architecture
2. **DSS_API_EXAMPLES.md** - API integration
3. **SYSTEM_FLOW_DIAGRAM.md** - Data flow

---

## 📖 Quick Links

### Most Important Documents
- **User Guide**: `GIS_ZONING_USER_GUIDE.md`
- **Property Management**: `PROPERTY_MANAGEMENT_GUIDE.md`
- **DSS Guide**: `LANDCERT_DSS_IMPLEMENTATION.md`
- **Setup**: `START_HERE.md`

### Feature Guides
- Adding Properties: `PROPERTY_MANAGEMENT_GUIDE.md`
- Using GIS Map: `GIS_ZONING_USER_GUIDE.md`
- DSS Evaluation: `LANDCERT_DSS_IMPLEMENTATION.md`
- Free Maps: `FREE_MAP_SETUP.md`

---

## 🔧 Setup Scripts

### Windows (PowerShell)
```powershell
.\docs\setup-landcert-dss.ps1
```

### Linux/Mac (Bash)
```bash
bash docs/setup-landcert-dss.sh
```

---

## 📝 Document Descriptions

### GIS & Zoning
- **GIS_ZONING_USER_GUIDE.md**: Complete guide on using the GIS Zoning Map, including how to view properties, run DSS evaluations, and understand zoning rules.
- **GIS_MAP_SETUP_COMPLETE.md**: Technical setup documentation for the GIS map system with 15 sample properties.
- **PROPERTY_MANAGEMENT_GUIDE.md**: Explains three ways to add properties: automatic (from requests), manual (admin interface), and bulk import.

### Decision Support System
- **LANDCERT_DSS_IMPLEMENTATION.md**: Full implementation guide covering zoning compliance checks, risk assessment, and AI recommendations.
- **LANDCERT_ARCHITECTURE.md**: System architecture including database schema, relationships, and component structure.
- **DSS_API_EXAMPLES.md**: Code examples for using the DSS API endpoints.

### Maps
- **FREE_MAP_SETUP.md**: How to use Leaflet.js with OpenStreetMap (no API keys required).
- **UPGRADE_COMPLETE_FREE_MAPS.md**: Migration guide from Google Maps to free alternatives.

---

## 🎯 Common Tasks

### Adding a Property
See: `PROPERTY_MANAGEMENT_GUIDE.md`
- From Application: Select from dropdown
- Manual Entry: Fill form manually
- Bulk Import: Use seeder

### Running DSS Evaluation
See: `GIS_ZONING_USER_GUIDE.md` → DSS Evaluation section
1. Go to Admin Panel → Requests
2. Click "Evaluate with DSS"
3. Review compliance and risk scores

### Viewing the Map
See: `GIS_ZONING_USER_GUIDE.md` → Accessing the Zoning Map
1. Login as admin
2. Click "GIS & Zoning" → "Zoning Map"
3. Click markers to view property details

---

## 🆘 Troubleshooting

### Map Issues
- See: `GIS_MAP_SETUP_COMPLETE.md` → Troubleshooting
- Check: `FREE_MAP_SETUP.md` for map configuration

### DSS Issues
- See: `LANDCERT_DSS_IMPLEMENTATION.md` → Troubleshooting
- Check: `DSS_SETUP_CHECKLIST.md` for setup verification

### Property Issues
- See: `PROPERTY_MANAGEMENT_GUIDE.md` → FAQ
- Check: `GIS_MAP_SETUP_COMPLETE.md` → Troubleshooting

---

## 📞 Support

For issues or questions:
- Check relevant documentation above
- Review troubleshooting sections
- Check Laravel logs in `storage/logs/`
- Run diagnostic commands (see individual docs)

---

**Last Updated**: February 24, 2026
**Project**: CPDO Land Certification System
**Location**: Ilagan City, Isabela, Philippines
