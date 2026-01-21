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
  date?: string; // Date from notice form (format: DD.MM.YYYY)
  caseNumber?: string;
  caseTitle?: string;
  applicantCompanyName?: string;
}

// Hardcoded content that appears after "Dear Sir/Madam,"
const HARDCODED_NOTICE_CONTENT = `
<p>1. We act on behalf of Monastic Media. This notice is being issued through ArbiTalk, a platform authorised to facilitate amicable resolution of disputes.</p>

<p>2. Please note that our earlier legal notice, issued to you via registered post/speed post on 18/08/2025 which was received by you at your address, as confirmed by the official postal tracking records. Despite having received the said notice, you have failed to provide any response or clarification till date.</p>

<p>3. At the outset, it is important to state that Monastic Media had earlier sent you a detailed notice via post regarding your breach of the Service Agreement and non-compliance with the Termination Clause, both of which constitute clear violations of the contractual terms mutually agreed upon. The said notice was duly delivered at your address; however, no response has been received from your end till date, which reflects deliberate non-cooperation and avoidance. Furthermore, despite calling you multiple times to seek clarification and discuss the matter, there has been absolutely no response from your side, thereby aggravating the non-compliance and showing clear unwillingness to resolve the issue amicably.</p>

<p>4. It is pertinent to note that under Clause 2(2) and 2(3) of the agreement, both parties are obligated to perform their duties in mutual good faith with respect to marketing campaigns. While monastic media has duly fulfilled all contractual obligations, your continued failure to act in a timely manner constitutes a clear breach of your contractual responsibilities. Such non-performance is not only contrary to the terms of the agreement but also undermines the spirit of mutual cooperation envisaged therein.</p>

<p>5. That my client fulfilled their contractual obligations by initiating services in good faith, preparing detailed performance calendars, creating visual and marketing content, and deploying internal resources and manpower based on your requirements. These tasks incurred direct business expenses borne by my client for the duration covering 11th July 2025 to 10th August 2025.</p>

<p>6. That despite being fully aware of your obligations, you unilaterally communicated your intent to discontinue the services on the very date the second invoice was due (11th July 2025), i.e., Invoice No. 24 dated 15th 2025, amounting to ₹40,000/- (exclusive of GST) remains unpaid as of the date of this notice. The total outstanding amount, including 18% GST, comes to ₹47,200/-. You failed to serve any prior notice in accordance with Clause 5 of the Agreement, thereby breaching the terms of the contract.</p>

<p>7. That such abrupt discontinuation and failure to make payment constitutes a material breach of the Service Agreement, attracting liabilities under : Clause 5 (Term and Termination), Clause 6 (Billing & Payment). That monastic media has incurred costs towards creative production, team allocation, Brand Consultants for content calendars, Media buyer for Running ads, content preparation, and Account manager salary for your brand for July- August month of 2025. You were liable to reimburse the same as per the binding contract. but you have not paid dues, monastic media has repeatedly demanded the amount over the phone and e-mail.</p>

<p>As reiterated earlier, your actions constitute:</p>
<ul>
  <li>Breach of the Service Agreement, and Non-compliance with the Termination Clause. Which violate the contractual obligations mutually accepted by the parties.</li>


  <li>The Service Agreement clearly stipulates that all disputes shall be resolved in accordance with the Arbitration and Conciliation Act, 1996, through the agreed arbitration mechanism. Accordingly, monastic media once again conveys its willingness to proceed through amicable settlement and arbitration, facilitated by ArbiTalk.</li>

  <li>Your continued silence and non-cooperation not only aggravate the dispute but also cause unwarranted delay and financial losses to our user.</li>

  <li>You are hereby called upon to provide your written response within 7 (seven) days from the receipt of this notice, indicating your willingness to: participate in the arbitration proceedings as per the Agreement; or Resolve the matter amicably through ArbiTalk.</li>

  <li>Take notice that failure to respond within the stipulated 7-day period shall compel monastic media to initiate appropriate legal proceedings, including but not limited to: unilateral invocation of arbitration, and/or approaching the competent court/authority for necessary reliefs, entirely at your cost, risk, and consequences.</li>

  <li>This notice is issued without prejudice to the rights, claims, and remedies available to Monastic Media under the Agreement and applicable laws.</li>

  <li>We expect your cooperation and trust that you will treat this as the final opportunity to resolve the matter without escalation.</li>

  <li>We trust you will treat this as a final opportunity to resolve the matter amicably and avoid further escalation.</li>
</ul>
`;

