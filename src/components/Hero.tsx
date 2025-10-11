import Link from 'next/link'

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-transparent dark:from-slate-950 dark:via-slate-900 dark:to-transparent">
      {/* Background Layers */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_20%,black,transparent)]">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-32 -left-16 h-64 w-64 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] dark:opacity-[0.08]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow ring-1 ring-black/5 animate-bounce-gentle">
            <span className="text-white font-bold text-3xl">⚖️</span>
          </div>

          {/* Heading */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-indigo-600/10 text-indigo-700 ring-1 ring-indigo-600/20 dark:text-indigo-300 mb-3">
            Built for modern legal teams
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-5 bg-gradient-to-r from-slate-900 via-indigo-700 to-blue-700 bg-clip-text text-transparent dark:from-white dark:via-indigo-300 dark:to-blue-300">
            AdvocatePro
          </h1>
          <p className="text-lg md:text-2xl mb-10 max-w-4xl mx-auto text-slate-600 dark:text-slate-300">
            Manage clients, cases, and documents from one place. Powerful tools, beautiful UI, and fast workflows.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/users/login" className="inline-flex items-center justify-center rounded-lg text-base font-semibold px-8 py-4 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-sm transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              Client Login
            </Link>
            <Link href="/advocate/login" className="inline-flex items-center justify-center rounded-lg text-base font-semibold px-8 py-4 text-foreground bg-muted hover:bg-muted/80 border border-border transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              Advocate Login
            </Link>
            <Link href="/services" className="inline-flex items-center justify-center rounded-lg text-base font-semibold px-8 py-4 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 border border-indigo-200 dark:border-indigo-900/40">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              View Services
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-6 shadow-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">500+</div>
              <div className="text-slate-600 dark:text-slate-400 mt-1">Active Advocates</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-6 shadow-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">10K+</div>
              <div className="text-slate-600 dark:text-slate-400 mt-1">Cases Managed</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-6 shadow-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">99%</div>
              <div className="text-slate-600 dark:text-slate-400 mt-1">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Accents */}
      <div className="absolute top-24 left-10 w-20 h-20 bg-indigo-500/10 rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400/20 rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cyan-400/20 rounded-full animate-pulse delay-2000" />
    </div>
  )
}
