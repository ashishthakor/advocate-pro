import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "advo_competition",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function upsertOAuthUser({
  email,
  name,
  provider,
  providerId,
  role,
}: {
  email: string;
  name?: string | null;
  provider: string;
  providerId: string;
  role: string;
}) {
  const [rows1] = await pool.query(
    "SELECT id, email, name, role FROM users WHERE provider = ? AND provider_id = ? LIMIT 1",
    [provider, providerId]
  );
  if ((rows1 as any).length > 0) return (rows1 as any)[0];

  const [rows2] = await pool.query(
    "SELECT id, email, name, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  if ((rows2 as any).length > 0) {
    const existing = (rows2 as any)[0];
    await pool.query(
      "UPDATE users SET provider = ?, provider_id = ?, role = ? WHERE id = ?",
      [provider, providerId, role, existing.id]
    );
    return { ...existing, role };
  }

  const [result] = await pool.query(
    "INSERT INTO users (email, name, role, provider, provider_id) VALUES (?, ?, ?, ?, ?)",
    [email, name ?? null, role, provider, providerId]
  );
  return {
    id: (result as any).insertId,
    email,
    name,
    role,
  };
}
