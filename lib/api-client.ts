'use client';

import Cookies from 'js-cookie';

// Global notification handler - will be set by NotificationProvider
let globalNotificationHandler: ((message: string, severity: 'success' | 'error' | 'warning' | 'info') => void) | null = null;

export const setGlobalNotificationHandler = (handler: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void) => {
  globalNotificationHandler = handler;
};

type ApiInput = RequestInfo | URL;
type ApiInit = RequestInit & { json?: unknown };

function buildHeaders(init?: ApiInit): HeadersInit {
  const headers = new Headers(init?.headers || {});

  // Attach Authorization from cookie token
  let token = Cookies.get('token');
  if (!token && typeof window !== 'undefined') {
    try {
      const lsToken = window.localStorage.getItem('token');
      if (lsToken) token = lsToken;
    } catch {}
  }
  if (token && !headers.has('authorization')) {
    headers.set('authorization', `Bearer ${token}`);
  }

  // If user passed json payload, set content-type unless it's FormData
  const isFormData = typeof init?.body !== 'undefined' && init?.body instanceof FormData;
  if (!isFormData && init?.json !== undefined && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return headers;
}

export async function apiFetch<T = any>(input: ApiInput, init?: ApiInit): Promise<T> {
  const headers = buildHeaders(init);
  const { json, ...rest } = init || {};

  const fetchInit: RequestInit = {
    credentials: 'include',
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  };

  const res = await fetch(input, fetchInit);

  // Handle 401 Unauthorized responses
  if (res.status === 401) {
    // Clear any stored tokens
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('token');
        Cookies.remove('token');
      } catch {}
    }
    
    // Show error notification
    if (globalNotificationHandler) {
      globalNotificationHandler('Session expired. Please login again.', 'error');
    }
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    
    throw new Error('Unauthorized - Please login again');
  }

  // Try to parse JSON; if fails, throw with status text
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : (await res.text());

  if (!res.ok) {
    const message = isJson && data && (data.message || data.error) ? (data.message || data.error) : res.statusText;
    
    // Show error notification for failed requests
    if (globalNotificationHandler) {
      globalNotificationHandler(message || 'Request failed', 'error');
    }
    
    throw new Error(message || 'Request failed');
  }

  // Show success notification for POST, PUT, DELETE requests
  const method = (init?.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE'].includes(method) && globalNotificationHandler) {
    let successMessage = '';
    
    // Try to get specific message from backend response
    if (isJson && data && data.message) {
      successMessage = data.message;
    } else {
      // Fallback to generic messages
      switch (method) {
        case 'POST':
          successMessage = 'Created successfully';
          break;
        case 'PUT':
          successMessage = 'Updated successfully';
          break;
        case 'DELETE':
          successMessage = 'Deleted successfully';
          break;
      }
    }
    
    globalNotificationHandler(successMessage, 'success');
  }

  return data as T;
}

export function getAuthHeader(): HeadersInit {
  let token = Cookies.get('token');
  if (!token && typeof window !== 'undefined') {
    try {
      const lsToken = window.localStorage.getItem('token');
      if (lsToken) token = lsToken;
    } catch {}
  }
  return token ? { authorization: `Bearer ${token}` } : {};
}



