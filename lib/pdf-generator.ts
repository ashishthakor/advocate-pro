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

  // Read the temp.html template
  const templatePath = join(process.cwd(), 'lib', 'temp.html');
  let htmlTemplate = readFileSync(templatePath, 'utf-8');

  // Replace logo src with base64
  if (logoBase64) {
    htmlTemplate = htmlTemplate.replace(
      'src="/public/arbitalk-logo.png"',
      `src="${logoBase64}"`
    );
  }

  // Replace To section - format recipient address properly
  // Handle both single-line and multi-line addresses
  let toAddressLines: string[] = [];
  if (data.respondentAddress) {
    // Split by newlines first
    const lines = data.respondentAddress.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      toAddressLines = lines;
    } else {
      // If no newlines, use the whole address as one line
      toAddressLines = [data.respondentAddress.trim()];
    }
  }
  
  // Generate HTML for address lines
  const toAddressHtml = toAddressLines.length > 0
    ? toAddressLines.map(line => 
        `            <div class="address-details">${escapeHtml(line.trim())}</div>`
      ).join('\n')
    : '<div class="address-details"></div>';
  
  // Replace the To section in template
  // Find the comment marker and replace the entire section
  const toCommentIndex = htmlTemplate.indexOf('<!-- To -->');
  if (toCommentIndex !== -1) {
    // Find the start of the address-section div after the comment
    const sectionStart = htmlTemplate.indexOf('<div class="address-section">', toCommentIndex);
    if (sectionStart !== -1) {
      // Find the matching closing div by counting depth
      let depth = 0;
      let pos = sectionStart;
      let sectionEnd = -1;
      
      while (pos < htmlTemplate.length) {
        if (htmlTemplate.substring(pos, pos + 4) === '<div') {
          depth++;
          pos += 4;
        } else if (htmlTemplate.substring(pos, pos + 6) === '</div>') {
          depth--;
          if (depth === 0) {
            sectionEnd = pos + 6;
            break;
          }
          pos += 6;
        } else {
          pos++;
        }
      }
      
      if (sectionEnd !== -1) {
        const toSectionReplacement = `          <div class="address-section">
            <div class="address-label">To,</div>
            <div class="address-name">${escapeHtml(data.respondentName)}</div>
${toAddressHtml}
            <div class="address-details">PIN: ${escapeHtml(data.respondentPincode)}</div>
          </div>`;
        
        htmlTemplate = htmlTemplate.substring(0, sectionStart) + 
                       toSectionReplacement + 
                       htmlTemplate.substring(sectionEnd);
      }
    }
  }
  
  // Fallback: if comment-based replacement failed, use regex
  if (htmlTemplate.includes('PNIB APPAREL PRIVATE LIMITED')) {
    htmlTemplate = htmlTemplate.replace(
      /<div class="address-section">[\s\S]*?<div class="address-label">To,<\/div>[\s\S]*?<div class="address-name">PNIB APPAREL PRIVATE LIMITED<\/div>[\s\S]*?<div class="address-details">PIN: [^<]*<\/div>[\s\S]*?<\/div>/,
      `          <div class="address-section">
            <div class="address-label">To,</div>
            <div class="address-name">${escapeHtml(data.respondentName)}</div>
${toAddressHtml}
            <div class="address-details">PIN: ${escapeHtml(data.respondentPincode)}</div>
          </div>`
    );
  }

  // Replace From section - format applicant address properly
  let fromAddressLines: string[] = [];
  if (data.applicantAddress) {
    // Split by newlines first
    const lines = data.applicantAddress.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      fromAddressLines = lines;
    } else {
      // If no newlines, use the whole address as one line
      fromAddressLines = [data.applicantAddress.trim()];
    }
  }
  
  // Generate HTML for address lines
  const fromAddressHtml = fromAddressLines.length > 0
    ? fromAddressLines.map(line => 
        `            <div class="address-details">${escapeHtml(line.trim())}</div>`
      ).join('\n')
    : '<div class="address-details"></div>';
  
  // Build the From section
  let fromSection = `<div class="address-section">
            <div class="address-label">From,</div>
            <div class="address-name">${escapeHtml(data.applicantName)}</div>
${fromAddressHtml}`;
  if (data.applicantEmail) {
    fromSection += `\n            <div class="address-details">Email: ${escapeHtml(data.applicantEmail)}</div>`;
  }
  if (data.applicantPhone) {
    fromSection += `\n            <div class="address-details">Phone: ${escapeHtml(data.applicantPhone)}</div>`;
  }
  fromSection += '\n          </div>';
  
  htmlTemplate = htmlTemplate.replace(
    /<div class="address-section">[\s\S]*?<div class="address-label">From,<\/div>[\s\S]*?<div class="address-name">Ravindrabhai Om Panwala<\/div>[\s\S]*?<div class="address-details">Phone: [^<]*<\/div>[\s\S]*?<\/div>/,
    fromSection
  );

  // Replace Subject section
  htmlTemplate = htmlTemplate.replace(
    /Subject: Legal Notice for Outstanding Payments and Invocation of Arbitration Clause under the Agreement/,
    `Subject: ${escapeHtml(data.subject)}`
  );

  // Replace content in fixed-content div
  htmlTemplate = htmlTemplate.replace(
    /<div class="fixed-content"><\/div>/,
    `<div class="fixed-content">${data.content}</div>`
  );

  // Replace signature section
  htmlTemplate = htmlTemplate.replace(
    /<div class="signature-name">Ravindrabhai Om Panwala<\/div>\s*<div class="signature-title">Proprietor, Ecomfirst Ventures<\/div>/,
    `<div class="signature-name">${escapeHtml(data.applicantName)}</div>
            <div class="signature-title">Applicant</div>`
  );

  // Add date section before the To section
  if (!htmlTemplate.includes('Date:')) {
    htmlTemplate = htmlTemplate.replace(
      /<td class="content">/,
      `<td class="content">
          <div class="date-section">
            <strong>Date:</strong> ${currentDate}
          </div>`
    );
  }

  const html = htmlTemplate;

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
