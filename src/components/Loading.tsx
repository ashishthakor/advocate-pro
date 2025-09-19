export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 animate-bounce-gentle">
          <span className="text-primary-foreground font-bold text-2xl">TC</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading TechCompete...</p>
      </div>
    </div>
  )
}
