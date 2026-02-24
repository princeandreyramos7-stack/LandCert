# LandCert DSS Setup Checklist

Use this checklist to ensure proper setup and deployment of the Decision Support System.

## ✅ Initial Setup

### Database Setup
- [ ] Run migrations: `php artisan migrate`
- [ ] Seed zoning rules: `php artisan db:seed --class=ZoningRuleSeeder`
- [ ] Seed risk factors: `php artisan db:seed --class=RiskFactorSeeder`
- [ ] Verify 7 zoning rules created
- [ ] Verify 8 risk factors created

### Google Maps Configuration
- [ ] Obtain Google Maps API key from Google Cloud Console
- [ ] Enable "Maps JavaScript API" in Google Cloud
- [ ] Add `GOOGLE_MAPS_API_KEY` to `.env` file
- [ ] Add Google Maps script to `resources/views/app.blade.php`
- [ ] Test map loads without errors

### Frontend Build
- [ ] Run `npm install` (if not done)
- [ ] Run `npm run build`
- [ ] Verify no build errors
- [ ] Check compiled assets in `public/build`

### Cache & Optimization
- [ ] Clear cache: `php artisan cache:clear`
- [ ] Clear config: `php artisan config:clear`
- [ ] Clear routes: `php artisan route:clear`
- [ ] Clear views: `php artisan view:clear`

## ✅ Testing

### Basic Functionality
- [ ] Login as admin
- [ ] Navigate to `/admin/zoning-map`
- [ ] Verify map loads correctly
- [ ] Check zone legend displays
- [ ] Verify no console errors

### Property Location
- [ ] Create a test request (if needed)
- [ ] Add property location to request
  - [ ] Enter valid coordinates
  - [ ] Enter address
  - [ ] Select zoning rule
  - [ ] Enter lot area
- [ ] Verify property saves successfully
- [ ] Check property appears on map

### DSS Evaluation
- [ ] Select request with property location
- [ ] Click "Run DSS Evaluation" button
- [ ] Verify evaluation completes
- [ ] Check evaluation results page loads
- [ ] Verify scores display (compliance & risk)
- [ ] Check violations/warnings show correctly
- [ ] Verify AI suggestion appears

### Data Verification
- [ ] Check `property_locations` table has data
- [ ] Check `dss_evaluations` table has data
- [ ] Check `evaluation_risk_assessments` table has data
- [ ] Verify relationships work correctly

## ✅ Configuration

### Zoning Rules Customization
- [ ] Review default zoning rules
- [ ] Modify rules for your city (if needed)
- [ ] Add new zones (if needed)
- [ ] Test modified rules work correctly

### Risk Factors Customization
- [ ] Review default risk factors
- [ ] Adjust weights (if needed)
- [ ] Add new risk factors (if needed)
- [ ] Test risk assessment works

### Validation Logic
- [ ] Review validation checks in `DecisionSupportService.php`
- [ ] Customize checks for your requirements
- [ ] Test custom validations

### Scoring Algorithm
- [ ] Review scoring thresholds
- [ ] Adjust if needed:
  - [ ] Compliance thresholds (currently 80%, 60%)
  - [ ] Risk thresholds (currently 30%, 50%)
- [ ] Test recommendations match expectations

## ✅ Integration

### Existing Request Workflow
- [ ] Add property location form to request view
- [ ] Add DSS evaluate button to admin request view
- [ ] Link evaluation results to request details
- [ ] Update request status based on evaluation

### Notification System
- [ ] Test notifications sent on evaluation complete
- [ ] Verify email notifications work
- [ ] Check notification content is correct

### Analytics Dashboard
- [ ] Add DSS metrics to dashboard
- [ ] Show evaluation statistics
- [ ] Display compliance trends
- [ ] Show risk factor frequency

## ✅ User Training

### Admin Users
- [ ] Train on viewing zoning map
- [ ] Train on adding property locations
- [ ] Train on running DSS evaluations
- [ ] Train on interpreting results
- [ ] Train on making decisions based on DSS

### Planning Officers
- [ ] Train on DSS workflow
- [ ] Train on evaluation reports
- [ ] Train on override procedures
- [ ] Train on adding comments

## ✅ Documentation

### Internal Documentation
- [ ] Document custom zoning rules
- [ ] Document risk factors
- [ ] Document validation logic
- [ ] Document decision-making process
- [ ] Create user manual

### Technical Documentation
- [ ] Review LANDCERT_DSS_IMPLEMENTATION.md
- [ ] Review LANDCERT_ARCHITECTURE.md
- [ ] Update with any customizations
- [ ] Document API endpoints
- [ ] Document database schema changes

## ✅ Security

### Access Control
- [ ] Verify only admins can access DSS features
- [ ] Test role-based permissions
- [ ] Check unauthorized access blocked
- [ ] Verify audit logging works

### Data Protection
- [ ] Verify input validation works
- [ ] Test SQL injection prevention
- [ ] Check XSS protection
- [ ] Verify CSRF tokens present

## ✅ Performance

### Optimization
- [ ] Test evaluation speed
- [ ] Check map loading performance
- [ ] Verify database queries optimized
- [ ] Test with multiple properties

### Caching
- [ ] Implement caching for zoning rules
- [ ] Cache risk factors
- [ ] Cache map data (if needed)
- [ ] Test cache invalidation

## ✅ Production Deployment

### Pre-deployment
- [ ] Run all tests
- [ ] Check no console errors
- [ ] Verify all features work
- [ ] Backup database
- [ ] Document rollback plan

### Deployment
- [ ] Deploy code to production
- [ ] Run migrations on production
- [ ] Seed production data
- [ ] Configure Google Maps API
- [ ] Build production assets
- [ ] Clear production cache

### Post-deployment
- [ ] Test production site
- [ ] Verify map loads
- [ ] Test DSS evaluation
- [ ] Check logs for errors
- [ ] Monitor performance

## ✅ Monitoring

### System Health
- [ ] Set up error monitoring
- [ ] Monitor API usage (Google Maps)
- [ ] Track evaluation performance
- [ ] Monitor database size
- [ ] Set up alerts

### Usage Metrics
- [ ] Track number of evaluations
- [ ] Monitor approval rates
- [ ] Track common violations
- [ ] Measure processing time
- [ ] Analyze risk patterns

## ✅ Maintenance

### Regular Tasks
- [ ] Review evaluation accuracy
- [ ] Update zoning rules as needed
- [ ] Adjust risk factors
- [ ] Update validation logic
- [ ] Review and optimize queries

### Periodic Reviews
- [ ] Monthly: Review evaluation metrics
- [ ] Quarterly: Update documentation
- [ ] Annually: Review and update zoning rules
- [ ] As needed: Train new users

## 🎯 Success Criteria

- [ ] All evaluations complete in < 5 seconds
- [ ] Map loads in < 3 seconds
- [ ] 95%+ evaluation accuracy
- [ ] Zero critical errors in logs
- [ ] User satisfaction > 80%
- [ ] Processing time reduced by 50%

## 📞 Support Contacts

- **Technical Issues**: [Your IT contact]
- **Zoning Questions**: [Planning department contact]
- **System Admin**: [Admin contact]
- **Documentation**: See LANDCERT_DSS_IMPLEMENTATION.md

## 📝 Notes

Use this space for deployment-specific notes:

```
Date: _______________
Deployed by: _______________
Version: _______________
Notes:




```

---

**Status**: [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Verified

**Completion Date**: _______________

**Verified By**: _______________
