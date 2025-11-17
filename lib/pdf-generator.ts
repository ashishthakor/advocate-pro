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
  subject: string;
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

// Generate the complete HTML template with all data
function generateHTMLTemplate(data: NoticeData, logoBase64: string, currentDate: string): string {
  // Format To address lines
  let toAddressLines: string[] = [];
  if (data.respondentAddress) {
    const lines = data.respondentAddress.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      toAddressLines = lines;
    } else {
      toAddressLines = [data.respondentAddress.trim()];
    }
  }
  
  const toAddressHtml = toAddressLines.length > 0
    ? toAddressLines.map(line => 
        `            <div class="address-details">${escapeHtml(line.trim())}</div>`
      ).join('\n')
    : '';

  // Format From address lines
  let fromAddressLines: string[] = [];
  if (data.applicantAddress) {
    const lines = data.applicantAddress.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      fromAddressLines = lines;
    } else {
      fromAddressLines = [data.applicantAddress.trim()];
    }
  }
  
  const fromAddressHtml = fromAddressLines.length > 0
    ? fromAddressLines.map(line => 
        `            <div class="address-details">${escapeHtml(line.trim())}</div>`
      ).join('\n')
    : '';

  // Build From section with optional email and phone
  let fromSectionHtml = fromAddressHtml;
  if (data.applicantEmail) {
    fromSectionHtml += `\n            <div class="address-details">Email: ${escapeHtml(data.applicantEmail)}</div>`;
  }
  if (data.applicantPhone) {
    fromSectionHtml += `\n            <div class="address-details">Phone: ${escapeHtml(data.applicantPhone)}</div>`;
  }

  // Build the complete HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Legal Notice - Arbitalk</title>
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
    table { width: 100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1.5px solid #000;
      padding-bottom: 12px;
    }
    .logo img {
      height: 32px;
      margin-bottom: 8px;
    }
    .tagline {
      font-size: 10.5pt;
      color: #333;
      margin: 6px 0;
      font-weight: 500;
    }
    .contact {
      font-size: 9.5pt;
      margin: 8px 0;
      display: flex;
      justify-content: center;
      gap: 20px;
      color: #222;
    }
    .contact span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .content { padding-top: 20px; }
    .document-title {
      text-align: center;
      font-size: 20pt;
      font-weight: bold;
      margin: 30px 0 20px 0;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .date-section {
      text-align: right;
      font-size: 11pt;
      margin-bottom: 25px;
    }
    .separator {
      border-top: 1px solid #000;
      margin: 25px 0;
    }
    .address-section { margin: 20px 0; }
    .address-label {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 8px;
    }
    .address-name {
      font-weight: bold;
      font-size: 11.8pt;
      margin-bottom: 6px;
    }
    .address-details {
      font-size: 11pt;
      line-height: 1.7;
    }
    .subject-section {
      font-weight: bold;
      font-size: 12.5pt;
      margin: 25px 0 20px 0;
    }
    .greeting { margin: 20px 0 15px 0; }
    .fixed-content {
      margin: 15px 0;
      font-size: 11pt;
      line-height: 1.8;
      text-align: justify;
    }
    /* Support React Quill alignment classes */
    .fixed-content .ql-align-center {
      text-align: center;
    }
    .fixed-content .ql-align-right {
      text-align: right;
    }
    .fixed-content .ql-align-left {
      text-align: left;
    }
    .fixed-content .ql-align-justify {
      text-align: justify;
    }
    /* Support inline style alignments from React Quill */
    .fixed-content p[style*="text-align: center"],
    .fixed-content div[style*="text-align: center"] {
      text-align: center !important;
    }
    .fixed-content p[style*="text-align: right"],
    .fixed-content div[style*="text-align: right"] {
      text-align: right !important;
    }
    .fixed-content p[style*="text-align: left"],
    .fixed-content div[style*="text-align: left"] {
      text-align: left !important;
    }
    .fixed-content p { margin-bottom: 12px; }
    .fixed-content ul {
      margin: 12px 0 15px 20px;
      padding-left: 0;
      list-style-type: none;
    }
    .fixed-content li {
      margin-bottom: 10px;
      line-height: 1.8;
      position: relative;
      padding-left: 22px;
      text-align: justify;
    }
    .fixed-content li:before {
      content: "•";
      position: absolute;
      left: 0;
      font-weight: bold;
      color: #000;
      font-size: 14pt;
      top: -4px;
    }
    .closing-section { margin-top: 40px; }
    .closing-text { margin-bottom: 25px; }
    .signature-name {
      font-weight: bold;
      font-size: 12pt;
    }
    .signature-title { font-size: 11pt; color: #333; }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr>
        <td>
          <div class="header">
            <div class="logo">
              <img src="${logoBase64 || '/public/arbitalk-logo.png'}" alt="ARBITALK Logo">
            </div>
            <div class="tagline">We Believe in Talk | Dispute Resolution Institution</div>
            <div class="contact">
              <span>🌐 arbitalk.com</span>
              <span>✉️ info@arbitalk.com</span>
              <span>📞 +91 77780 70439</span>
            </div>
          </div>
        </td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="content">
          <div class="date-section">
            <strong>Date:</strong> ${currentDate}
          </div>

          <!-- To -->
          <div class="address-section">
            <div class="address-label">To,</div>
            <div class="address-name">${escapeHtml(data.respondentName)}</div>
${toAddressHtml}
            <div class="address-details">PIN: ${escapeHtml(data.respondentPincode)}</div>
          </div>

          <!-- From -->
          <div class="address-section">
            <div class="address-label">From,</div>
            <div class="address-name">${escapeHtml(data.applicantName)}</div>
${fromSectionHtml}
          </div>

          <!-- Subject -->
          <div class="subject-section">
            Subject: ${escapeHtml(data.subject)}
          </div>

          <div class="separator"></div>

          <!-- Greeting -->
          <div class="greeting">Sir/Madam,</div>

          <!-- Main Content -->
          <div class="fixed-content">${data.content}</div>

          <!-- Closing -->
          <div class="closing-section">
            <div class="closing-text">Thanking you,</div>
            <br><br>
            <div class="signature-name">${escapeHtml(data.applicantName)}</div>
            <div class="signature-title">${escapeHtml(data.applicantAddress.split('\n')[0] || '')}</div>
          </div>

          <!-- Static Conciliation Information - Page 1 -->
          <div style="page-break-before: always; margin-top: 40px;">
            <h3 style="font-size: 13pt; font-weight: bold; margin-bottom: 15px; margin-top: 20px;">What is Conciliation?</h3>
            <p style="margin-bottom: 15px; line-height: 1.8;">
              Conciliation is a <strong>voluntary and confidential process</strong> where both parties work together, with the assistance of a <strong>neutral expert called a Conciliator</strong>, to find a mutually agreeable solution. Once both parties reach an agreement, the Conciliator issues a <strong>Conciliation Settlement Agreement</strong>, which is <strong>legally binding and enforceable</strong> just like a court decree (under <strong>Section 74 of the Arbitration and Conciliation Act, 1996</strong>).
            </p>

            <h3 style="font-size: 13pt; font-weight: bold; margin-bottom: 15px; margin-top: 25px;">Who is a Conciliator?</h3>
            <p style="margin-bottom: 12px; line-height: 1.8;">
              A Conciliator is an <strong>independent, impartial, and trained dispute resolution professional</strong>. Their role is to:
            </p>
            <ul style="margin: 12px 0 15px 20px; padding-left: 0; list-style-type: none;">
              <li style="margin-bottom: 10px; line-height: 1.8; position: relative; padding-left: 22px; text-align: justify;">
                <span style="position: absolute; left: 0; font-weight: bold; color: #000; font-size: 14pt; top: -4px;">•</span>
                Help both parties communicate clearly,
              </li>
              <li style="margin-bottom: 10px; line-height: 1.8; position: relative; padding-left: 22px; text-align: justify;">
                <span style="position: absolute; left: 0; font-weight: bold; color: #000; font-size: 14pt; top: -4px;">•</span>
                Suggest practical and fair solutions, and
              </li>
              <li style="margin-bottom: 10px; line-height: 1.8; position: relative; padding-left: 22px; text-align: justify;">
                <span style="position: absolute; left: 0; font-weight: bold; color: #000; font-size: 14pt; top: -4px;">•</span>
                Guide towards an amicable settlement.
              </li>
            </ul>
            <p style="margin-bottom: 15px; line-height: 1.8;">
              All Arbitalk Conciliators are <strong>verified professionals with legal and subject-matter expertise</strong>. They <strong>remain neutral at all times and do not represent any party</strong>.
            </p>

            <h3 style="font-size: 13pt; font-weight: bold; margin-bottom: 15px; margin-top: 25px;">How Your Conciliator is Appointed</h3>
            <p style="margin-bottom: 12px; line-height: 1.8;">
              Arbitalk appoints a Conciliator from its <strong>registered panel of experts</strong> based on the nature of your case. Every conciliator follows a strict code of <strong>neutrality, fairness, and confidentiality</strong> to ensure a transparent process.
            </p>
            <p style="margin-bottom: 15px; line-height: 1.8;">
              If, at any point, you are uncomfortable with your assigned Conciliator, you may write to the <strong>Arbitalk Review Committee</strong>. Upon review, we may assign a new conciliator if deemed appropriate.
            </p>
            <p style="margin-bottom: 5px; line-height: 1.8;">
              <strong>support@arbitalk.com</strong><br>
              <strong>+91 93557 55793</strong>
            </p>
          </div>

          <!-- Static Conciliation Information - Page 2 -->
          <div style="page-break-before: always; margin-top: 40px;">
            <h3 style="font-size: 13pt; font-weight: bold; margin-bottom: 15px; margin-top: 20px;">If You Choose Not to Participate</h3>
            <p style="margin-bottom: 15px; line-height: 1.8;">
              If you decide <strong>not to participate</strong> in this conciliation process, you may <strong>lose the opportunity</strong> to <strong>resolve the matter amicably and conveniently</strong> through Arbitalk.
            </p>
            <p style="margin-bottom: 15px; line-height: 1.8;">
              In such cases, the other party may choose to proceed with <strong>formal legal action</strong> before the appropriate Courts, Tribunals, or Arbitration forums — which could be more <strong>time-consuming and expensive</strong>.
            </p>
            <p style="margin-bottom: 25px; line-height: 1.8;">
              We encourage you to <strong>engage actively</strong> and make use of this opportunity to reach a fair and mutually beneficial settlement.
            </p>

            <h3 style="font-size: 13pt; font-weight: bold; margin-bottom: 15px; margin-top: 25px;">Need Assistance or Have Questions?</h3>
            <p style="margin-bottom: 12px; line-height: 1.8;">
              If you have any queries about the process, feel free to reach out:
            </p>
            <p style="margin-bottom: 5px; line-height: 1.8;">
              <strong>support@arbitalk.com</strong><br>
              <strong>+91 90812 97778</strong>
            </p>
            <p style="margin-bottom: 25px; line-height: 1.8;">
              Our team will be happy to assist you and clarify any process-related doubts.
            </p>

            <h3 style="font-size: 13pt; font-weight: bold; margin-bottom: 15px; margin-top: 25px;">Disclaimer</h3>
            <p style="margin-bottom: 15px; line-height: 1.8;">
              <strong>Arbitalk is a neutral and independent online dispute resolution institution.</strong> We are <strong>not representatives of any party</strong> involved in the dispute.
            </p>
            <p style="margin-bottom: 20px; line-height: 1.8;">
              Our role is limited to providing <strong>administrative and technical support</strong> to facilitate an impartial and lawful settlement process, in line with the agreement between the parties.
            </p>
            <p style="text-align: center; margin-top: 20px; font-weight: bold; font-size: 12pt;">
              <strong>Settle Smart. Settle Online. Settle with Arbitalk.</strong>
            </p>
          </div>

        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

  return html;
}

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

  // Generate the complete HTML template with all data already inserted
  const html = generateHTMLTemplate(data, logoBase64, currentDate);

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
