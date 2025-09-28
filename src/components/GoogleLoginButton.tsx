"use client";
import { Button } from "@mui/material";
import { signIn } from "next-auth/react";

interface GoogleLoginButtonProps {
  role: "user" | "advocate";
  callbackUrl?: string; // optional, defaults to "/"
}

export default function GoogleLoginButton({
  role,
  callbackUrl = "/",
}: GoogleLoginButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      type="submit"
      sx={{ mt: 2 }}
      onClick={() => signIn("google", { role, callbackUrl })}
      className="google-btn"
    >
      Sign in with Google
    </Button>
  );
}
