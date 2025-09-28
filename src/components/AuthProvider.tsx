"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    role: "advocate" | "user" | "admin"
  ) => Promise<any>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "advocate" | "user"
  ) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      const parsedUser: User = JSON.parse(storedUser);
      const rolePath =
        parsedUser.role === "advocate"
          ? "advocate"
          : parsedUser.role === "admin"
          ? "admin"
          : "user";

      const res = await fetch(`/api/${rolePath}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    role: "advocate" | "user" | "admin"
  ) => {
    try {
      const res = await fetch(`/api/${role}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        return {
          user: data.user,
          message: data.message,
          success: true,
          role: data.user.role,
        };
      }
      toast.error(data.message || "Login failed");
      return {
        user: null,
        message: data.message || "Login failed",
        success: false,
      };
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("An error occurred during login.");
      return { user: null, message: "Login failed", success: false };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "advocate" | "user"
  ) => {
    try {
      const res = await fetch(`/api/${role}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // Only save user if token exists
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }

        // Show message depending on role and approval status
        if (role === "advocate" && !data.user) {
          toast.success(
            "Registration successful! Wait for admin approval before login."
          );
        } else {
          toast.success(`Registration successful! Welcome, ${data.user?.name}`);
        }

        return true;
      }
      toast.error(data.message || "Registration failed");
      return false;
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error("An error occurred during registration.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast("Logged out successfully!");
    router.push("/"); // 🔹 Redirect to landing page
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
