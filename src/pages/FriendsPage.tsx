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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url("/F5BD60DF-0BF3-4DCD-B9C2-C433C2CB0628.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <FriendsMenu open={open} onOpenChange={handleOpenChange} />
    </div>
  );
}
