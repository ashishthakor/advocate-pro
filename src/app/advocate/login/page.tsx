'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import lightTheme from "assets/theme";
import darkTheme from "assets/theme-dark";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// ✅ replace with your advocate login banner
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

export default function AdvocateLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, logout } = useAuth()
  const router = useRouter()

  // you can dynamically detect dark/light mode if needed
  const themeMode = "light"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password, 'advocate')
      if (result.success) {
        if (result.role === 'advocate') {
          router.push('/advocate/dashboard')
        } else {
          setError('Invalid credentials or role mismatch.')
          logout()
        }
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MuiThemeProvider theme={themeMode === "dark" ? darkTheme : lightTheme}>
      <CssBaseline />

      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* 🔹 Banner Section */}
        <Box
          sx={{
            height: { xs: 200, md: 300 },
            backgroundImage: `url(${bgImage.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 2,
          }}
        />

        {/* 🔹 Login Card */}
        <Container
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: -10, // overlap card with banner
            position: "relative",
            zIndex: 2,
          }}
        >
          <Paper
            elevation={6}
            sx={(theme) => ({
              p: 4,
              borderRadius: 3,
              width: {
                xs: "100%",
                sm: "90%",
                md: "50%",
                lg: "40%",
              },
              maxWidth: 600,
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
            })}
          >
            {/* Header inside card */}
            <div className="bg-blue-600 text-white rounded-lg text-center py-8 relative top-[-60px] flex flex-col gap-2">
              <span className="font-serif text-2xl">
                Sign-in for Advocates
              </span>
              <span className="font-mono text-sm text-zinc-300">
                Enter your credentials to access your dashboard
              </span>
            </div>

            {error && (
              <Typography
                variant="body2"
                color="error"
                align="center"
                gutterBottom
              >
                {error}
              </Typography>
            )}

            <form onSubmit={handleSubmit} className="relative -top-6">
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                sx={{ mt: 2 }}
                disabled={!email || !password || loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don’t have an account?{" "}
                <Link href="/advocate/register">Sign Up</Link>
              </Typography>
            </Box>
          </Paper>
        </Container>

        {/* 🔹 Footer */}
        <Box
          component="footer"
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            mt: 12,
            pt: 4,
            pb: 2,
            textAlign: "center",
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
            maxWidth="lg"
            mx="auto"
            px={2}
          >
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} AdvocatePro. All rights reserved.
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: { xs: 2, md: 0 } }}
            >
              Made with <span className="text-red-500">❤️</span> for legal
              professionals
            </Typography>
          </Box>
        </Box>
      </Box>
    </MuiThemeProvider>
  )
}
