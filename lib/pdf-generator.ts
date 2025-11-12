import { jsPDF } from 'jspdf';
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
WHEREAS the Applicant has raised a dispute against you regarding the matter mentioned above;

AND WHEREAS the Applicant has approached ARBITALK, a Dispute Resolution Institution, for resolution of the said dispute;

NOW THEREFORE, this Notice is being served upon you to bring to your knowledge that a dispute has been raised against you and the same is pending for resolution before ARBITALK.

You are hereby called upon to respond to this Notice within a period of 30 (thirty) days from the date of receipt of this Notice, failing which it shall be presumed that you have no objection to the dispute being resolved through the process of ARBITALK and the proceedings shall continue ex-parte.

You are further informed that your failure to respond to this Notice may result in an adverse order being passed against you, which may be binding upon you.

Please treat this Notice with utmost seriousness and respond accordingly within the stipulated time period.
`;

export function generateNoticePDF(data: NoticeData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const letterheadHeight = 50;
  const contentStartY = margin + letterheadHeight + 10;
  let yPosition = contentStartY;

  // Function to add letterhead on current page
  const addLetterhead = () => {
    const letterheadY = margin;
    let currentY = letterheadY;
    
    try {
      // Try to load logo from public folder
      const logoPath = join(process.cwd(), 'public', 'arbitalk-logo.png');
      const logoData = readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
      
      // Add logo (left side, top aligned)
      doc.addImage(logoBase64, 'PNG', margin, currentY, 50, 18);
    } catch (error) {
      // If logo not found, just use text
      console.warn('Logo not found, using text only');
    }

    // Company name and tagline (centered)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ARBITALK', pageWidth / 2, currentY + 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('We Believe in Talk | Dispute Resolution Institution', pageWidth / 2, currentY + 18, { align: 'center' });

    // Contact information (right side, aligned with logo)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const contactX = pageWidth - margin;
    doc.text('arbitalk.com', contactX, currentY + 5, { align: 'right' });
    doc.text('+91 77780 70439', contactX, currentY + 11, { align: 'right' });
    doc.text('info@arbitalk.com', contactX, currentY + 17, { align: 'right' });

    // Draw line under letterhead
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, margin + letterheadHeight, pageWidth - margin, margin + letterheadHeight);
  };

  // Add letterhead to first page
  addLetterhead();

  // Helper function to add text with word wrap and page break handling
  const addText = (text: string, fontSize: number, isBold: boolean = false, x: number = margin, maxWidth?: number) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth || (pageWidth - 2 * margin));
    
    // Check if we need a new page
    const lineHeight = fontSize * 0.4;
    const totalHeight = lines.length * lineHeight + 5;
    
    if (yPosition + totalHeight > pageHeight - 30) {
      doc.addPage();
      addLetterhead(); // Add letterhead to new page
      yPosition = contentStartY;
    }
    
    doc.text(lines, x, yPosition);
    yPosition += totalHeight;
    return yPosition;
  };

  // NOTICE Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTICE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Date (right aligned)
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${currentDate}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 12;

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  // To (Respondent)
  addText('To,', 12, true);
  addText(data.respondentName, 12, true);
  addText(data.respondentAddress, 11);
  addText(`PIN: ${data.respondentPincode}`, 11);
  yPosition += 8;

  // From (Applicant)
  addText('From,', 12, true);
  addText(data.applicantName, 12, true);
  addText(data.applicantAddress, 11);
  if (data.applicantEmail) {
    addText(`Email: ${data.applicantEmail}`, 10);
  }
  if (data.applicantPhone) {
    addText(`Phone: ${data.applicantPhone}`, 10);
  }
  yPosition += 8;

  // Subject
  if (data.caseNumber || data.caseTitle) {
    const subject = `Subject: ${data.caseTitle || 'Legal Notice'}${data.caseNumber ? ` (Case No: ${data.caseNumber})` : ''}`;
    addText(subject, 12, true);
    yPosition += 5;
  }

  // Line separator
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  // Greeting
  addText('Sir/Madam,', 11);
  yPosition += 8;

  // Fixed notice content
  addText(FIXED_NOTICE_CONTENT, 11);
  yPosition += 8;

  // Custom content
  if (data.content && data.content.trim()) {
    addText(data.content, 11);
    yPosition += 8;
  }

  // Closing
  yPosition += 8;
  addText('Thanking you,', 11);
  yPosition += 15;
  addText(data.applicantName, 11, true);
  addText('Applicant', 10);

  // Add letterhead to all pages (in case multiple pages were created)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Letterhead is already on first page, add to subsequent pages
    if (i > 1) {
      addLetterhead();
    }
  }

  // Generate PDF buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

