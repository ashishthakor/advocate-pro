import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'advocate' | 'user';
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from request headers
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Verify token from request
 */
export async function verifyTokenFromRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return {
        success: false,
        error: 'No token provided'
      };
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }

    return {
      success: true,
      user: payload
    };
  } catch (error) {
    return {
      success: false,
      error: 'Token verification failed'
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: JWTPayload, requiredRole: string | string[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  return user.role === requiredRole;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: JWTPayload): boolean {
  return user.role === 'admin';
}

/**
 * Check if user is advocate
 */
export function isAdvocate(user: JWTPayload): boolean {
  return user.role === 'advocate';
}

/**
 * Check if user is regular user
 */
export function isUser(user: JWTPayload): boolean {
  return user.role === 'user';
}

/**
 * Middleware for role-based access control
 */
export function requireRole(requiredRole: string | string[]) {
  return async (request: NextRequest): Promise<AuthResult> => {
    const authResult = await verifyTokenFromRequest(request);
    
    if (!authResult.success || !authResult.user) {
      return authResult;
    }

    if (!hasRole(authResult.user, requiredRole)) {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    return authResult;
  };
}

/**
 * Middleware for admin access
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware for advocate access
 */
export const requireAdvocate = requireRole(['admin', 'advocate']);

/**
 * Middleware for user access
 */
export const requireUser = requireRole(['admin', 'advocate', 'user']);
