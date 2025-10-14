"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "components/AuthProvider";
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
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme as useAppTheme } from "components/ThemeProvider";
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

export default function UserRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();
  const { theme } = useAppTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'user',
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/users/login');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);

  return (
    <MuiThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <CssBaseline />

      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Banner Section */}
        <Box
          sx={{
            height: { xs: 200, md: 300 },
            backgroundImage: `url(${bgImage.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 2,
          }}
        />

        {/* Signup Card */}
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
                xs: "100%", // mobile
                sm: "90%", // tablet
                md: "50%", // medium screens
                lg: "40%", // large screens
              },
              maxWidth: 600,
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
            })}
          >
            <div className="bg-blue-600 text-white rounded-lg text-center py-10 relative top-[-80px] flex flex-col gap-2">
              <span className="font-serif text-3xl">
                Empower Your Legal Journey
              </span>
              <span className="font-mono text-[14px] text-zinc-300">
                Join now to connect with trusted advocates and track your cases.
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

            <form onSubmit={handleSubmit} className="relative -top-10">
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
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
              <TextField
                label="Confirm Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label="I agree to the Terms and Conditions"
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                sx={{ mt: 2 }}
                disabled={
                  !formData.name ||
                  !formData.email ||
                  !formData.password ||
                  !formData.confirmPassword ||
                  !agreedToTerms ||
                  loading
                }
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account? <Link href="/users/login">Sign In</Link>
              </Typography>
            </Box>
          </Paper>
        </Container>

        {/* Footer */}
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
              &copy; {new Date().getFullYear()} AdvocatePro. All rights
              reserved.
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
  );
}
