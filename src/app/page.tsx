import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      
      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join hundreds of advocates who trust AdvocatePro to manage their practice, 
            serve their clients, and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="/contact" className="btn-outline text-lg px-8 py-4">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
