import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { Ticket, Plus, Copy, Trash2, RefreshCw, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { Switch } from './ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface RedemptionCode {
  id: string;
  code: string;
  code_type: string;
  value: Record<string, any>;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

const CODE_TYPES = [
  { value: 'premium_time', label: 'Premium Zeit', icon: '👑' },
  { value: 'ultimate_time', label: 'Ultimate Zeit', icon: '💎' },
  { value: 'xp', label: 'XP Bonus', icon: '⭐' },
  { value: 'badge', label: 'Badge', icon: '🏅' },
  { value: 'chat_style', label: 'Chat Style', icon: '💬' },
  { value: 'admin_time', label: 'Admin Rechte', icon: '🛡️' },
  { value: 'double_xp', label: 'Doppelte XP', icon: '✨' },
  { value: 'profile_frame', label: 'Profilrahmen', icon: '🖼️' },
];

export default function AdminCodeManager() {
  const { toast } = useToast();
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteCodeId, setDeleteCodeId] = useState<string | null>(null);

  // Form state
  const [newCode, setNewCode] = useState('');
  const [codeType, setCodeType] = useState('premium_time');
  const [durationDays, setDurationDays] = useState('30');
  const [xpAmount, setXpAmount] = useState('500');
  const [badgeId, setBadgeId] = useState('');
  const [badgeName, setBadgeName] = useState('');
  const [badgeEmoji, setBadgeEmoji] = useState('🏅');
  const [badgeColor, setBadgeColor] = useState('#9333ea');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchCodes();
  }, [filterType]);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('redemption_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('code_type', filterType as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCodes((data as RedemptionCode[]) || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(result);
  };

  const createCode = async () => {
    if (!newCode.trim()) {
      toast({ title: 'Fehler', description: 'Bitte Code eingeben', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let value: Record<string, any> = {};
      
      switch (codeType) {
        case 'premium_time':
        case 'ultimate_time':
        case 'chat_style':
        case 'admin_time':
        case 'double_xp':
          value = { duration_days: parseInt(durationDays) };
          break;
        case 'xp':
          value = { xp_amount: parseInt(xpAmount) };
          break;
        case 'badge':
        case 'profile_frame':
          value = {
            badge_id: badgeId,
            badge_name: badgeName,
            badge_emoji: badgeEmoji,
            badge_color: badgeColor,
          };
          break;
      }

      const { error } = await supabase.from('redemption_codes').insert({
        code: newCode.toUpperCase().trim(),
        code_type: codeType as any,
        value,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
        created_by: user.id,
      } as any);

      if (error) throw error;

      toast({ title: 'Erfolg', description: 'Code erstellt' });
      resetForm();
      fetchCodes();
    } catch (error: any) {
      toast({ 
        title: 'Fehler', 
        description: error.message || 'Code konnte nicht erstellt werden', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewCode('');
    setDurationDays('30');
    setXpAmount('500');
    setBadgeId('');
    setBadgeName('');
    setBadgeEmoji('🏅');
    setBadgeColor('#9333ea');
    setMaxUses('');
    setExpiresAt('');
  };

  const toggleCodeActive = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('redemption_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) throw error;

      toast({ 
        title: 'Erfolg', 
        description: currentStatus ? 'Code deaktiviert' : 'Code aktiviert' 
      });
      fetchCodes();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht geändert werden', variant: 'destructive' });
    }
  };

  const deleteCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('redemption_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast({ title: 'Erfolg', description: 'Code gelöscht' });
      setDeleteCodeId(null);
      fetchCodes();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Code konnte nicht gelöscht werden', variant: 'destructive' });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Kopiert!', description: code });
  };

  const filteredCodes = codes.filter(code => 
    code.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getValueDisplay = (code: RedemptionCode): string => {
    switch (code.code_type) {
      case 'premium_time':
      case 'ultimate_time':
      case 'chat_style':
      case 'admin_time':
      case 'double_xp':
        return `${code.value.duration_days} Tage`;
      case 'xp':
        return `${code.value.xp_amount} XP`;
      case 'badge':
      case 'profile_frame':
        return `${code.value.badge_emoji} ${code.value.badge_name}`;
      default:
        return JSON.stringify(code.value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Code Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Neuen Code erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <div className="flex gap-2">
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="CODE123AB"
                  className="font-mono"
                />
                <Button variant="outline" onClick={generateRandomCode}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Code-Typ</Label>
              <Select value={codeType} onValueChange={setCodeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CODE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic value fields based on type */}
            {['premium_time', 'ultimate_time', 'chat_style', 'admin_time', 'double_xp'].includes(codeType) && (
              <div className="space-y-2">
                <Label>Dauer (Tage)</Label>
                <Input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  min="1"
                />
              </div>
            )}

            {codeType === 'xp' && (
              <div className="space-y-2">
                <Label>XP Menge</Label>
                <Input
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(e.target.value)}
                  min="1"
                />
              </div>
            )}

            {['badge', 'profile_frame'].includes(codeType) && (
              <>
                <div className="space-y-2">
                  <Label>Badge ID</Label>
                  <Input
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="beta_tester"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Name</Label>
                  <Input
                    value={badgeName}
                    onChange={(e) => setBadgeName(e.target.value)}
                    placeholder="Beta Tester"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emoji</Label>
                  <Input
                    value={badgeEmoji}
                    onChange={(e) => setBadgeEmoji(e.target.value)}
                    placeholder="🏅"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Farbe</Label>
                  <Input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Max. Verwendungen (leer = unbegrenzt)</Label>
              <Input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                min="1"
                placeholder="Unbegrenzt"
              />
            </div>

            <div className="space-y-2">
              <Label>Ablaufdatum (optional)</Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={createCode} disabled={loading}>
            <Ticket className="h-4 w-4 mr-2" />
            Code erstellen
          </Button>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Alle Codes ({filteredCodes.length})
            </span>
            <Button variant="outline" size="sm" onClick={fetchCodes}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Code suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Alle Typen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                {CODE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Wert</TableHead>
                  <TableHead>Verwendet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => {
                  const typeInfo = CODE_TYPES.find(t => t.value === code.code_type);
                  return (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-bold">
                        {code.code}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-2 h-6 w-6 p-0"
                          onClick={() => copyCode(code.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {typeInfo?.icon} {typeInfo?.label}
                        </span>
                      </TableCell>
                      <TableCell>{getValueDisplay(code)}</TableCell>
                      <TableCell>
                        {code.current_uses}/{code.max_uses ?? '∞'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          code.is_active 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {code.is_active ? 'Aktiv' : 'Deaktiviert'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCodeActive(code.id, code.is_active)}
                          >
                            {code.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteCodeId(code.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Keine Codes gefunden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCodeId} onOpenChange={() => setDeleteCodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Code löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Code wird unwiderruflich gelöscht. Nutzer, die ihn bereits eingelöst haben, behalten ihre Belohnungen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteCodeId && deleteCode(deleteCodeId)}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
