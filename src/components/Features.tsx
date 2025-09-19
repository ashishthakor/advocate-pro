export function Features() {
  const features = [
    {
      title: 'Client Management',
      description: 'Comprehensive client database with contact information, case history, and communication logs.',
      icon: '👥'
    },
    {
      title: 'Case Tracking',
      description: 'Track case progress, deadlines, court dates, and important milestones efficiently.',
      icon: '📋'
    },
    {
      title: 'Document Management',
      description: 'Secure document storage, version control, and easy sharing with clients and colleagues.',
      icon: '📁'
    },
    {
      title: 'Calendar & Scheduling',
      description: 'Integrated calendar system for court dates, client meetings, and important deadlines.',
      icon: '📅'
    },
    {
      title: 'Billing & Invoicing',
      description: 'Generate invoices, track payments, and manage billing cycles for your legal services.',
      icon: '💰'
    },
    {
      title: 'Analytics & Reports',
      description: 'Detailed insights into your practice performance, client satisfaction, and case outcomes.',
      icon: '📊'
    }
  ]

  return (
    <div className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose AdvocatePro?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive legal practice management designed specifically for advocates and legal professionals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
