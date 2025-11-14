import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';

interface NoticeData {
  applicantName: string;
  applicantAddress: string;
  applicantEmail?: string;
  applicantPhone?: string;
  respondentName: string;
  respondentAddress: string;
  respondentPincode: string;
  content: string;
  caseNumber?: string;
  caseTitle?: string;
}

// Fixed content that appears in every notice
const FIXED_NOTICE_CONTENT = `
<h3>What is Conciliation?</h3>

<p>Conciliation is a <strong>voluntary and confidential process</strong> where both parties work together, with the assistance of a <strong>neutral expert called a Conciliator</strong>, to find a mutually agreeable solution. Once both parties reach an agreement, the Conciliator issues a <strong>Conciliation Settlement Agreement</strong>, which is <strong>legally binding and enforceable</strong> just like a court decree (under <strong>Section 74 of the Arbitration and Conciliation Act, 1996</strong>).</p>

<h3>Who is a Conciliator?</h3>

<p>A Conciliator is an <strong>independent, impartial, and trained dispute resolution professional</strong>. Their role is to:</p>

<ul>
<li>Help both parties communicate clearly,</li>
<li>Suggest practical and fair solutions, and</li>
<li>Guide towards an amicable settlement.</li>
</ul>

<p>All Arbitalk Conciliators are <strong>verified professionals with legal and subject-matter expertise</strong>. They <strong>remain neutral at all times and do not represent any party</strong>.</p>

<h3>How Your Conciliator is Appointed</h3>

<p>Arbitalk appoints a Conciliator from its <strong>registered panel of experts</strong> based on the nature of your case. Every conciliator follows a strict code of <strong>neutrality, fairness, and confidentiality</strong> to ensure a transparent process.</p>

<p>If, at any point, you are uncomfortable with your assigned Conciliator, you may write to the <strong>Arbitalk Review Committee</strong>. Upon review, we may assign a new conciliator if deemed appropriate.</p>

<p><strong>support@arbitalk.com</strong><br>
<strong>+91 93557 55793</strong></p>

<h3>If You Choose Not to Participate</h3>

<p>If you decide <strong>not to participate</strong> in this conciliation process, you may <strong>lose the opportunity</strong> to <strong>resolve the matter amicably and conveniently</strong> through Arbitalk.</p>

<p>In such cases, the other party may choose to proceed with <strong>formal legal action</strong> before the appropriate Courts, Tribunals, or Arbitration forums — which could be more <strong>time-consuming and expensive</strong>.</p>

<p>We encourage you to <strong>engage actively</strong> and make use of this opportunity to reach a fair and mutually beneficial settlement.</p>

<h3>Need Assistance or Have Questions?</h3>

<p>If you have any queries about the process, feel free to reach out:</p>

<p><strong>support@arbitalk.com</strong><br>
<strong>+91 90812 97778</strong></p>

<p>Our team will be happy to assist you and clarify any process-related doubts.</p>

<h3>Disclaimer</h3>

<p><strong>Arbitalk is a neutral and independent online dispute resolution institution.</strong> We are <strong>not representatives of any party</strong> involved in the dispute.</p>

<p>Our role is limited to providing <strong>administrative and technical support</strong> to facilitate an impartial and lawful settlement process, in line with the agreement between the parties.</p>

<p style="text-align: center; margin-top: 20px; font-weight: bold;"><strong>Settle Smart. Settle Online. Settle with Arbitalk.</strong></p>
`;

