import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClansMenu } from '@/components/ClansMenu';
import MainMenu from '@/components/MainMenu';

export default function ClansPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      navigate('/');
    }
    setOpen(newOpen);
  };

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <MainMenu
        onStart={() => navigate('/quiz')}
        onMultiplayerStart={() => navigate('/multiplayer')}
        onStartQuiz={() => {}}
      />
      <ClansMenu open={open} onOpenChange={handleOpenChange} />
    </>
  );
}