// Generate the complete HTML template with all data
function generateHTMLTemplate(data: NoticeData, logoBase64: string, verifiedLogoBase64: string, formattedDate: string): string {
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

  <!-- Force Georgia font with 100% reliability in Puppeteer -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Georgia:wght@400;700&display=swap" rel="stylesheet">

  <style>
    @page {
      size: A4;
      margin: 1cm;
    }
    * {
      font-family: 'Georgia', serif !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-size: 14pt !important;
      line-height: 1.8 !important;
      color: #222;
      padding: 0;
      margin: 0;
      background: white;
    }
    body {
      font-family: 'Georgia', serif !important;
      font-size: 14pt !important;
      line-height: 1.8 !important;
      color: #222 !important;
      text-align: justify !important;
      text-justify: inter-word !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { display: none; } /* Hide thead to prevent header repetition */
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1.5px solid #000;
      padding-bottom: 12px;
      page-break-after: avoid;
    }
    .logo img {
      height: 32px;
      margin-bottom: 8px;
    }
    .tagline {
      
      color: #333;
      margin: 6px 0;
      font-weight: 500;
    }

    .contact {
      margin: 8px 0;
      display: flex;
      justify-content: center;
      gap: 20px;
      color: #222;
    }
    .contact-link {
      font-family: 'Georgia', serif !important;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #222;
    }
    .contact > span > a {
      text-decoration: none;
    }
    .contact-link > span {
      font-family: 'Georgia', serif !important;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #222;
    }
    .contact-text {
      font-weight: 500;
    }
    .phone, .pincode {
      font-family: 'Times New Roman', Times, serif !important;
    }
    .document-title {
      text-align: center;
            font-weight: bold;
      margin: 30px 0 20px 0;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .date-section {
      text-align: right;
            margin-bottom: 25px;
    }
    .separator {
      border-top: 1px solid #000;
      margin: 25px 0;
    }
    .address-section { margin: 20px 0; }
    .address-label {
          }
    .address-name {
            margin-bottom: 10px;
    }
    .address-details {
    }
    .subject-section {
            margin: 25px 0 20px 0;
    }
    .greeting { margin: 20px 0 15px 0; }
    .fixed-content {
      margin: 15px 0 0 0;
      text-align: justify;
      line-height: 1.8;
      letter-spacing: normal;
    }
    /* Style paragraphs from React Quill */
    .fixed-content p {
      margin-bottom: 12px;
      margin-top: 0;
      text-align: justify;
      line-height: 1.8;
      letter-spacing: normal;
    }
    .fixed-content p:first-child {
      margin-top: 0;
    }
    .fixed-content p:last-child {
      margin-bottom: 0;
    }
    /* Handle empty paragraphs with just <br> */
    .fixed-content p:has(br:only-child),
    .fixed-content p:empty {
      margin-bottom: 12px;
      min-height: 1.8em;
    }
    /* Style for paragraphs containing only <br> */
    .fixed-content p > br:only-child {
      display: block;
      content: "";
      margin-top: 12px;
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
    /* Unordered lists */
    .fixed-content ul {
      margin: 12px 0 15px 20px;
      padding-left: 0;
      list-style-type: none;
    }
    .fixed-content ul li {
      margin-bottom: 10px;
      position: relative;
      padding-left: 22px;
      text-align: justify;
      line-height: 1.8;
    }
    .fixed-content ul li:before {
      content: "•";
      position: absolute;
      left: 0;
      font-weight: bold;
      color: #222;
      top: 0;
    }
    /* Ordered lists */
    .fixed-content ol {
      margin: 12px 0 15px 20px;
      padding-left: 20px;
      list-style-type: decimal;
    }
    .fixed-content ol li {
      margin-bottom: 10px;
      padding-left: 8px;
      text-align: justify;
      line-height: 1.8;
      list-style-position: outside;
    }
    /* General list item styling */
    .fixed-content li {
      margin-bottom: 10px;
      text-align: justify;
      line-height: 1.8;
    }
    .closing-section { 
      margin: 20px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .signature-name {
      font-weight: bold;
    }
    .signature-title { color: #222; }
    
    /* Additional styling for notice form content */
    .notice-form-content {
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .notice-form-content p {
      margin-bottom: 0px;
      margin-top: 0;
      text-align: justify;
      line-height: 1.8 !important;
      letter-spacing: normal !important;
    }
    .notice-form-content p + p {
      margin-top: 0;
    }
    /* Handle <br> tags within paragraphs */
    .notice-form-content br {
      line-height: 1.8;
    }
    /* Handle empty paragraphs (p with only <br>) */
    .notice-form-content p:has(> br:only-child) {
      margin-bottom: 0px;
      margin-top: 0px;
      padding:0px;
      min-height: 0;
    }
    /* Remove extra spacing from empty paragraphs */
    .notice-form-content p:empty {
      margin-bottom: 0;
      min-height: 0;
    }
    /* Style nested lists */
    .notice-form-content ul ul,
    .notice-form-content ol ol,
    .notice-form-content ul ol,
    .notice-form-content ol ul {
      margin-top: 0px;
      margin-bottom: 0px;
      padding: 0px
    }
  </style>
</head>
<body>
  <table>
    <tbody>
      <tr>
        <td class="content">
          <!-- Header - Only on first page -->
          <div class="header">
            <div class="logo">
              <img src="${logoBase64 || '/public/arbitalk-logo.png'}" alt="ARBITALK Logo">
            </div>
            <div class="tagline">We Believe in Talk | Dispute Resolution Institution</div>
            <div class="contact">
              <span>🌐 <a href="https://arbitalk.com" target="_blank">arbitalk.com</a></span>
              <span>✉️ <a href="mailto:info@arbitalk.com" target="_blank">info@arbitalk.com</a></span>
              <span>📞 <a class="phone" href="tel:+919081297778" target="_blank">+91 9081297778</a></span>
            </div>
          </div>

          <!-- To -->
          <div class="address-section">
            <div class="address-label">To,</div>
            <div class="address-name">${escapeHtml(data.respondentName)}</div>
            <div class="address-details">Address: ${escapeHtml(data.respondentAddress)}</div>
          </div>

          <!-- Subject -->
          <div class="subject-section">
            <b>Subject:</b> ${escapeHtml(data.subject)}
          </div>

          <!-- Greeting -->
          <div class="greeting">Dear Sir/Madam,</div>

          <!-- Notice Form Content -->
          <div class="fixed-content notice-form-content">${data.content}</div>

          <!-- Hardcoded Content -->
          <div class="fixed-content">${HARDCODED_NOTICE_CONTENT}</div>

          <!-- Closing -->
          <div class="closing-section" style="page-break-inside: avoid; break-inside: avoid; -webkit-region-break-inside: avoid;">
            <div>For ${escapeHtml(data.applicantName)}</div>
            <div style="margin-bottom: 30px;">Through ArbiTalk – Amicable Dispute Resolution Platform</div>
            
            <div style="margin-top: 30px; margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid;">
              <div style="margin-bottom: 0px;">Date: ${formattedDate}</div>
              <div style="margin-bottom: 5px;">Surat.</div>
              <div style="margin-bottom: 0px; font-family: 'Georgia', serif;">............... ${escapeHtml(data.applicantName)} ...............</div>
              ${data.applicantCompanyName ? `<div>Proprietor of ${escapeHtml(data.applicantCompanyName)}</div>` : ''}
            </div>
          </div>

          <!-- Static Conciliation Information - Page 1 -->
          <!-- <div style="page-break-before: always; margin-top: 40px;"> -->
          <div style="margin-top: 40px;">
            <h3 style="font-weight: bold; margin-bottom: 15px;">What is Conciliation?</h3>
            <p style="margin-bottom: 15px;">
              Conciliation is a <strong>voluntary and confidential process</strong> where both parties work together, with the assistance of a <strong>neutral expert called a Conciliator</strong>, to find a mutually agreeable solution. Once both parties reach an agreement, the Conciliator issues a <strong>Conciliation Settlement Agreement</strong>, which is <strong>legally binding and enforceable</strong> just like a court decree (under <strong>Section 74 of the Arbitration and Conciliation Act, 1996</strong>).
            </p>

            <h3 style="font-weight: bold; margin-bottom: 15px; margin-top: 25px;">Who is a Conciliator?</h3>
            <p style="margin-bottom: 12px;">
              A Conciliator is an <strong>independent, impartial, and trained dispute resolution professional</strong>. Their role is to:
            </p>
            <ul style="margin: 12px 0 15px 20px; padding-left: 0; list-style-type: none;">
              <li style="margin-bottom: 10px; position: relative; padding-left: 22px; text-align: justify;">
                <span style="position: absolute; left: 0; font-weight: bold; color: #222; top: -4px;">•</span>
                Help both parties communicate clearly,
              </li>
              <li style="margin-bottom: 10px; position: relative; padding-left: 22px; text-align: justify;">
                <span style="position: absolute; left: 0; font-weight: bold; color: #222; top: -4px;">•</span>
                Suggest practical and fair solutions, and
              </li>
              <li style="margin-bottom: 10px; position: relative; padding-left: 22px; text-align: justify;">
                <span style="position: absolute; left: 0; font-weight: bold; color: #222; top: -4px;">•</span>
                Guide towards an amicable settlement.
              </li>
            </ul>
            <p style="margin-bottom: 15px;">
              All Arbitalk Conciliators are <strong>verified professionals with legal and subject-matter expertise</strong>. They <strong>remain neutral at all times and do not represent any party</strong>.
            </p>

            <h3 style="font-weight: bold; margin-bottom: 15px; margin-top: 25px;">How Your Conciliator is Appointed</h3>
            <p style="margin-bottom: 12px;">
              Arbitalk appoints a Conciliator from its <strong>registered panel of experts</strong> based on the nature of your case. Every conciliator follows a strict code of <strong>neutrality, fairness, and confidentiality</strong> to ensure a transparent process.
            </p>
            <p style="margin-bottom: 15px;">
              If, at any point, you are uncomfortable with your assigned Conciliator, you may write to the <strong>Arbitalk Review Committee</strong>. Upon review, we may assign a new conciliator if deemed appropriate.
            </p>
          </div>

          <!-- Static Conciliation Information - Page 2 -->
          <div style="margin-top: 20px;">
            <h3 style="font-weight: bold; margin-bottom: 15px; margin-top: 20px;">If You Choose Not to Participate</h3>
            <p style="margin-bottom: 15px;">
              If you decide <strong>not to participate</strong> in this conciliation process, you may <strong>lose the opportunity</strong> to <strong>resolve the matter amicably and conveniently</strong> through Arbitalk.
            </p>
            <p style="margin-bottom: 15px;">
              In such cases, the other party may choose to proceed with <strong>formal legal action</strong> before the appropriate Courts, Tribunals, or Arbitration forums — which could be more <strong>time-consuming and expensive</strong>.
            </p>
            <p style="margin-bottom: 25px;">
              We encourage you to <strong>engage actively</strong> and make use of this opportunity to reach a fair and mutually beneficial settlement.
            </p>

            <p style="text-align: center; margin-top: 20px; font-weight: bold;">
              <strong>Settle Smart. Settle Online. Settle with Arbitalk.</strong>
            </p>
          </div>

          
          <!-- Need Assistance Section -->
          <!-- <div style="margin-top: 40px; page-break-before: always;"> -->
          <div style="margin-top: 60px;">
            <!-- Top Section: Need Assistance + Verified Logo -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; page-break-inside: avoid; break-inside: avoid;">
              <!-- Left: Need Assistance Section -->
              <div style="flex: 1; margin-right: 30px;">
                <h3 style="font-weight: bold; margin-bottom: 15px;">Need Assistance or Have Questions?</h3>
                <p style="margin-bottom: 12px;">
                  If you have any queries about the process, feel free to reach out:
                </p>
                <p style="margin-bottom: 0;">
                  <strong>support@arbitalk.com</strong><br>
                  <strong class="phone">+91 9081297778</strong>
                </p>
              </div>
              
              <!-- Right: Verified Logo -->
              <div style="flex-shrink: 0;">
                ${verifiedLogoBase64 ? `<img src="${verifiedLogoBase64}" alt="Verified ArbiTalk" style="width: 120px; height: 120px; object-fit: contain;" />` : ''}
              </div>
            </div>

            <!-- Bottom Section: Disclaimer -->
            <div style="margin-top: 30px;">
              <h3 style="font-weight: bold; margin-bottom: 15px;">Disclaimer:</h3>
              <p style="margin-bottom: 15px;">
                <strong>Arbitalk is a neutral and independent online dispute resolution institution.</strong>
              </p>
              <p style="margin-bottom: 15px;">
                We are <strong>not representatives of any party</strong> involved in the dispute.
              </p>
              <p style="margin-bottom: 0;">
                Our role is limited to providing <strong>administrative and technical support</strong> to facilitate an impartial and lawful settlement process, in line with the agreement between the parties.
              </p>
            </div>
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

  // Get verified logo as base64
  let verifiedLogoBase64 = '';
  try {
    const verifiedLogoPath = join(process.cwd(), 'assets', 'images', 'Notice_logo.png');
    const verifiedLogoData = readFileSync(verifiedLogoPath);
    verifiedLogoBase64 = `data:image/png;base64,${verifiedLogoData.toString('base64')}`;
  } catch (error) {
    console.warn('Verified logo not found, using text only');
  }

  // Format date - convert to DD-MM-YYYY format for PDF
  let formattedDate = '';
  if (data.date && data.date.trim() !== '') {
    try {
      let dateObj: Date;
      const dateStr = data.date.trim();
      
      // Handle different input formats
      if (dateStr.includes('.')) {
        // DD.MM.YYYY format - convert to Date object
        const [day, month, year] = dateStr.split('.');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (dateStr.includes('-')) {
        // YYYY-MM-DD or DD-MM-YYYY format
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          dateObj = new Date(dateStr);
        } else {
          // DD-MM-YYYY format
          const [day, month, year] = parts;
          dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      } else {
        // Try parsing as-is
        dateObj = new Date(dateStr);
      }
      
      // Format as DD-MM-YYYY
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      formattedDate = `${day}-${month}-${year}`;
    } catch (error) {
      // Fallback to current date if parsing fails
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      formattedDate = `${day}-${month}-${year}`;
    }
  } else {
    // Auto-fill with current date in DD-MM-YYYY format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    formattedDate = `${day}-${month}-${year}`;
  }

  // Generate the complete HTML template with all data already inserted
  const html = generateHTMLTemplate(data, logoBase64, verifiedLogoBase64, formattedDate);

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
