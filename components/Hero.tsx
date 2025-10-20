"use client";
import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon,
  Scale as ScaleIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "50,000+", label: "Cases Managed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        py: { xs: 5, md: 6 },
        background: isDark
          ? "linear-gradient(180deg, #0B1120 0%, #0E1628 100%)"
          : "linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)",
      }}
    >
      {/* background glow */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        {/* Icon + Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 3,
              mb: 2,
              background: alpha(theme.palette.primary.main, 0.15),
            }}
          >
            <ScaleIcon sx={{ fontSize: 36, color: "primary.main" }} />
          </Box>
          <Chip
            label="Built for modern legal teams"
            size="small"
            sx={{
              mb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.light,
              fontWeight: 500,
            }}
          />
        </motion.div>

        {/* Title + Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: isDark ? "#e2e8f0" : "#0f172a",
            }}
          >
            ARBITALK
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 5,
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
              maxWidth: 650,
              mx: "auto",
              fontWeight: 400,
            }}
          >
            Manage clients, cases, documents, and appointments from one place.
            Powerful tools, beautiful UI, and fast workflows.
          </Typography>
        </motion.div>

        {/* Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          spacing={2}
          sx={{ mb: 6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              component={Link}
              href="/auth/user-register"
              startIcon={<LoginIcon />}
              sx={{
                fontWeight: 600,
                px: 4,
                py: 1.6,
                borderRadius: 2,
                textTransform: "none",
                background: "linear-gradient(90deg,#6366F1,#3B82F6)",
                boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
                "&:hover": {
                  boxShadow: "0 4px 32px rgba(99,102,241,0.6)",
                  background: "linear-gradient(90deg,#4F46E5,#2563EB)",
                },
              }}
            >
              Join as Client
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              component={Link}
              href="/auth/advocate-register"
              startIcon={<PersonAddIcon />}
              sx={{
                fontWeight: 600,
                px: 4,
                py: 1.6,
                borderRadius: 2,
                textTransform: "none",
                backgroundColor: alpha(theme.palette.grey[900], 0.8),
                color: "#fff",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.grey[800], 0.9),
                },
              }}
            >
              Join as Advocate
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="outlined"
              component={Link}
              href="/services"
              startIcon={<ArrowForwardIcon />}
              sx={{
                fontWeight: 600,
                px: 4,
                py: 1.6,
                borderRadius: 2,
                textTransform: "none",
                borderColor: alpha(theme.palette.primary.main, 0.4),
                color: isDark ? "#cbd5e1" : "#1e293b",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              View Services
            </Button>
          </motion.div>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
            marginBottom: "25PX"
          }}
        >
          <Chip label="✓ AI-Powered" color="success" size="small" />
          <Chip label="✓ Multi-Language" color="info" size="small" />
          <Chip label="✓ Arbitration Focus" color="warning" size="small" />
        </Box>

        {/* Metrics Section */}
        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
              >
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: "20px",
                    backdropFilter: "blur(16px)",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      background: "rgba(255, 255, 255, 0.12)",
                      boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
                    },
                  }}
                >
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      fontWeight: "700",
                      color: "primary.main",
                      mb: 1,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem" }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
