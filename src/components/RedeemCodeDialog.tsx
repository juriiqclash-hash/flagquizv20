import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Ticket, Search, Gift, Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface RedeemCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CodePreview {
  code_type: string;
  value: Record<string, any>;
}

const CODE_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  premium_time: { label: 'Premium', icon: '👑', color: 'text-yellow-500' },
  ultimate_time: { label: 'Ultimate', icon: '💎', color: 'text-purple-500' },
  xp: { label: 'XP Bonus', icon: '⭐', color: 'text-blue-500' },
  badge: { label: 'Badge', icon: '🏅', color: 'text-orange-500' },
  chat_style: { label: 'Chat Style', icon: '💬', color: 'text-pink-500' },
  admin_time: { label: 'Admin Rechte', icon: '🛡️', color: 'text-red-500' },
  double_xp: { label: 'Doppelte XP', icon: '✨', color: 'text-green-500' },
  profile_frame: { label: 'Profilrahmen', icon: '🖼️', color: 'text-cyan-500' },
};

export function RedeemCodeDialog({ open, onOpenChange }: RedeemCodeDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<CodePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setCode('');
    setPreview(null);
    setError(null);
    setSuccess(false);
  };

  const handleQuery = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError(null);
    setPreview(null);
    
    try {
      const { data, error: queryError } = await supabase
        .from('redemption_codes')
        .select('code_type, value, is_active, expires_at, max_uses, current_uses')
        .eq('code', code.toUpperCase().trim())
        .maybeSingle();

      if (queryError) throw queryError;

      if (!data) {
        setError('Code nicht gefunden');
        return;
      }

      if (!data.is_active) {
        setError('Dieser Code ist deaktiviert');
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError('Dieser Code ist abgelaufen');
        return;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        setError('Dieser Code wurde bereits zu oft verwendet');
        return;
      }

      // Check if already redeemed
      if (user) {
        const { data: redemptionData } = await supabase
          .from('redemption_codes')
          .select('id')
          .eq('code', code.toUpperCase().trim())
          .single();

        if (redemptionData) {
          const { data: existingRedemption } = await supabase
            .from('code_redemptions')
            .select('id')
            .eq('code_id', redemptionData.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingRedemption) {
            setError('Du hast diesen Code bereits eingelöst');
            return;
          }
        }
      }

      setPreview({
        code_type: data.code_type,
        value: data.value as Record<string, any>
      });
    } catch (err) {
      console.error('Error querying code:', err);
      setError('Fehler beim Abfragen des Codes');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!code.trim() || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: redeemError } = await supabase.rpc('redeem_code', {
        p_code: code.toUpperCase().trim(),
        p_user_id: user.id
      });

      if (redeemError) throw redeemError;

      const result = data as { success: boolean; error?: string; code_type?: string; value?: any };

      if (!result.success) {
        setError(result.error || 'Code konnte nicht eingelöst werden');
        return;
      }

      setSuccess(true);
      setPreview({
        code_type: result.code_type!,
        value: result.value
      });

      toast({
        title: '🎉 Code eingelöst!',
        description: getRewardDescription(result.code_type!, result.value),
      });

    } catch (err) {
      console.error('Error redeeming code:', err);
      setError('Fehler beim Einlösen des Codes');
    } finally {
      setLoading(false);
    }
  };

  const getRewardDescription = (type: string, value: any): string => {
    switch (type) {
      case 'premium_time':
        return `Premium für ${value.duration_days} Tage freigeschaltet!`;
      case 'ultimate_time':
        return `Ultimate für ${value.duration_days} Tage freigeschaltet!`;
      case 'xp':
        return `${value.xp_amount} XP erhalten!`;
      case 'badge':
        return `Badge "${value.badge_name}" erhalten!`;
      case 'chat_style':
        return `Fette Chat-Nachrichten für ${value.duration_days} Tage!`;
      case 'admin_time':
        return `Admin-Rechte für ${value.duration_days} Tage!`;
      case 'double_xp':
        return `Doppelte XP für ${value.duration_days} Tage!`;
      case 'profile_frame':
        return `Profilrahmen "${value.frame_name}" erhalten!`;
      default:
        return 'Belohnung erhalten!';
    }
  };

  const renderPreview = () => {
    if (!preview) return null;
    
    const typeInfo = CODE_TYPE_LABELS[preview.code_type] || { label: preview.code_type, icon: '🎁', color: 'text-gray-500' };
    
    return (
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{typeInfo.icon}</span>
          <div>
            <p className={`font-bold ${typeInfo.color}`}>{typeInfo.label}</p>
            <p className="text-sm text-muted-foreground">
              {getRewardDescription(preview.code_type, preview.value)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetState(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Code einlösen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Erfolgreich eingelöst! 🎉</h3>
              {renderPreview()}
              <Button 
                className="mt-4" 
                onClick={() => { resetState(); onOpenChange(false); }}
              >
                Schließen
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Input
                  placeholder="Code eingeben..."
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                    setPreview(null);
                  }}
                  className="text-center font-mono text-lg tracking-wider"
                  maxLength={20}
                />
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <XCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>

              {preview && renderPreview()}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleQuery}
                  disabled={loading || !code.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Abfragen
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleRedeem}
                  disabled={loading || !code.trim() || !user}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Gift className="h-4 w-4 mr-2" />
                  )}
                  Einlösen
                </Button>
              </div>

              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  Du musst angemeldet sein, um Codes einzulösen.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