export async function generateNoticePDF(data: NoticeData): Promise<Buffer> {
  // Get logo as base64
  let logoBase64 = '';
  try {
    const logoPath = join(process.cwd(), 'public', 'arbitalk-logo.png');
    const logoData = readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
  } catch (error) {
    console.warn('Logo not found, using text only');
  }

  // Format date
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Generate HTML template using table structure like reference
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Legal Notice</title>
  <style>
    @page {
      size: A4;
      margin: 1cm;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      padding: 0;
      margin: 0;
      background: white;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    thead {
      display: table-header-group;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1.5px solid #000;
      padding-bottom: 12px;
    }
    
    .logo {
      margin-bottom: 6px;
    }
    
    .logo img {
      height: 28px;
      width: auto;
      max-width: 100px;
      object-fit: contain;
    }
    
    .tagline {
      font-size: 10pt;
      color: #333;
      margin: 4px 0;
    }
    
    .contact {
      font-size: 9pt;
      margin: 4px 0;
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    
    .content {
      padding-top: 20px;
    }
    
    .document-title {
      text-align: center;
      font-size: 18pt;
      font-weight: bold;
      margin: 20px 0 15px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .date-section {
      text-align: right;
      font-size: 11pt;
      margin-bottom: 20px;
    }
    
    .separator {
      border-top: 1px solid #000;
      margin: 20px 0;
    }
    
    .address-section {
      margin: 20px 0;
    }
    
    .address-label {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 8px;
    }
    
    .address-name {
      font-weight: bold;
      font-size: 11.5pt;
      margin-bottom: 5px;
      line-height: 1.5;
    }
    
    .address-details {
      font-size: 11pt;
      line-height: 1.7;
      margin-bottom: 3px;
    }
    
    .subject-section {
      font-weight: bold;
      font-size: 12pt;
      margin: 20px 0;
      line-height: 1.6;
    }
    
    .greeting {
      margin: 20px 0 15px 0;
      font-size: 11pt;
    }
    
    .fixed-content {
      margin: 15px 0;
      font-size: 11pt;
      line-height: 1.8;
      text-align: justify;
    }
    
    .fixed-content p {
      margin-bottom: 10px;
      line-height: 1.8;
      text-align: justify;
    }
    
    .fixed-content strong {
      font-weight: bold;
      color: #000;
    }
    
    .fixed-content h3 {
      font-size: 12.5pt;
      font-weight: bold;
      margin: 20px 0 10px 0;
      color: #000;
      text-align: left;
    }
    
    .fixed-content h3:first-child {
      margin-top: 0;
    }
    
    .fixed-content ul {
      margin: 8px 0 10px 20px;
      padding-left: 0;
      list-style-type: none;
    }
    
    .fixed-content li {
      margin-bottom: 6px;
      line-height: 1.7;
      position: relative;
      padding-left: 18px;
      text-align: justify;
    }
    
    .fixed-content li:before {
      content: "●";
      position: absolute;
      left: 0;
      font-weight: bold;
      font-size: 10pt;
    }
    
    .custom-content {
      margin: 15px 0;
      font-size: 11pt;
      line-height: 1.8;
      text-align: justify;
      white-space: pre-line;
    }
    
    .closing-section {
      margin-top: 30px;
    }
    
    .closing-text {
      font-size: 11pt;
      margin-bottom: 20px;
    }
    
    .signature-name {
      font-weight: bold;
      font-size: 11.5pt;
      margin-bottom: 5px;
    }
    
    .signature-title {
      font-size: 10.5pt;
    }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr>
        <td>
          <div class="header">
            ${logoBase64 ? `<div class="logo"><img src="${logoBase64}" alt="ARBITALK Logo"></div>` : ''}
            <div class="tagline">We Believe in Talk | Dispute Resolution Institution</div>
            <div class="contact">
              <span>arbitalk.com</span>
              <span>+91 77780 70439</span>
              <span>info@arbitalk.com</span>
            </div>
          </div>
        </td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="content">
          <!-- Document Title -->
          <div class="document-title">NOTICE</div>
          
          <!-- Date -->
          <div class="date-section">
            <strong>Date:</strong> ${currentDate}
          </div>
          
          <!-- Separator -->
          <div class="separator"></div>
          
          <!-- To Section -->
          <div class="address-section">
            <div class="address-label">To,</div>
            <div class="address-name">${escapeHtml(data.respondentName)}</div>
            <div class="address-details">${escapeHtml(data.respondentAddress)}</div>
            <div class="address-details">PIN: ${escapeHtml(data.respondentPincode)}</div>
          </div>
          
          <!-- From Section -->
          <div class="address-section">
            <div class="address-label">From,</div>
            <div class="address-name">${escapeHtml(data.applicantName)}</div>
            <div class="address-details">${escapeHtml(data.applicantAddress)}</div>
            ${data.applicantEmail ? `<div class="address-details">Email: ${escapeHtml(data.applicantEmail)}</div>` : ''}
            ${data.applicantPhone ? `<div class="address-details">Phone: ${escapeHtml(data.applicantPhone)}</div>` : ''}
          </div>
          
          <!-- Subject Section -->
          ${data.caseNumber || data.caseTitle ? `
          <div class="subject-section">
            Subject: ${escapeHtml(data.caseTitle || 'Legal Notice')}${data.caseNumber ? ` (Case No: ${escapeHtml(data.caseNumber)})` : ''}
          </div>
          ` : ''}
          
          <!-- Separator -->
          <div class="separator"></div>
          
          <!-- Greeting -->
          <div class="greeting">Sir/Madam,</div>
          
          <!-- Custom Content -->
          ${data.content && data.content.trim() ? `
          <div class="custom-content">${escapeHtml(data.content.trim())}</div>
          ` : ''}

          <!-- Fixed Content -->
          <div class="fixed-content">${FIXED_NOTICE_CONTENT.trim()}</div>
          
          <!-- Closing -->
          <div class="closing-section">
            <div class="closing-text">Thanking you,</div>
            <div class="signature-name">${escapeHtml(data.applicantName)}</div>
            <div class="signature-title">Applicant</div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
  `;

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    // Set content and wait for fonts/images to load
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit for any images to fully load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF with proper settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
