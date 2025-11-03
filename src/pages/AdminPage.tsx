import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin access is granted
    const hasAccess = sessionStorage.getItem('admin_access');
    if (!hasAccess) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleBack = () => {
    sessionStorage.removeItem('admin_access');
    navigate('/quizmenu');
  };

  return (
    <AdminPanel onBack={handleBack} />
  );
}
