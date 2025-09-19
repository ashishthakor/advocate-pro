import Link from 'next/link'

export default function AboutPage() {
  const stats = [
    { number: '500+', label: 'Active Advocates' },
    { number: '10K+', label: 'Cases Managed' },
    { number: '99%', label: 'Client Satisfaction' },
    { number: '15+', label: 'Years Experience' }
  ]

  const team = [
    {
      name: 'John Advocate',
      role: 'Senior Partner',
      experience: '15+ years',
      specialization: 'Criminal Defense',
      image: '👨‍💼'
    },
    {
      name: 'Sarah Legal',
      role: 'Partner',
      experience: '12+ years',
      specialization: 'Family Law',
      image: '👩‍💼'
    },
    {
      name: 'Michael Counsel',
      role: 'Senior Associate',
      experience: '8+ years',
      specialization: 'Corporate Law',
      image: '👨‍💼'
    },
    {
      name: 'Emily Justice',
      role: 'Associate',
      experience: '5+ years',
      specialization: 'Property Law',
      image: '👩‍💼'
    }
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">About AdvocatePro</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We are a leading legal practice management platform that empowers advocates 
            to deliver exceptional legal services through innovative technology and 
            comprehensive case management solutions.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To revolutionize legal practice management by providing advocates with cutting-edge 
              technology that streamlines case management, enhances client relationships, and 
              improves overall efficiency in delivering legal services.
            </p>
          </div>

          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To be the global leader in legal technology solutions, empowering every advocate 
              to provide exceptional legal services through innovative, user-friendly, and 
              comprehensive practice management tools.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="card mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Story</h2>
            <p className="text-lg text-muted-foreground">
              Founded by legal professionals who understand the challenges of modern legal practice
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="mb-6">
              AdvocatePro was born out of a simple observation: legal professionals were spending 
              more time on administrative tasks than on what they do best - practicing law. 
              Our founders, experienced advocates themselves, recognized the need for a comprehensive 
              solution that would streamline practice management while maintaining the highest 
              standards of legal service.
            </p>
            
            <p className="mb-6">
              Since our inception, we have been committed to developing innovative technology 
              solutions that address the real-world challenges faced by legal professionals. 
              Our platform combines powerful case management tools, client relationship management, 
              document management, and billing systems into one integrated solution.
            </p>
            
            <p>
              Today, AdvocatePro serves hundreds of advocates worldwide, helping them manage 
              thousands of cases and deliver exceptional legal services to their clients. 
              We continue to evolve and improve our platform based on feedback from our 
              community of legal professionals.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground">
              Experienced legal professionals dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-1">{member.role}</p>
                <p className="text-sm text-muted-foreground mb-2">{member.experience}</p>
                <p className="text-sm text-muted-foreground">{member.specialization}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="card mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for excellence in everything we do, from our technology to our customer service.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Integrity</h3>
              <p className="text-muted-foreground">
                We maintain the highest standards of integrity and ethical conduct in all our operations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously innovate to provide cutting-edge solutions for legal professionals.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of advocates who trust AdvocatePro for their practice management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary">
              Start Free Trial
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
