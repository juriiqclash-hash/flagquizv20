import { useState } from 'react';
import { Shield, X, Plus, Users, Crown, Upload, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface ClanMember {
  id: string;
  username: string;
  avatarUrl?: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

interface Clan {
  id: string;
  name: string;
  emoji: string;
  description: string;
  imageUrl?: string;
  members: ClanMember[];
  maxMembers: number;
  createdAt: string;
  leaderId: string;
}

interface ClanMenuProps {
  open: boolean;
  onClose: () => void;
}

const MOCK_CLANS: Clan[] = [
  {
    id: '1',
    name: 'Agharta',
    emoji: '🏯',
    description: 'Die legendären Krieger der verlorenen Stadt. Wir streben nach Perfektion und Ehre in jedem Quiz.',
    imageUrl: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=600',
    members: [
      { id: '1', username: 'DragonMaster', role: 'leader', joinedAt: '2025-01-01' },
      { id: '2', username: 'QuizPro99', role: 'member', joinedAt: '2025-01-02' },
      { id: '3', username: 'FlagExpert', role: 'member', joinedAt: '2025-01-03' },
    ],
    maxMembers: 30,
    createdAt: '2025-01-01',
    leaderId: '1'
  },
  {
    id: '2',
    name: 'Atlantis',
    emoji: '💎',
    description: 'Aus den Tiefen des Ozeans erheben wir uns. Elite-Spieler vereint für den ultimativen Sieg.',
    imageUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=600',
    members: [
      { id: '4', username: 'OceanKing', role: 'leader', joinedAt: '2025-01-01' },
      { id: '5', username: 'WaveRider', role: 'member', joinedAt: '2025-01-05' },
    ],
    maxMembers: 30,
    createdAt: '2025-01-01',
    leaderId: '4'
  },
  {
    id: '3',
    name: 'Shambhala',
    emoji: '☀️',
    description: 'Erleuchtung durch Wissen. Wir sind die Weisen, die jeden Test meistern.',
    imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
    members: [
      { id: '6', username: 'Enlightened', role: 'leader', joinedAt: '2025-01-02' },
    ],
    maxMembers: 30,
    createdAt: '2025-01-02',
    leaderId: '6'
  },
  {
    id: '4',
    name: 'El Dorado',
    emoji: '🪙',
    description: 'Die goldene Stadt der Champions. Hier sammeln sich nur die besten der Besten.',
    members: [
      { id: '7', username: 'GoldHunter', role: 'leader', joinedAt: '2025-01-03' },
      { id: '8', username: 'TreasureSeeker', role: 'member', joinedAt: '2025-01-04' },
      { id: '9', username: 'RichPlayer', role: 'member', joinedAt: '2025-01-05' },
      { id: '10', username: 'DiamondFinder', role: 'member', joinedAt: '2025-01-06' },
    ],
    maxMembers: 30,
    createdAt: '2025-01-03',
    leaderId: '7'
  },
];

export const ClanMenu = ({ open, onClose }: ClanMenuProps) => {
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClan, setNewClan] = useState({
    name: '',
    emoji: '🛡️',
    description: '',
    imageUrl: ''
  });

  const handleCreateClan = () => {
    console.log('Creating clan:', newClan);
    setShowCreateForm(false);
    setNewClan({ name: '', emoji: '🛡️', description: '', imageUrl: '' });
  };

  const handleJoinClan = (clan: Clan) => {
    console.log('Joining clan:', clan.name);
  };

  if (!open) return null;

  if (showCreateForm) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <button
          onClick={() => setShowCreateForm(false)}
          className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Clan erstellen</h2>
              <p className="text-gray-600">Erstelle deinen eigenen Clan und lade Freunde ein</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Clan Name</label>
              <Input
                value={newClan.name}
                onChange={(e) => setNewClan({ ...newClan, name: e.target.value })}
                placeholder="z.B. Die Unbesiegbaren"
                className="text-lg h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Emoji</label>
              <Input
                value={newClan.emoji}
                onChange={(e) => setNewClan({ ...newClan, emoji: e.target.value })}
                placeholder="🛡️"
                className="text-4xl h-16 text-center"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Beschreibung</label>
              <Textarea
                value={newClan.description}
                onChange={(e) => setNewClan({ ...newClan, description: e.target.value })}
                placeholder="Beschreibe deinen Clan und was ihn besonders macht..."
                className="min-h-32 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Clan Bild (URL)</label>
              <div className="flex gap-3">
                <Input
                  value={newClan.imageUrl}
                  onChange={(e) => setNewClan({ ...newClan, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Upload className="w-5 h-5" />
                </Button>
              </div>
              {newClan.imageUrl && (
                <div className="mt-3">
                  <img
                    src={newClan.imageUrl}
                    alt="Vorschau"
                    className="w-full h-32 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Bild+nicht+gefunden';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 h-12"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreateClan}
                disabled={!newClan.name || !newClan.description}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Clan erstellen
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedClan) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <button
          onClick={() => setSelectedClan(null)}
          className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="w-full max-w-5xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 overflow-hidden">
              {selectedClan.imageUrl && (
                <img
                  src={selectedClan.imageUrl}
                  alt={selectedClan.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <div className="absolute bottom-6 left-8 flex items-end gap-6">
                <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-7xl ring-4 ring-white/50">
                  {selectedClan.emoji}
                </div>
                <div className="pb-2">
                  <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    {selectedClan.name}
                  </h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">
                        {selectedClan.members.length}/{selectedClan.maxMembers} Mitglieder
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Über den Clan
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {selectedClan.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Mitglieder ({selectedClan.members.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {selectedClan.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                          {member.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{member.username}</p>
                          {member.role === 'leader' && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Beigetreten: {new Date(member.joinedAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {member.role === 'leader' ? 'Anführer' : 'Mitglied'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setSelectedClan(null)}
                  className="flex-1 h-12"
                >
                  Zurück
                </Button>
                <Button
                  onClick={() => handleJoinClan(selectedClan)}
                  disabled={selectedClan.members.length >= selectedClan.maxMembers}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {selectedClan.members.length >= selectedClan.maxMembers
                    ? 'Clan ist voll'
                    : 'Clan beitreten'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white">Clans</h1>
              <p className="text-xl text-gray-300 mt-1">Finde deinen perfekten Clan oder erstelle einen eigenen</p>
            </div>
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="h-14 px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
          >
            <Plus className="w-6 h-6 mr-2" />
            Clan erstellen
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
          {MOCK_CLANS.map((clan) => (
            <Card
              key={clan.id}
              className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
              onClick={() => setSelectedClan(clan)}
            >
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                {clan.imageUrl ? (
                  <img
                    src={clan.imageUrl}
                    alt={clan.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="font-bold text-gray-900">
                      {clan.members.length}/{clan.maxMembers}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-4xl ring-2 ring-white/50">
                    {clan.emoji}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                      {clan.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 line-clamp-2 mb-4 min-h-[3rem]">
                  {clan.description}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {clan.members.slice(0, 4).map((member) => (
                      <Avatar
                        key={member.id}
                        className="h-8 w-8 ring-2 ring-white shadow-md"
                      >
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                          {member.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {clan.members.length > 4 && (
                      <div className="h-8 w-8 ring-2 ring-white shadow-md rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          +{clan.members.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {clan.members.length === 1
                      ? '1 Mitglied'
                      : `${clan.members.length} Mitglieder`}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
