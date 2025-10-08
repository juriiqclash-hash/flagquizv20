import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

interface BannerSettings {
  enabled: boolean;
  message: string;
  type: 'info' | 'warning' | 'error';
}

export default function SystemBanner() {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'banner')
        .single();

      if (data?.value) {
        const bannerData = data.value as unknown as BannerSettings;
        if (bannerData.enabled) {
          setBanner(bannerData);
        }
      }
    };

    fetchBanner();

    // Subscribe to changes
    const channel = supabase
      .channel('system-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.banner'
        },
        (payload) => {
          const newData = payload.new as { value: unknown };
          const bannerData = newData?.value as BannerSettings;
          if (bannerData?.enabled) {
            setBanner(bannerData);
            setDismissed(false);
          } else {
            setBanner(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!banner || dismissed) return null;

  const getIcon = () => {
    switch (banner.type) {
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (banner.type) {
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className={`${getBackgroundColor()} text-white py-3 px-4 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3 flex-1">
        {getIcon()}
        <p className="text-sm font-medium">{banner.message}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDismissed(true)}
        className="text-white hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
