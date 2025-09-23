'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import lightTheme from 'assets/theme'
import darkTheme from 'assets/theme-dark'
import { Card, CardContent, TextField, Button, FormControlLabel, Checkbox, Typography, InputAdornment, IconButton } from '@mui/material'
import { useTheme as useAppTheme } from '@/components/ThemeContext'

// Removed non-existent theme component imports; using styled JSX instead

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { theme } = useAppTheme()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const success = await register(formData.name, formData.email, formData.password, "advocate")
      if (success) router.push('/advocate/dashboard')
      else setError('Registration failed. Please try again.')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.match(/[a-z]/)) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const strength = passwordStrength(formData.password)

  return (
    <MuiThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Left: Marketing/Intro */}
          <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 text-white shadow-xl h-full">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">Join as an Advocate</h2>
              <p className="mt-3 text-blue-50/90 text-lg lg:text-xl">Showcase your expertise, onboard clients securely, and manage cases efficiently.</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  </span>
                  <span>Verified profiles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  </span>
                  <span>Secure onboarding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  </span>
                  <span>Case management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  </span>
                  <span>Trusted payments</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form Card using MUI to apply assets/theme overrides */}
          <Card className="rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 h-full">
            <CardContent className="p-6 sm:p-8 lg:p-10 h-full">
              <form onSubmit={handleSubmit}>
                <TextField id="name" name="name" label="Full Name" fullWidth required margin="normal" value={formData.name} onChange={handleInputChange} />
                <TextField id="email" name="email" type="email" label="Email Address" autoComplete="email" fullWidth required margin="normal" value={formData.email} onChange={handleInputChange} />
                <TextField id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password" fullWidth required margin="normal" value={formData.password} onChange={handleInputChange} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>) : (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>)}</IconButton></InputAdornment>) }} />
                {formData.password && (<div className="mt-2"><div className="flex space-x-1">{[1,2,3,4,5].map((level)=>(<div key={level} className={`h-1 flex-1 rounded ${level <= strength ? (strength <= 2 ? 'bg-red-500' : strength <= 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200 dark:bg-slate-700'}`} />))}</div><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{strength <= 2 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'} password</p></div>)}
                <TextField id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} label="Confirm Password" fullWidth required margin="normal" value={formData.confirmPassword} onChange={handleInputChange} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>) : (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>)}</IconButton></InputAdornment>) }} />
                <div className="mt-2"><FormControlLabel control={<Checkbox checked={agreedToTerms} onChange={(e)=>setAgreedToTerms(e.target.checked)} />} label={<span className="text-sm text-slate-700 dark:text-slate-300">I agree to the <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">Privacy Policy</Link></span>} /></div>
                {error && (<Typography variant="body2" color="error" className="mt-1">{error}</Typography>)}
                <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading || !agreedToTerms} className="mt-4">{loading ? 'Creating account...' : 'Create Account'}</Button>
                <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4">Already have an account?{' '}<Link href="/advocate/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Sign in here</Link></p>
              </form>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </MuiThemeProvider>
  )
}
