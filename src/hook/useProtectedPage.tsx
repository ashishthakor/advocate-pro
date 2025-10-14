"use client";

import { useAuth } from "components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useProtectedPage(requiredRole: "user" | "advocate" | "admin") {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return; // Wait until auth finishes

    if (!user) {
      // Not logged in → redirect
      if (requiredRole === "advocate") {
        router.replace("/advocate/login");
      } else {
        // both user & admin will go to same login
        router.replace("/users/login");
      }
      return;
    }

    if (user.role !== requiredRole) {
      // Logged in but wrong role → kick to correct login
      if (user.role === "advocate") {
        router.replace("/advocate/login");
      } else {
        // again, both user & admin → /users/login
        router.replace("/users/login");
      }
      return;
    }

    setChecking(false);
  }, [user, loading, requiredRole, router]);

  return { user, loading: loading || checking };
}
