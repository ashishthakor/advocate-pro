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
      <section className="py-24 bg-gradient-to-b from-primary/5 to-transparent dark:from-slate-900 dark:to-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join hundreds of advocates who trust AdvocatePro to manage their practice, 
            serve their clients, and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/users/register" className="inline-flex items-center justify-center rounded-lg text-base font-semibold px-8 py-4 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-sm transition-colors">
              Join as Client
            </Link>
            <Link href="/advocate/register" className="inline-flex items-center justify-center rounded-lg text-base font-semibold px-8 py-4 text-foreground bg-muted hover:bg-muted/80 border border-border transition-colors">
              Join as Advocate
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-lg text-base font-semibold px-8 py-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
