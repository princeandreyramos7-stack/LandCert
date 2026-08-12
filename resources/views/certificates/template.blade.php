<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{{ $certificateNumber }}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; background:#fff; }

/* ─── SHARED HEADER ─────────────────────────────────────── */
.page { padding: 30px 40px; }

.header-bar {
    background: linear-gradient(90deg, #0066b3 0%, #0099d6 60%, #00bcd4 100%);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
}
.header-bar .logos { display:flex; align-items:center; gap:10px; }
.header-bar .logo-img { width:55px; height:55px; object-fit:contain; }
.header-bar .header-text { color:#fff; line-height:1.3; }
.header-bar .header-text .republic { font-size:9pt; }
.header-bar .header-text .city { font-size:13pt; font-weight:bold; }
.header-bar .header-text .province { font-size:9pt; }
.header-bar .header-text .office { font-size:10pt; font-weight:bold; }
.header-bar .cpd-number { color:#fff; font-size:10pt; font-weight:bold; text-align:right; }

/* ─── TUP / ZONING-CERT letter style ────────────────────── */
.letter-body { padding: 20px 0 0; }
.letter-date { margin-bottom: 18px; font-size:11pt; }
.letter-to { margin-bottom: 16px; }
.letter-to .name { font-weight: bold; font-size: 12pt; }
.letter-to .addr { font-size: 11pt; }
.salutation { margin-bottom: 14px; }
.body-para { text-align:justify; line-height:1.7; margin-bottom:12px; font-size:11pt; }
.conditions { margin: 8px 0 12px 16px; }
.conditions li { margin-bottom:6px; line-height:1.6; font-size:10.5pt; }
.close-phrase { margin: 20px 0 6px; }
.sign-block { margin-top: 30px; }
.sign-name { font-weight:bold; font-size:11pt; border-top:1px solid #000; display:inline-block; padding-top:4px; min-width:220px; }
.sign-title { font-size:10.5pt; }
.footer-data { margin-top:30px; display:table; width:100%; font-size:10.5pt; }
.footer-left { display:table-cell; width:45%; vertical-align:top; }
.footer-right { display:table-cell; width:55%; vertical-align:top; }
.footer-data .row { margin-bottom:3px; }
.footer-data .label { display:inline-block; min-width:75px; }

/* ─── TITLE ─────────────────────────────────────────────── */
.doc-title {
    text-align:center;
    margin: 18px 0 14px;
    background:#ffff00;
    display:inline-block;
    padding: 2px 10px;
    font-weight:bold;
    font-size:13pt;
    text-decoration:underline;
    letter-spacing:1px;
}
.title-wrap { text-align:center; }

/* ─── SUP TABLE style ───────────────────────────────────── */
.info-table { width:100%; border-collapse:collapse; margin:14px 0; font-size:11pt; }
.info-table td { border:1px solid #000; padding:7px 10px; vertical-align:top; }
.info-table .col-header { font-weight:bold; text-align:center; background:#fff; }
.info-table .col-value  { font-weight:bold; text-align:center; }
.info-table .decision-granted { font-weight:bold; }

.app-row { display:table; width:100%; margin-bottom:8px; font-size:11pt; }
.app-col { display:table-cell; width:50%; }
.app-label { font-weight:normal; }
.app-value { }

.conditions-sup { margin: 6px 0 8px 0; font-size:10.5pt; line-height:1.65; }
.conditions-sup li { margin-bottom:3px; list-style:none; padding-left:0; }

.sign-row { display:table; width:100%; margin-top:30px; }
.sign-left  { display:table-cell; width:50%; vertical-align:bottom; }
.sign-right { display:table-cell; width:50%; vertical-align:bottom; text-align:right; }
.sign-label { font-size:9.5pt; color:#555; margin-bottom:4px; }
.sign-name-block { display:inline-block; border-top:1px solid #000; padding-top:3px; min-width:210px; text-align:left; }
.sign-name-bold { font-weight:bold; font-size:11pt; }
.sign-title-text { font-size:10pt; }

/* ─── ZONING CERT ────────────────────────────────────────── */
.zc-title {
    text-align:center;
    font-size:14pt;
    font-weight:bold;
    text-decoration:underline;
    background:#ffff00;
    display:inline-block;
    padding:2px 14px;
    margin: 22px auto 22px;
    letter-spacing:1px;
}
.zc-body { text-align:justify; line-height:1.8; font-size:11pt; margin-bottom:14px; }
</style>
</head>
<body>

{{-- ══════════════════════════════════════════════════════════════
     TUP — Temporary Use Permit  (letter format)
     ══════════════════════════════════════════════════════════════ --}}
@if($projectType === 'TUP')
<div class="page">

    {{-- Header --}}
    <div class="header-bar">
        <div class="logos">
            <img class="logo-img" src="{{ public_path('images/Ilagan.png') }}" alt="Ilagan Seal">
            <div class="header-text">
                <div class="republic">Republic of the Philippines</div>
                <div class="city">CITY OF ILAGAN</div>
                <div class="province">Province of Isabela</div>
                <div class="office">CITY PLANNING AND DEVELOPMENT OFFICE</div>
            </div>
        </div>
        <div>
            <div class="cpd-number">{{ $controlNumber }}</div>
            <img class="logo-img" src="{{ public_path('images/Ilagan.png') }}" alt="City Seal" style="display:block;margin-top:4px;">
        </div>
    </div>

    <div class="letter-body">
        <div class="letter-date">{{ $issueDate }}</div>

        <div class="letter-to">
            <div class="name">{{ $applicantName }}</div>
            <div class="addr">{{ $projectAddress }}</div>
        </div>

        <div class="salutation">Dear {{ explode(' ', trim($applicantName))[count(explode(' ', trim($applicantName)))-1] }}:</div>

        <p class="body-para">
            This has reference to your application for Locational Clearance of your
            <strong>{{ strtoupper($projectDescription) }}</strong> project located at {{ $projectAddress }}.
        </p>

        <p class="body-para">
            Relative thereto, this office interpose no objection to the operation of the subject
            <strong>{{ strtoupper($projectDescription) }}</strong> project wherein no violation had been committed.
            In view thereof, we are granting you <strong>Temporary Use Permit (TUP)</strong> valid for a period of
            one (1) year unless sooner revoked by this office on valid grounds. This TUP shall be subject to
            the following conditions which have to be strictly complied.
        </p>

        <ol class="conditions">
            <li>All conditions stipulated herein form part of this decision and are subject to monitoring.</li>
            <li>Non-compliance therewith shall be a cause for cancellation or legal actions.</li>
            <li>The applicable requirements of gov't. agencies and applicable provisions of existing laws shall be complied with.</li>
            <li>No activity other than that applied for shall be conducted within the project site.</li>
            <li>No major expansions, alterations and/or improvement shall be introduced without prior clearance from this office.</li>
            <li>This decision shall not be construed as a certification of HSRC to the ownership by the applicant of the parcel of land subject to this decision.</li>
            <li>Any misrepresentation, false statement or allegations materials to the issuance of this decision shall be a sufficient cause for its revocation.</li>
            <li><strong>Additional Conditions:</strong><br>
                a. Provision as to setback, yard requirement, bulk, easement, are height and other restrictions shall strictly comply with the requirements of the National Building Code and other related laws.<br>
                b. This decision shall be considered automatically revoked if project is not commenced within one (1) year from date of issue of this decision.<br>
                c. For other conditions, please see the reverse side.
            </li>
        </ol>

        <p class="close-phrase">Please be guided accordingly.</p>
        <p>Very truly yours,</p>

        <div class="sign-block" style="margin-top:40px;">
            <div class="sign-name">ENGR. CRISANTA D. CONCEPCION, EnP</div><br>
            <div class="sign-title">City Planning &amp; Dev't. Coordinator/<br>Zoning Administrator</div>
        </div>

        <div class="footer-data">
            <div class="footer-left">
                <div class="row"><span class="label">O.R. No.  :</span> {{ $orNumber }}</div>
                <div class="row"><span class="label">Date</span> : {{ $issueDate }}</div>
                <div class="row"><span class="label">Amount</span> : {{ $paymentAmount }}</div>
            </div>
            <div class="footer-right">
                <div class="row"><span class="label">Application No :</span> TPZ-{{ now()->format('m-y') }}-{{ str_pad($request->id, 4, '0', STR_PAD_LEFT) }}</div>
                <div class="row"><span class="label">Decision No   :</span> TUP-{{ now()->format('m-y') }}-{{ $controlNumber }}</div>
                <div class="row"><span class="label">Date Issued   :</span> {{ $issueDate }}</div>
                <div class="row"><span class="label">Expiry Date   :</span> {{ $certificate->issued_at->addYear()->format('F d, Y') }}</div>
            </div>
        </div>
    </div>
</div>
@endif

{{-- ══════════════════════════════════════════════════════════════
     SUP — Special Use Permit  (table format)
     ══════════════════════════════════════════════════════════════ --}}
@if($projectType === 'SUP')
<div class="page">

    {{-- Header --}}
    <div class="header-bar">
        <div class="logos">
            <img class="logo-img" src="{{ public_path('images/Ilagan.png') }}" alt="Ilagan Seal">
            <div class="header-text">
                <div class="republic">Republic of the Philippines</div>
                <div class="city">CITY OF ILAGAN</div>
                <div class="province">Province of Isabela</div>
                <div class="office">CITY PLANNING AND DEVELOPMENT OFFICE</div>
            </div>
        </div>
        <div>
            <div class="cpd-number">{{ $controlNumber }}</div>
            <img class="logo-img" src="{{ public_path('images/Ilagan.png') }}" alt="City Seal" style="display:block;margin-top:4px;">
        </div>
    </div>

    <div class="title-wrap">
        <span class="doc-title">DECISION ON ZONING<br>SPECIAL USE PERMIT</span>
    </div>

    {{-- Application / Decision numbers --}}
    <div class="app-row" style="margin-top:10px;">
        <div class="app-col">
            Application No. : TPZ-{{ now()->format('m-y') }}-{{ str_pad($request->id, 4, '0', STR_PAD_LEFT) }}<br>
            Date Received &nbsp;: {{ $issueDate }}
        </div>
        <div class="app-col" style="text-align:right;">
            Decision No. : SUP-{{ now()->format('m-y') }}-{{ $controlNumber }}<br>
            Date Issued &nbsp;&nbsp;: {{ $issueDate }}
        </div>
    </div>

    {{-- Main info table --}}
    <table class="info-table">
        <tr>
            <td class="col-header" style="width:50%;">NAME OF APPLICANT:</td>
            <td class="col-header" style="width:50%;">NAME OF CORPORATION:</td>
        </tr>
        <tr>
            <td class="col-value">{{ $applicantName }}</td>
            <td class="col-value">{{ $corporationName ?: '—' }}</td>
        </tr>
        <tr>
            <td class="col-header">ADDRESS:</td>
            <td class="col-header">ADDRESS:</td>
        </tr>
        <tr>
            <td class="col-value">{{ $applicantAddress }}</td>
            <td class="col-value">{{ $corporationAddress ?: $projectAddress }}</td>
        </tr>
        <tr>
            <td class="col-header">TYPE OF PROJECT:</td>
            <td class="col-header">AREA AND LOCATION:</td>
        </tr>
        <tr>
            <td class="col-value">{{ $projectDescription }}</td>
            <td class="col-value">{{ $projectAddress }}</td>
        </tr>
        <tr>
            <td class="col-header">DECISION GRANTED:</td>
            <td class="col-header">RIGHT OVER LAND:</td>
        </tr>
        <tr>
            <td class="col-value decision-granted">SUP GRANTED with conditions</td>
            <td class="col-value"></td>
        </tr>
    </table>

    {{-- Conditions --}}
    <p style="font-weight:bold;margin-bottom:4px;">Conditions:</p>
    <ul class="conditions-sup">
        <li>/x/ All conditions stipulated herein form part of this decision and are subject to monitoring</li>
        <li>/x/ Non-compliance therewith shall be a cause for cancellation or legal action.</li>
        <li>/x/ The applicable requirements of gov't. agencies and applicable provision of existing laws shall &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;be complied with.</li>
        <li>/x/ No activity other than that applied for shall be conducted within the project site.</li>
        <li>/x/ No major expansion, alteration and/or improvement shall be introduced without prior clearance from this office.</li>
        <li>/x/ This decision shall not be construed as a certification of City Gov't. of Ilagan as to the &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ownership by the applicant of the parcel of land subject of this decision.</li>
        <li>/x/ Any misrepresentation. False statement or allegations materials as to the issuance of this &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;decision shall be sufficient cause of its revocation.</li>
    </ul>
    <p style="font-weight:bold;margin-bottom:3px;">Additional Conditions:</p>
    <ul class="conditions-sup">
        <li>/x/ Provision as to setback yard requirements, bulk easement, area height and other restrictions &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;strictly conform with the requirements of the National Building Code and other related laws.</li>
        <li>/x/ This decision shall be considered automatically revoked if project is not commenced &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;within one (1) year from date of issue of this decision.</li>
        <li>/x/ For other conditions please see the reverse side.</li>
    </ul>

    {{-- Signatures --}}
    <div class="sign-row">
        <div class="sign-left">
            <div class="sign-label">Prepared and Evaluated by:</div>
            <div class="sign-name-block" style="margin-top:28px;">
                <div class="sign-name-bold">MARY JANE P. BULAUAN</div>
                <div class="sign-title-text">Zoning Officer IV</div>
            </div>
        </div>
        <div class="sign-right">
            <div class="sign-name-block" style="margin-top:28px;">
                <div class="sign-name-bold">ENGR. CRISANTA D. CONCEPCION, EnP</div>
                <div class="sign-title-text">OIC- City Planning &amp; Dev't. Coordinator/<br>Zoning Administrator</div>
            </div>
        </div>
    </div>

    {{-- Footer --}}
    <div class="footer-data" style="margin-top:22px;">
        <div class="footer-left">
            <div class="row">OR No. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {{ $orNumber }}</div>
            <div class="row">Date Issued : {{ $issueDate }}</div>
            <div class="row">Amount Paid : {{ $paymentAmount }}</div>
        </div>
    </div>
</div>
@endif

{{-- ══════════════════════════════════════════════════════════════
     Zoning Clearance  (certification letter format)
     ══════════════════════════════════════════════════════════════ --}}
@if($projectType === 'Zoning Clearance')
<div class="page">

    {{-- Header --}}
    <div class="header-bar">
        <div class="logos">
            <img class="logo-img" src="{{ public_path('images/Ilagan.png') }}" alt="Ilagan Seal">
            <div class="header-text">
                <div class="republic">Republic of the Philippines</div>
                <div class="city">CITY OF ILAGAN</div>
                <div class="province">Province of Isabela</div>
                <div class="office">CITY PLANNING AND DEVELOMENT OFFICE</div>
            </div>
        </div>
        <div>
            <div class="cpd-number">{{ $controlNumber }}</div>
            <img class="logo-img" src="{{ public_path('images/Ilagan.png') }}" alt="City Seal" style="display:block;margin-top:4px;">
        </div>
    </div>

    <div style="text-align:center;margin:24px 0 20px;">
        <span class="zc-title">ZONING CERTIFICATION</span>
    </div>

    <p class="zc-body">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is to certify that parcel of land, lot no. _____, under Tax Declaration
        No. _____________, registered under the name of <strong>{{ $applicantName }}</strong>,
        with an area of _____ sq.m., located at {{ $projectAddress }} was verified to fall within the
        <strong>___________________</strong> as per Article 5, section 12.6 of the Comprehensive Land Use Plan
        and the Zoning Ordinance of City of Ilagan, Isabela approved by the Sangguniang Panlalawigan of Isabela
        through SP Resolution No. 160 dated March 05, 2019.
    </p>

    <p class="zc-body">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This certification is issued to <strong>{{ $applicantName }}</strong>, for whatever purpose it may serve.
    </p>

    <p class="zc-body" style="margin-top:10px;">
        City of Ilagan, Isabela, {{ $issueDate }}.
    </p>

    <div style="text-align:right; margin-top:40px; margin-right:40px;">
        <div class="sign-name-block">
            <div class="sign-name-bold">Engr. CRISANTA D. CONCEPCION, EnP</div>
            <div class="sign-title-text">City Planning &amp; Dev't. Coordinator/<br>Zoning Administrator</div>
        </div>
    </div>

    <div class="footer-data" style="margin-top:40px;">
        <div class="footer-left">
            <div class="row">OR. No. : {{ $orNumber }}</div>
            <div class="row">Amount &nbsp;: {{ $paymentAmount }}</div>
            <div class="row">Date Issued: {{ $issueDate }}</div>
        </div>
    </div>
</div>
@endif

{{-- Fallback for unknown project types --}}
@if(!in_array($projectType, ['TUP','SUP','Zoning Clearance']))
<div class="page">
    <div class="header-bar">
        <div class="logos">
            <img class="logo-img" src="{{ public_path('images/Ilagan.png') }}" alt="Ilagan Seal">
            <div class="header-text">
                <div class="republic">Republic of the Philippines</div>
                <div class="city">CITY OF ILAGAN</div>
                <div class="province">Province of Isabela</div>
                <div class="office">CITY PLANNING AND DEVELOPMENT OFFICE</div>
            </div>
        </div>
        <div class="cpd-number">{{ $controlNumber }}</div>
    </div>
    <div style="padding:30px 0; text-align:center;">
        <p style="font-size:14pt; font-weight:bold; margin-bottom:20px;">CERTIFICATE</p>
        <p style="font-size:12pt;">{{ $projectType }}</p>
        <p style="margin-top:20px;">Issued to: <strong>{{ $applicantName }}</strong></p>
        <p>OR No.: {{ $orNumber }} | Amount: {{ $paymentAmount }}</p>
        <p>Date: {{ $issueDate }}</p>
        <p>Control No.: {{ $controlNumber }}</p>
    </div>
</div>
@endif

</body>
</html>
