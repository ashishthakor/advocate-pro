"use client";

import { useAuth } from "@/components/AuthProvider";
import { Loading } from "@/components/Loading";
import Link from "next/link";
import { useProtectedPage } from "@/hook/useProtectedPage";
import { useEffect, useState } from "react";

interface Stats {
  clients: number;
  cases: number;
  revenue: number;
}

export default function Dashboard() {
  const { user, loading } = useProtectedPage("advocate");

  const [stats, setStats] = useState<Stats>({
    clients: 0,
    cases: 0,
    revenue: 0,
  });

  // Fetch real stats once auth is ready (replace API endpoint)
  useEffect(() => {
    if (loading || !user) return;

    const fetchStats = async () => {
      try {
        // Example: implement /api/advocate/stats to return { clients, cases, revenue }
        const res = await fetch("/api/advocate/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          clients: data.clients ?? 0,
          cases: data.cases ?? 0,
          revenue: data.revenue ?? 0,
        });
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchStats();
  }, [loading, user]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your legal practice.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Active Clients</h3>
                <p className="text-3xl font-bold text-primary">
                  {stats.clients}
                </p>
                <p className="text-sm text-muted-foreground">
                  Currently representing
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {/* Icon */}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Open Cases</h3>
                <p className="text-3xl font-bold text-primary">{stats.cases}</p>
                <p className="text-sm text-muted-foreground">In progress</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {/* Icon */}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
                <p className="text-3xl font-bold text-primary">
                  ${stats.revenue}
                </p>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {/* Icon */}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (links) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link
            href="/clients"
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {/* Icon */}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Add Client</h3>
                <p className="text-sm text-muted-foreground">
                  Register new client
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/cases"
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {/* Icon */}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">New Case</h3>
                <p className="text-sm text-muted-foreground">
                  Create case file
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/documents"
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {/* Icon */}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Documents</h3>
                <p className="text-sm text-muted-foreground">Manage files</p>
              </div>
            </div>
          </Link>
        </div>

        {/* (Remaining UI unchanged) */}
      </div>
    </div>
  );
}
