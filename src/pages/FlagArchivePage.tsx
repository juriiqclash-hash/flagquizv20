import { useNavigate } from 'react-router-dom';
import FlagArchive from '@/components/FlagArchive';

export default function FlagArchivePage() {
  const navigate = useNavigate();

  return (
    <FlagArchive onBackToStart={() => navigate('/quizmenu')} />
  );
}
