# GIS & Zoning System - User Guide

## Overview
The GIS & Zoning system provides interactive mapping and automated zoning compliance checks for land certification requests in Ilagan City, Isabela, Philippines.

---

## 🗺️ Accessing the Zoning Map

### Step 1: Login as Admin
1. Navigate to your application URL
2. Login with admin credentials
3. You'll see the admin sidebar on the left

### Step 2: Open Zoning Map
1. In the admin sidebar, find **"GIS & Zoning"** section
2. Click on **"Zoning Map"**
3. The interactive map will load, centered on Ilagan City

---

## 📍 Using the Interactive Map

### Map Features
- **Pan**: Click and drag to move around the map
- **Zoom**: Use mouse wheel or +/- buttons to zoom in/out
- **Markers**: Property locations are shown as markers on the map
- **Restricted Area**: Map is limited to Ilagan City boundaries

### Viewing Property Details
1. Click on any property marker on the map
2. The right sidebar will display:
   - Property address
   - Zoning classification
   - Lot area (in square meters)
   - GPS coordinates
   - Barangay and district (if available)

### Map Statistics
The right sidebar shows:
- Total number of properties
- Number of zoning rules
- Current location (Ilagan City)

---

## 🏗️ Decision Support System (DSS) Evaluation

### What is DSS?
The Decision Support System automatically evaluates land certification requests against:
- **Zoning Rules**: Checks if the property complies with zoning regulations
- **Risk Factors**: Assesses environmental and regulatory risks
- **Compliance Score**: Generates a 0-100 score for approval recommendation

### How to Run DSS Evaluation

#### Method 1: From Request Details
1. Go to **Admin Panel → Requests**
2. Click **"View"** on any request
3. Click the **"Evaluate with DSS"** button
4. System will analyze the request and show results

#### Method 2: Direct Access
1. Navigate to `/admin/dss-evaluation/{request_id}`
2. Replace `{request_id}` with the actual request ID

### Understanding DSS Results

#### Compliance Score (0-100)
- **80-100**: High compliance - Recommended for approval
- **60-79**: Moderate compliance - Review required
- **0-59**: Low compliance - Likely rejection

#### Risk Score (0-100)
- **0-30**: Low risk
- **31-60**: Moderate risk
- **61-100**: High risk

#### Evaluation Components

**1. Zoning Validation**
- Checks if property location matches allowed zoning
- Verifies lot area meets minimum requirements
- Validates setback requirements
- Checks building height restrictions

**2. Risk Assessment**
- Environmental risks (flood zones, protected areas)
- Regulatory compliance
- Infrastructure availability
- Safety considerations

**3. AI Recommendations**
- Automated approval/rejection suggestion
- Specific issues identified
- Required actions or documentation
- Compliance improvement suggestions

---

## 📊 Zoning Rules in the System

### Current Zoning Classifications

1. **Residential Zone (R-1)**
   - Minimum lot area: 120 sqm
   - Max building height: 10m
   - Front setback: 3m
   - Side setback: 1.5m

2. **Commercial Zone (C-1)**
   - Minimum lot area: 200 sqm
   - Max building height: 15m
   - Front setback: 5m
   - Side setback: 2m

3. **Industrial Zone (I-1)**
   - Minimum lot area: 500 sqm
   - Max building height: 20m
   - Front setback: 10m
   - Side setback: 5m

4. **Agricultural Zone (A-1)**
   - Minimum lot area: 1000 sqm
   - Max building height: 8m
   - Front setback: 5m
   - Side setback: 3m

5. **Mixed-Use Zone (M-1)**
   - Minimum lot area: 150 sqm
   - Max building height: 12m
   - Front setback: 4m
   - Side setback: 2m

6. **Institutional Zone (IN-1)**
   - Minimum lot area: 300 sqm
   - Max building height: 15m
   - Front setback: 6m
   - Side setback: 3m

7. **Open Space/Parks (OS-1)**
   - Minimum lot area: 100 sqm
   - Max building height: 5m
   - Front setback: 2m
   - Side setback: 1m

---

## 🎯 Risk Factors Evaluated

### Environmental Risks
1. **Flood Prone Area** (Weight: 9/10)
   - Properties in low-elevation flood zones
   - Poor drainage areas

