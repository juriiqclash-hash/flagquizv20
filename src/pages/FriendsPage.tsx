import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FriendsMenu } from '@/components/FriendsMenu';
import MainMenu from '@/components/MainMenu';

export default function FriendsPage() {
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
      <FriendsMenu open={open} onOpenChange={handleOpenChange} />
    </>
  );
}
