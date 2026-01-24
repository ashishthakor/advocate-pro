/**
 * FAQ data for Arbitalk dispute-resolution platform.
 * Sourced and aligned with Privacy Policy, Terms & Conditions, Fees, and Services.
 * legalReview: true = consider legal sign-off before publishing.
 */

export interface FAQItem {
  question: string;
  answer: string;
  /** Set to true if the answer may need legal review before publication. */
  legalReview?: boolean;
}

export interface FAQCategory {
  id: string;
  title: string;
  items: FAQItem[];
}

export const FAQ_DATA: FAQCategory[] = [
  // ─── General ─────────────────────────────────────────────────────────────
  {
    id: 'general',
    title: 'General',
    items: [
      {
        question: 'What is Arbitalk?',
        answer:
          'Arbitalk is a digital alternative dispute resolution (ADR) platform that helps businesses and individuals resolve commercial disputes through mediation, conciliation, and arbitration. We connect parties with neutral experts and provide a secure online environment for communication, document sharing, and case management. Arbitalk is operated by Gentlefolk Consulting Private Limited.',
      },
      {
        question: 'Who can use Arbitalk?',
        answer:
          'Arbitalk is available to individuals and entities that can enter into binding contracts under Indian law. You must be at least 18 years of age. If you are under 18, a parent or legal guardian must register, accept our Terms, and supervise use. Our services are designed for MSMEs, vendors, suppliers, and businesses seeking faster dispute resolution than traditional courts.',
      },
      {
        question: 'What types of disputes does Arbitalk handle?',
        answer:
          'We handle commercial and business disputes, including contract disputes, payment disagreements, vendor-supplier conflicts, partnership issues, e-commerce and consumer complaints, real estate and property matters, employment and workplace disputes, and certain cross-border commercial disputes. The nature and value of the dispute determine the applicable process (mediation, conciliation, or arbitration) and fee structure.',
      },
      {
        question: 'Is Arbitalk a law firm or does it provide legal advice?',
        answer:
          'No. Arbitalk is a technology platform that facilitates dispute resolution. We are not a law firm, legal practice, or legal advisory service. We connect parties with qualified neutrals (arbitrators, mediators, conciliators) and provide administrative and technical support. The information on our platform is not legal advice. For specific legal guidance, you should consult a licensed legal practitioner.',
        legalReview: true,
      },
      {
        question: 'How do I get started?',
        answer:
          'Register as a user, complete your profile, and submit a dispute resolution application with the relevant details (parties, nature of dispute, relief sought). After payment of the applicable fee, an administrator will assign a neutral to your case. You can then communicate, share documents, and participate in the process through your secure dashboard.',
      },
    ],
  },
  // ─── Dispute Process ───────────────────────────────────────────────────────
  {
    id: 'dispute-process',
    title: 'Dispute Process',
    items: [
      {
        question: 'What is the difference between mediation, conciliation, and arbitration?',
        answer:
          'Mediation and conciliation are collaborative processes where a neutral helps parties reach a voluntary, mutually acceptable settlement. Mediation typically takes 30–60 days; conciliation 45–75 days. The outcome is not imposed by the neutral. Arbitration is a formal process where a neutral arbitrator hears evidence and issues a binding award. Arbitration typically takes 60–90 days. The arbitral award is enforceable in court under the Arbitration and Conciliation Act, 1996.',
      },
      {
        question: 'How long does dispute resolution take?',
        answer:
          'Typical timelines are: mediation 30–60 days, conciliation 45–75 days, and arbitration 60–90 days. Actual duration depends on case complexity, cooperation of parties, and timely submission of documents. Delays can occur if parties miss deadlines or request extensions. Our platform and rules are designed to keep proceedings on track.',
      },
      {
        question: 'What information do I need to submit when raising a dispute?',
        answer:
          'You will need: details of the requesting party and the respondent (names, contact information, addresses, and where applicable, business and GST details), the relationship between the parties, the nature and brief description of the dispute, the date of occurrence, prior communication, the relief sought (including any monetary claim), and supporting documents. Incomplete or inaccurate information may delay or affect your case.',
      },
      {
        question: 'What happens after I submit my dispute?',
        answer:
          'After you submit the dispute and complete payment, an administrator reviews the application. A neutral (mediator, conciliator, or arbitrator, as applicable) is assigned to your case. You will be notified and can access your case via the dashboard. You can message the neutral, upload documents, and participate in the process as per the applicable rules and timelines.',
      },
      {
        question: 'Can the opposite party refuse to participate?',
        answer:
          'In mediation and conciliation, participation is generally voluntary; the process may end if a party does not engage. In arbitration, if the parties have agreed to arbitrate (e.g. by contract or by submitting to Arbitalk), the arbitration may proceed in accordance with the Arbitration and Conciliation Act, 1996, and our rules. The specific consequences depend on the governing agreement and our Dispute Resolution Rules.',
        legalReview: true,
      },
    ],
  },
  // ─── Advocate / Neutral Assignment ───────────────────────────────────────
  {
    id: 'advocate-neutral',
    title: 'Advocate / Neutral Assignment',
    items: [
      {
        question: 'How is a neutral assigned to my case?',
        answer:
          'An Arbitalk administrator assigns a neutral to your case based on the type of dispute, the required process (mediation, conciliation, or arbitration), and the expertise and availability of our empanelled neutrals. Neutrals are selected to avoid conflicts of interest and to match the subject matter of the dispute.',
      },
      {
        question: 'Can I choose or change my neutral?',
        answer:
          'Assignment is made by the administrator. If you have a justified concern about the neutral’s independence or impartiality (e.g. a conflict of interest or prior relationship), you may raise it in accordance with our Dispute Resolution Rules and the Arbitrators’ and Mediators’ Code of Conduct and Disclosure Rules. Requests for a change are evaluated on a case-by-case basis.',
      },
      {
        question: 'Are neutrals independent and impartial?',
        answer:
          'Yes. Our neutrals are required to be independent and impartial. Before accepting an appointment, they must disclose any circumstances that could give rise to doubts about their independence or impartiality. They must not have a financial, personal, or professional relationship with any party that could affect their judgment. This is set out in our Code of Conduct and Disclosure Rules.',
      },
      {
        question: 'What qualifies someone to be a neutral on Arbitalk?',
        answer:
          'Neutrals empanelled with Arbitalk must meet our eligibility and vetting criteria, including qualifications, experience, and expertise relevant to dispute resolution. They are required to conduct proceedings diligently, maintain confidentiality, and comply with our Code of Conduct and Disclosure Rules. Specific requirements are set out in our governing documents.',
      },
    ],
  },
  // ─── Legal Validity ───────────────────────────────────────────────────────
  {
    id: 'legal-validity',
    title: 'Legal Validity',
    items: [
      {
        question: 'Are arbitral awards legally binding and enforceable?',
        answer:
          'Yes. Arbitral awards issued through Arbitalk are binding on the parties and enforceable under the Arbitration and Conciliation Act, 1996. The Act provides for limited grounds to challenge an award before a court. Successful awards can be enforced through the appropriate civil court in accordance with applicable law. Mediation and conciliation settlements are enforceable as contracts between the parties.',
        legalReview: true,
      },
      {
        question: 'Does Arbitalk follow Indian law?',
        answer:
          'Yes. Our platform, Terms, Dispute Resolution Rules, and processes are designed to be consistent with the Arbitration and Conciliation Act, 1996, the Information Technology Act, 2000, and other applicable Indian laws. The seat of arbitration for disputes arising from our Terms is Mumbai, Maharashtra, India, and Indian law governs.',
        legalReview: true,
      },
      {
        question: 'Can I still go to court if I use Arbitalk?',
        answer:
          'Using Arbitalk does not automatically prevent you from going to court. If you have agreed to arbitrate (by contract or by submitting to Arbitalk), that agreement may limit your ability to litigate the same dispute in court. Enforcement of awards and certain challenges are handled by courts under the Arbitration and Conciliation Act, 1996. For advice on your specific situation, consult a qualified legal practitioner.',
        legalReview: true,
      },
      {
        question: 'What if my dispute is referred to Arbitalk by a court or authority?',
        answer:
          'If a court, statutory authority, or governing body refers a dispute to Arbitalk, the proceedings will be conducted in accordance with the rules, regulations, and guidelines of that referring authority in effect at the time of the referral, in addition to any applicable Arbitalk rules.',
        legalReview: true,
      },
    ],
  },
  // ─── Payments & Refunds ────────────────────────────────────────────────────
  {
    id: 'payments-refunds',
    title: 'Payments & Refunds',
    items: [
      // {
      //   question: 'What are the fees for using Arbitalk?',
      //   answer:
      //     'Fees depend on the process and the amount in dispute. For mediation/conciliation, there is a case filing charge (e.g. Rs. 3,000 for domestic matters) and per-session and success-based components as set out on our Fees page. For arbitration, fees are based on the amount in dispute under our Model Fee Schedule (see the Fees page). All amounts are exclusive of applicable taxes. For full details, visit our Fees page or contact info@arbitalk.com.',
      // },
      {
        question: 'How can I pay?',
        answer:
          'Payments are processed through our payment gateway (Razorpay). We accept UPI, debit cards, credit cards, net banking, and other methods supported by the gateway. All transactions are in Indian Rupees (INR) for domestic disputes. Payment card details are processed by the gateway and are not stored on our servers. International or cross-border fees may have different payment options; contact us for details.',
      },
      {
        question: 'Is my payment secure?',
        answer:
          'Yes. We use PCI-DSS compliant payment infrastructure. Your card and bank details are processed directly by our payment provider and are not stored by Arbitalk. We receive only transaction status, amount, and reference information necessary to complete your order and provide support.',
      },
      // {
      //   question: 'What is your refund and cancellation policy?',
      //   answer:
      //     'Service fees are generally non-refundable once services have commenced or been processed. Refunds may be considered only in exceptional circumstances, such as: we are unable to process your order after payment; we reject your service request; there is a material error on our part; or as required by applicable law. To request a refund, contact support@arbitalk.com with your case number and payment transaction ID. Requests are reviewed on a case-by-case basis. If approved, refunds are processed to the original payment method; processing by the bank or gateway may take additional time. Any processing or banking charges may be deducted as per the refund policy.',
      //   legalReview: true,
      // },
      // {
      //   question: 'What if I do not pay the requisitioned fees on time?',
      //   answer:
      //     'Failure to pay requisitioned fees within the prescribed timeline may result in suspension of proceedings (e.g. in arbitration) or the non-registration of a counterclaim, as set out in our fee schedules and Dispute Resolution Rules. The claimant may in certain situations pay the respondent’s share to avoid suspension; specific rules are in our governing documents.',
      // },
    ],
  },
  // ─── Confidentiality & Data Protection ─────────────────────────────────────
  {
    id: 'confidentiality-data',
    title: 'Confidentiality & Data Protection',
    items: [
      {
        question: 'Is my dispute and personal information kept confidential?',
        answer:
          'Yes. Proceedings conducted through Arbitalk are confidential. Information disclosed during the process must not be used in any other forum without the express consent of all parties. We also implement technical and organizational measures to protect your personal and case-related data from unauthorized access, alteration, or disclosure, in line with our Privacy Policy and applicable data protection requirements.',
      },
      {
        question: 'What data does Arbitalk collect and why?',
        answer:
          'We collect: (a) account and contact information you provide when registering; (b) case-related information and documents you upload; (c) transaction data from our payment provider (e.g. status, amount, transaction ID); and (d) usage data such as cookies for session and platform functionality. We use this to provide and improve our services, process payments, communicate with you, and comply with legal obligations. Details are in our Privacy Policy.',
      },
      {
        question: 'Does Arbitalk share my data with third parties?',
        answer:
          'We do not sell your personal information. We may share data with: (a) service providers (e.g. payment gateway, cloud storage) who are contractually bound to protect it; (b) law enforcement or regulators when required by law; and (c) others with your consent. Case information is shared with the assigned neutral and as necessary to run the dispute resolution process.',
      },
      {
        question: 'How long is my data retained?',
        answer:
          'We retain your information for as long as necessary to fulfill the purposes in our Privacy Policy, or as required or permitted by law. When we no longer need it, we securely delete or anonymise it. Specific retention periods may apply to case records, financial data, and legal obligations; for details, see our Privacy Policy or contact support@arbitalk.com.',
        legalReview: true,
      },
      {
        question: 'What are my rights over my personal data?',
        answer:
          'You have the right to request access, correction, deletion, objection to certain processing, and data portability, subject to legal and contractual limits. You may also withdraw consent where it is the legal basis for processing. To exercise these rights, contact support@arbitalk.com. Our practices are intended to align with the Information Technology Act, 2000, and the Reasonable Security Practices and Sensitive Personal Data Rules, 2011.',
      },
    ],
  },
];

/**
 * Builds FAQPage schema (JSON-LD) for the FAQ page.
 * @param baseUrl - e.g. https://arbitalk.com
 */
export function buildFAQSchema(baseUrl = 'https://arbitalk.com'): object {
  const mainEntity = FAQ_DATA.flatMap((cat) =>
    cat.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }))
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
    url: `${baseUrl}/faq`,
  };
}
