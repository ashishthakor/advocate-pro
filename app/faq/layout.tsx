import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Arbitalk',
  description:
    'Find answers about Arbitalk’s dispute resolution process, fees, neutral assignment, legal validity, payments, refunds, and confidentiality.',
  keywords: 'FAQ, dispute resolution, arbitration, mediation, conciliation, Arbitalk, ADR',
  openGraph: {
    title: 'FAQ | Arbitalk – Dispute Resolution',
    description:
      'Answers about our dispute resolution process, fees, neutrals, legal validity, payments, and data protection.',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
