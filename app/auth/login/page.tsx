'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the user login page by default
    router.push('/auth/user-login');
  }, [router]);

  return null; // Or a loading spinner
}
