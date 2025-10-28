import { useNavigate } from 'react-router-dom';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <AdminPanel onBack={() => navigate('/quizmenu')} />
  );
}
