'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the user registration page by default
    router.push('/auth/user-register');
  }, [router]);

  return null; // Or a loading spinner
}
