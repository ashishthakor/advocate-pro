import Link from 'next/link'

export default function ServicesPage() {
  const services = [
    {
      title: 'Criminal Defense',
      description: 'Expert legal representation for criminal charges including DUI, theft, assault, and other criminal matters.',
      icon: '⚖️',
      features: ['Expert legal defense', 'Court representation', 'Case strategy development', 'Negotiation support']
    },
    {
      title: 'Civil Litigation',
      description: 'Comprehensive civil law services including contract disputes, personal injury, and business litigation.',
      icon: '📋',
      features: ['Contract disputes', 'Personal injury claims', 'Business litigation', 'Settlement negotiations']
    },
    {
      title: 'Family Law',
      description: 'Sensitive handling of family legal matters including divorce, child custody, and adoption cases.',
      icon: '👨‍👩‍👧‍👦',
      features: ['Divorce proceedings', 'Child custody', 'Adoption services', 'Family mediation']
    },
    {
      title: 'Corporate Law',
      description: 'Business legal services including incorporation, contracts, compliance, and corporate governance.',
      icon: '🏢',
      features: ['Business formation', 'Contract drafting', 'Compliance guidance', 'Corporate governance']
    },
    {
      title: 'Property Law',
      description: 'Real estate legal services including property disputes, transactions, and land use matters.',
      icon: '🏠',
      features: ['Property disputes', 'Real estate transactions', 'Land use issues', 'Property rights']
    },
    {
      title: 'Estate Planning',
      description: 'Comprehensive estate planning services including wills, trusts, and probate administration.',
      icon: '📜',
      features: ['Will drafting', 'Trust creation', 'Probate administration', 'Estate planning']
    }
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Legal Services</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive legal services tailored to meet your specific needs. 
            Our experienced advocates provide expert representation across various areas of law.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
              
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                    <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/contact" className="btn-outline w-full text-center">
                Learn More
              </Link>
            </div>
          ))}
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-primary/5 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Legal Services?</h2>
            <p className="text-lg text-muted-foreground">
              We combine decades of legal experience with modern technology to deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Proven Track Record</h3>
              <p className="text-sm text-muted-foreground">95% success rate in case outcomes</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Round-the-clock legal assistance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Confidential</h3>
              <p className="text-sm text-muted-foreground">Complete privacy and confidentiality</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fast Response</h3>
              <p className="text-sm text-muted-foreground">Quick turnaround on all legal matters</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Need Legal Assistance?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Contact us today for a free consultation and let us help you with your legal needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              Get Free Consultation
            </Link>
            <Link href="/register" className="btn-outline">
              Join as Advocate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
