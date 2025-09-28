"use client";

import { useAuth } from "@/components/AuthProvider";
import { Loading } from "@/components/Loading";
import { useProtectedPage } from "@/hook/useProtectedPage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Shield } from "lucide-react";

const dummyUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "User" },
  { id: 3, name: "Charlie Lee", email: "charlie@example.com", role: "Advocate" },
];

export default function DashboardPage() {
  const { user, loading } = useProtectedPage("user");

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Welcome, {user?.name}
        </h1>
        <p className="text-muted-foreground">Role: {user?.role}</p>
      </div>

      {/* Role-specific actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* For All Users */}
        <Card className="shadow-sm border border-border/50">
          <CardHeader className="flex items-center space-x-2">
            <Users className="text-indigo-500" />
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              View and update your profile information.
            </p>
            <Button variant="default">Manage Profile</Button>
          </CardContent>
        </Card>

        {/* Advocate-specific */}
        {user?.role === "advocate" && (
          <Card className="shadow-sm border border-border/50">
            <CardHeader className="flex items-center space-x-2">
              <Briefcase className="text-green-500" />
              <CardTitle>Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Manage and track all your legal cases.
              </p>
              <Button variant="outline">View Cases</Button>
            </CardContent>
          </Card>
        )}

        {/* Admin-specific */}
        {user?.role === "admin" && (
          <Card className="shadow-sm border border-border/50">
            <CardHeader className="flex items-center space-x-2">
              <Shield className="text-red-500" />
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Approve advocates, manage users and monitor the system.
              </p>
              <Button variant="destructive">Go to Admin Panel</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Users List Table */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-border text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="py-2 px-4 border border-border text-left">
                    Name
                  </th>
                  <th className="py-2 px-4 border border-border text-left">
                    Email
                  </th>
                  <th className="py-2 px-4 border border-border text-left">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody>
                {dummyUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2 px-4 border border-border">
                      {u.name}
                    </td>
                    <td className="py-2 px-4 border border-border">
                      {u.email}
                    </td>
                    <td className="py-2 px-4 border border-border">
                      {u.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
