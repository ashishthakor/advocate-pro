"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {useProtectedPage} from "@/hook/useProtectedPage";

interface Advocate {
  id: number;
  name: string;
  email: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useProtectedPage("admin"); // get auth loading
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const router = useRouter();

  // Fetch advocates
  const fetchAdvocates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/advocates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.advocates)) {
        setAdvocates(data.advocates);
      } else {
        setAdvocates([]);
        toast.error(data.message || "Failed to load advocates.");
      }
    } catch (error) {
      console.error("Failed to fetch advocates:", error);
      toast.error("Failed to load advocates.");
    } finally {
      setLoading(false);
    }
  };

  // Page protection + fetch advocates
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/users/login"); // use replace instead of push
      } else if (user.role === "admin") {
        fetchAdvocates();
      } else {
        router.replace("/"); // redirect non-admin users
      }
    }
  }, [user, authLoading, router]);

  // Approve or decline advocate
  const handleAction = async (id: number, action: "approve" | "decline") => {
    setActionLoading(id);
    try {
      const url = `/api/admin/advocates/${id}/${action}`;
      const method = action === "approve" ? "PATCH" : "DELETE";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Advocate ${action}d successfully!`);
        fetchAdvocates();
      } else {
        toast.error(data.message || `Failed to ${action} advocate.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} advocate.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Show loading until auth check finishes
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center mt-[10%]">
        <CircularProgress />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null; // double check

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name} (Admin)
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Registered Advocates
        </Typography>

        {advocates.length === 0 ? (
          <Typography>No advocates found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Approved</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {advocates.map((advocate) => (
                <TableRow key={advocate.id} hover>
                  <TableCell>{advocate.name}</TableCell>
                  <TableCell>{advocate.email}</TableCell>
                  <TableCell>{advocate.isApproved ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {new Date(advocate.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {!advocate.isApproved ? (
                      <Box display="flex" gap={1}>
                        <Tooltip title="Approve Advocate">
                          <span>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() =>
                                handleAction(advocate.id, "approve")
                              }
                              disabled={actionLoading === advocate.id}
                            >
                              {actionLoading === advocate.id ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                "Approve"
                              )}
                            </Button>
                          </span>
                        </Tooltip>

                        <Tooltip title="Decline Advocate">
                          <span>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() =>
                                handleAction(advocate.id, "decline")
                              }
                              disabled={actionLoading === advocate.id}
                            >
                              {actionLoading === advocate.id ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                "Decline"
                              )}
                            </Button>
                          </span>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Typography color="green" fontWeight={500}>
                        Approved
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
