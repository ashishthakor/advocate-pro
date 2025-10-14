'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from 'components/AuthProvider';

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); 
  };

  return (
    <button onClick={handleLogout} className="btn-secondary">
      Logout
    </button>
  );
}