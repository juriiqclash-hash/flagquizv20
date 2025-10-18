import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClansMenu } from '@/components/ClansMenu';
import MainMenu from '@/components/MainMenu';

export default function ClansPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(true);
  const clanId = searchParams.get('clanId');

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      navigate('/');
    }
    setOpen(newOpen);
  };

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleClanIdProcessed = () => {
    setSearchParams({});
  };

  return (
    <>
      <MainMenu
        onStart={() => navigate('/quiz')}
        onMultiplayerStart={() => navigate('/multiplayer')}
        onStartQuiz={() => {}}
      />
      <ClansMenu
        open={open}
        onOpenChange={handleOpenChange}
        initialClanId={clanId || undefined}
        onClanIdProcessed={handleClanIdProcessed}
      />
    </>
  );
}