2. **Seismic Risk Zone** (Weight: 8/10)
   - Areas with earthquake vulnerability
   - Fault line proximity

3. **Landslide Prone Area** (Weight: 9/10)
   - Steep slopes
   - Unstable soil conditions

### Regulatory Risks
4. **Protected Area Buffer** (Weight: 10/10)
   - Within 100m of protected areas
   - Environmental restrictions

5. **Road Right-of-Way** (Weight: 7/10)
   - Encroachment on public roads
   - Access issues

### Infrastructure Risks
6. **No Water Supply** (Weight: 6/10)
   - Lack of water infrastructure
   - Distance from water source

7. **No Power Connection** (Weight: 5/10)
   - No electrical infrastructure
   - Distance from power grid

8. **Poor Road Access** (Weight: 7/10)
   - Unpaved or narrow roads
   - Limited accessibility

---

## 🔄 Workflow Integration

### Complete Request Processing Flow

1. **User Submits Request**
   - Fills out land certification form
   - Provides property location details

2. **Admin Reviews Request**
   - Views request in admin panel
   - Checks basic information

3. **DSS Evaluation** (Optional but Recommended)
   - Click "Evaluate with DSS"
   - System performs automated analysis
   - Generates compliance and risk scores

4. **Admin Decision**
   - Reviews DSS recommendations
   - Considers additional factors
   - Approves or rejects request

5. **Automated Actions**
   - Email notifications sent
   - Status history recorded
   - Audit logs created

---

## 🛠️ Admin Tasks

### Adding New Properties to Map
Properties are automatically added when:
- A new request is submitted with location data
- Admin creates a property location record

### Viewing All Properties
1. Go to **GIS & Zoning → Zoning Map**
2. All registered properties appear as markers
3. Click any marker to view details

### Checking Zoning Compliance
1. Open a request in admin panel
2. Click "Evaluate with DSS"
3. Review the compliance report
4. Check specific violations or issues

---

## 📱 Map Controls

### Navigation
- **Zoom In**: Click `+` button or scroll up
- **Zoom Out**: Click `-` button or scroll down
- **Pan**: Click and drag the map
- **Reset View**: Refresh the page to return to Ilagan City center

### Map Layers
- **Base Map**: OpenStreetMap (free, no API key required)
- **Property Markers**: Blue pins showing property locations
- **City Hall Reference**: Special marker for Ilagan City Hall

---

## 🔍 Troubleshooting

### Map Not Loading
- Check internet connection
- Refresh the page
- Clear browser cache
- Ensure JavaScript is enabled

### No Properties Showing
- Verify properties have valid GPS coordinates
- Check if properties are within Ilagan City bounds
- Ensure database has property location records

### DSS Evaluation Not Working
- Verify request has property location data
- Check if zoning rules are seeded in database
- Ensure risk factors are configured
- Check server logs for errors

---

## 💡 Best Practices

### For Accurate Evaluations
1. **Complete Property Data**: Ensure all location fields are filled
2. **Accurate Coordinates**: Use precise GPS coordinates
3. **Correct Zoning**: Verify the property's zoning classification
4. **Regular Updates**: Keep zoning rules and risk factors current

### For Efficient Processing
1. **Use DSS First**: Run automated evaluation before manual review
2. **Review Recommendations**: Consider DSS suggestions seriously
3. **Document Decisions**: Add notes explaining approval/rejection
4. **Monitor Patterns**: Track common compliance issues

---

## 📞 Support

### Need Help?
- Check system documentation in project root
- Review `LANDCERT_DSS_IMPLEMENTATION.md` for technical details
- Contact system administrator for access issues
- Report bugs or issues to development team

---

## 🔐 Security Notes

- Only admin users can access GIS & Zoning features
- All evaluations are logged in audit system
- Property data is protected and confidential
- Map access requires authentication

---

## 📈 Future Enhancements

Planned features:
- Drawing tools for property boundaries
- Multiple map layers (satellite, terrain)
- Batch property evaluation
- Export map data to PDF
- Mobile-responsive map interface
- Real-time property updates

---

**Last Updated**: February 24, 2026
**System Version**: LandCert DSS v1.0
**Location**: Ilagan City, Isabela, Philippines
