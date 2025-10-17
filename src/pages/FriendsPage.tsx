import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FriendsMenu } from '@/components/FriendsMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function FriendsPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      navigate('/');
    }
    setOpen(newOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Hauptmenü
        </Button>
        <FriendsMenu open={open} onOpenChange={handleOpenChange} />
      </div>
    </div>
  );
}
