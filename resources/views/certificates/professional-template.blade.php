<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Land Use Certificate - {{ $certificateNumber }}</title>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        body {
            font-family: 'Times New Roman', serif;
            background: white;
            color: #000;
            line-height: 1.6;
        }
        .certificate {
            width: 100vw;
            height: 100vh;
            padding: 15mm 25mm;
            box-sizing: border-box;
            position: relative;
            background: #ffffff;
        }
        
        @media print {
            .certificate {
                width: 297mm;
                height: 210mm;
            }
        }
        
        /* Decorative Border */
        .certificate::before {
            content: '';
            position: absolute;
            top: 10mm;
            left: 15mm;
            right: 15mm;
            bottom: 10mm;
            border: 3px solid #1e40af;
            border-radius: 8px;
            z-index: -1;
        }
        
        .certificate::after {
            content: '';
            position: absolute;
            top: 12mm;
            left: 18mm;
            right: 18mm;
            bottom: 12mm;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            z-index: -1;
        }
        
        /* Header Section */
        .header {
            text-align: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #1e40af;
        }
        
        .logos-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 0 30px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            max-width: 80px;
            max-height: 80px;
        }
        
        .header-text {
            text-align: center;
        }
        
        .republic {
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
            margin: 3px 0;
            letter-spacing: 1px;
        }
        
        .office-name {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin: 2px 0;
            letter-spacing: 0.5px;
        }
        
        .office-main {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            margin: 5px 0;
            letter-spacing: 1px;
        }
        
        .address {
            font-size: 12px;
            color: #374151;
            margin: 8px 0;
            font-style: italic;
        }
        
        /* Certificate ID */
        .cert-id {
            position: absolute;
            top: 20mm;
            right: 30mm;
            font-size: 10px;
            color: #6b7280;
            font-weight: bold;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
        }
        
        /* Title Section */
        .title-section {
            text-align: center;
            margin: 10px 0 8px 0;
        }
        
        .main-title {
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #1e40af;
            margin: 0;
            text-transform: uppercase;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .subtitle {
            font-size: 13px;
            color: #6b7280;
            margin-top: 6px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        /* Content Section */
        .content {
            margin: 8px 0;
            text-align: justify;
            font-size: 12px;
            line-height: 1.4;
            color: #374151;
        }
        
        .content p {
            margin: 6px 0;
            text-indent: 30px;
        }
        
        .applicant-name {
            font-weight: bold;
            color: #1e40af;
            font-size: 16px;
            text-decoration: underline;
            text-decoration-color: #3b82f6;
        }
        
        .project-details {
            font-weight: bold;
            color: #dc2626;
        }
        
        /* Details Section */
        .details-section {
            margin: 8px 0;
            background: #f8fafc;
            padding: 8px 15px;
            border-radius: 8px;
            border-left: 4px solid #1e40af;
        }
        
        .details-table {
            width: 100%;
            margin: 0;
            border-collapse: collapse;
        }
        
        .details-table td {
            padding: 4px 0;
            font-size: 11px;
            vertical-align: top;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .details-table tr:last-child td {
            border-bottom: none;
        }
        
        .details-table .label {
            width: 180px;
            font-weight: bold;
            color: #374151;
        }
        
        .details-table .colon {
            width: 20px;
            text-align: center;
            color: #6b7280;
        }
        
        .details-table .value {
            color: #1f2937;
            font-weight: 500;
        }
        
        /* Issue Date */
        .issue-date {
            margin: 8px 0;
            text-align: justify;
            font-size: 12px;
            color: #374151;
        }
        
        .issue-date p {
            text-indent: 30px;
            margin: 0;
        }
        
        .date-highlight {
            font-weight: bold;
            color: #dc2626;
        }
        
        /* Signature Section */
        .signature-section {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .signature-left {
            text-align: left;
            flex: 1;
        }
        
        .signature-right {
            text-align: center;
            flex: 1;
        }
        
        .signature-line {
            width: 200px;
            height: 2px;
            background: #374151;
            margin: 30px auto 10px auto;
        }
        
        .signature-name {
            font-weight: bold;
            font-size: 16px;
            color: #1e40af;
            margin: 5px 0;
            text-transform: uppercase;
        }
        
        .signature-title {
            font-size: 13px;
            color: #374151;
            margin: 2px 0;
            font-weight: 500;
        }
        
        .signature-credentials {
            font-size: 12px;
            color: #6b7280;
            margin: 2px 0;
            font-style: italic;
        }
        
        /* Footer */
        .footer {
            position: absolute;
            bottom: 15mm;
            left: 25mm;
            right: 25mm;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-address {
            font-size: 11px;
            color: #6b7280;
            margin: 5px 0;
        }
        
        .footer-contact {
            font-size: 10px;
            color: #9ca3af;
            margin: 2px 0;
        }
        
        /* Watermark */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(30, 64, 175, 0.03);
            font-weight: bold;
            z-index: -1;
            pointer-events: none;
            letter-spacing: 10px;
        }
        
        /* Security Features */
        .security-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: transparent;
            z-index: -2;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- Security Pattern -->
        <div class="security-pattern"></div>
        
        <!-- Watermark -->
        <div class="watermark">CDRRMO</div> 
        
        <!-- Certificate ID -->
        <div class="cert-id">
            CERT-{{ $certificateNumber }}
        </div>
        
        <!-- Header -->
        <div class="header">
            <div class="logos-section">
                <div class="logo">
                                        <img src="{{ asset('/images/ilagan.png') }}" alt="City of Ilagan Logo">

                </div>
                <div class="header-text">
                    <div class="republic">Republic of the Philippines</div>
                    <div class="office-name">CITY OF ILAGAN</div>
                    <div class="office-main">CITY PLANNING </div>
                    <div class="office-main">DEVELOPMENT OFFICE</div>
                    <div class="address">Ground Floor,City Hall Bldg, City of Ilagan, Isabela</div>
                </div>
                <div class="logo">
                </div>
            </div>
        </div>
        
        <!-- Title -->
        <div class="title-section">
            <h1 class="main-title">CERTIFICATION</h1>
            <div class="subtitle">Land Use Compliance Certificate</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p>This is to <strong>CERTIFY</strong> that <span class="applicant-name">{{ strtoupper($applicantName) }}</span> has satisfactorily complied with all land use requirements, zoning regulations, and disaster risk reduction standards of the City Disaster Risk Reduction and Management Office for the property located at <span class="project-details">{{ $projectLocation }}</span>.</p>
            
            <p>The proposed <span class="project-details">{{ $projectType }}</span> project has been evaluated and found to be in accordance with the existing land use plan, zoning ordinances, and planning &  development guidelines of the City of Ilagan.</p>
        </div>
        
        <!-- Details -->
        <div class="details-section">
            <table class="details-table">
                <tr>
                    <td class="label">Locational Clearance</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $projectType }}</td>
                </tr>
                <tr>
                    <td class="label">Project Nature</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $projectNature }}</td>
                </tr>
                <tr>
                    <td class="label">Project Location</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $projectLocation }}</td>
                </tr>
                <tr>
                    <td class="label">Lot Area</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $lotArea }} square meters</td>
                </tr>
                @if($projectCost)
                <tr>
                    <td class="label">Project Cost</td>
                    <td class="colon">:</td>
                    <td class="value">₱{{ number_format($projectCost, 2) }}</td>
                </tr>
                @endif
                <tr>
                    <td class="label">Certificate Number</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $certificateNumber }}</td>
                </tr>
                @if($validUntil)
                <tr>
                    <td class="label">Valid Until</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $validUntil }}</td>
                </tr>
                @endif
            </table>
        </div>
        
        <!-- Issue Date -->
        <div class="issue-date">
            <p>Issued this <span class="date-highlight">{{ date('jS', strtotime($issuedDate)) }}</span> day of <span class="date-highlight">{{ date('F Y', strtotime($issuedDate)) }}</span> at the City of Ilagan, Isabela, Philippines.</p>
        </div>
        
        <!-- Signature -->
        <div class="signature-section">
            <div class="signature-left">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">
                    <strong>Document Control No.:</strong> {{ $certificateNumber }}<br>
                    <strong>Date Issued:</strong> {{ date('M d, Y', strtotime($issuedDate)) }}
                </div>
            </div>
            
            <div class="signature-right">
                <div class="signature-line"></div>
                <div class="signature-name">ENGR. CRISANTA D. CONCEPTION, EnP</div>
                <div class="signature-title">OIC-City Planning & Development Coordinator</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-contact">
                This certificate is valid and verifiable. For verification, contact CPDO Ilagan.
            </div>
        </div>
    </div>
</body>
</html>