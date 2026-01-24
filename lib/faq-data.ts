/**
 * FAQ data for Arbitalk dispute-resolution platform.
 * q / a = short translation keys. legalReview = consider legal sign-off before publishing.
 */

export interface FAQItem {
  q: string;
  a: string;
  legalReview?: boolean;
}

export interface FAQCategory {
  id: string;
  titleKey: string;
  items: FAQItem[];
}

export const FAQ_DATA: FAQCategory[] = [
  {
    id: 'general',
    titleKey: 'faq.cat.gen',
    items: [
      { q: 'faq.gen.1.q', a: 'faq.gen.1.a' },
      { q: 'faq.gen.2.q', a: 'faq.gen.2.a' },
      { q: 'faq.gen.3.q', a: 'faq.gen.3.a' },
      { q: 'faq.gen.4.q', a: 'faq.gen.4.a', legalReview: true },
      { q: 'faq.gen.5.q', a: 'faq.gen.5.a' },
      { q: 'faq.l5.q', a: 'faq.l5.a' },
      { q: 'faq.l16.q', a: 'faq.l16.a' },
      { q: 'faq.l18.q', a: 'faq.l18.a' },
      { q: 'faq.l19.q', a: 'faq.l19.a' },
    ],
  },
  {
    id: 'dispute-process',
    titleKey: 'faq.cat.dp',
    items: [
      { q: 'faq.l4.q', a: 'faq.l4.a' },
      { q: 'faq.dp.1.q', a: 'faq.dp.1.a' },
      { q: 'faq.dp.2.q', a: 'faq.dp.2.a' },
      { q: 'faq.dp.3.q', a: 'faq.dp.3.a' },
      { q: 'faq.dp.4.q', a: 'faq.dp.4.a' },
      { q: 'faq.dp.5.q', a: 'faq.dp.5.a', legalReview: true },
    ],
  },
  {
    id: 'advocate-neutral',
    titleKey: 'faq.cat.adv',
    items: [
      { q: 'faq.adv.1.q', a: 'faq.adv.1.a' },
      { q: 'faq.adv.2.q', a: 'faq.adv.2.a' },
      { q: 'faq.adv.3.q', a: 'faq.adv.3.a' },
      { q: 'faq.adv.4.q', a: 'faq.adv.4.a' },
    ],
  },
  {
    id: 'legal-validity',
    titleKey: 'faq.cat.leg',
    items: [
      { q: 'faq.leg.1.q', a: 'faq.leg.1.a', legalReview: true },
      { q: 'faq.leg.2.q', a: 'faq.leg.2.a', legalReview: true },
      { q: 'faq.leg.3.q', a: 'faq.leg.3.a', legalReview: true },
      { q: 'faq.leg.4.q', a: 'faq.leg.4.a', legalReview: true },
    ],
  },
  {
    id: 'payments-refunds',
    titleKey: 'faq.cat.pay',
    items: [
      { q: 'faq.l12.q', a: 'faq.l12.a' },
      { q: 'faq.pay.1.q', a: 'faq.pay.1.a' },
      { q: 'faq.pay.2.q', a: 'faq.pay.2.a' },
    ],
  },
  {
    id: 'confidentiality-data',
    titleKey: 'faq.cat.con',
    items: [
      { q: 'faq.con.1.q', a: 'faq.con.1.a' },
      { q: 'faq.con.2.q', a: 'faq.con.2.a' },
      { q: 'faq.con.3.q', a: 'faq.con.3.a' },
      { q: 'faq.con.4.q', a: 'faq.con.4.a', legalReview: true },
      { q: 'faq.con.5.q', a: 'faq.con.5.a' },
    ],
  },
];

/**
 * Builds FAQPage schema (JSON-LD). pairs = translated {question, answer} from t().
 */
export function buildFAQSchema(
  baseUrl: string,
  pairs: { question: string; answer: string }[]
): object {
  const mainEntity = pairs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  }));
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity, url: `${baseUrl}/faq` };
}
