import { useState } from 'react';
import { ChevronLeft, ChevronRight, Crown, Gift, Newspaper, Shield, Award, Sparkles, MessageCircle } from 'lucide-react';

interface InfoPanelCarouselProps {
  mobile?: boolean;
  onOpenRedeemCode?: () => void;
}

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current text-white">
    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
  </svg>
);

export default function InfoPanelCarousel({ mobile = false, onOpenRedeemCode }: InfoPanelCarouselProps) {
  const [currentPanel, setCurrentPanel] = useState(0);
  const totalPanels = 5;

  const nextPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPanel((prev) => (prev + 1) % totalPanels);
  };

  const prevPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPanel((prev) => (prev - 1 + totalPanels) % totalPanels);
  };

  const goToPanel = (index: number) => {
    setCurrentPanel(index);
  };

  const handleDiscord = () => {
    window.open('https://discord.gg/flagquiz', '_blank');
  };

  const handleRedeemCode = () => {
    if (onOpenRedeemCode) {
      onOpenRedeemCode();
    }
  };

  const panelHeight = mobile ? 'h-[180px]' : 'h-[185px]';

  const panels = [
    // Panel 1: Discord
    <div key="discord" className={`${panelHeight} flex flex-col`} onClick={handleDiscord}>
      <div className="flex-1 bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-2xl flex items-center justify-center cursor-pointer hover:from-purple-600/50 hover:to-blue-600/50 transition-all">
        <div className="text-center p-4">
          <DiscordIcon />
          <h3 className="text-white text-lg font-bold mt-2">DISCORD</h3>
          <p className="text-white/70 text-sm mt-1">Tritt unserem Server bei!</p>
        </div>
      </div>
    </div>,

    // Panel 2: Ultimate Info
    <div key="ultimate" className={`${panelHeight} flex flex-col`} onClick={handleRedeemCode}>
      <div className="flex-1 bg-gradient-to-br from-amber-500/30 to-yellow-600/30 rounded-2xl flex items-center justify-center cursor-pointer hover:from-amber-500/40 hover:to-yellow-600/40 transition-all relative overflow-hidden">
        <Sparkles className="absolute top-3 left-3 w-5 h-5 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute bottom-3 right-3 w-5 h-5 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute top-3 right-8 w-4 h-4 text-amber-300 animate-pulse delay-100" />
        <div className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-10 h-10 text-yellow-400" />
            <Gift className="w-8 h-8 text-amber-300" />
          </div>
          <h3 className="text-white text-lg font-bold">GRATIS UPGRADE!</h3>
          <div className="bg-black/30 rounded-lg px-4 py-2 mt-2">
            <p className="text-yellow-400 text-xl font-mono font-bold">ULTIMATE</p>
          </div>
          <p className="text-white/80 text-sm mt-2">75 Tage Premium gratis!</p>
        </div>
      </div>
    </div>,

    // Panel 3: News
    <div key="news" className={`${panelHeight} flex flex-col`}>
      <div className="flex-1 bg-gradient-to-br from-blue-500/30 to-cyan-600/30 rounded-2xl p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white text-lg font-bold">NEWS</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 bg-white/10 rounded-lg p-2">
            <span className="text-cyan-400">🎮</span>
            <p className="text-white/90">Neuer Multiplayer-Modus verfügbar!</p>
          </div>
          <div className="flex items-start gap-2 bg-white/10 rounded-lg p-2">
            <span className="text-green-400">🏆</span>
            <p className="text-white/90">Daily Challenge jetzt mit Belohnungen</p>
          </div>
          <div className="flex items-start gap-2 bg-white/10 rounded-lg p-2">
            <span className="text-purple-400">✨</span>
            <p className="text-white/90">Profile können angepasst werden</p>
          </div>
        </div>
      </div>
    </div>,

    // Panel 4: Co-Admin
    <div key="coadmin" className={`${panelHeight} flex flex-col`}>
      <div className="flex-1 bg-gradient-to-br from-emerald-500/30 to-teal-600/30 rounded-2xl flex items-center justify-center">
        <div className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-white text-lg font-bold">WERDE CO-ADMIN!</h3>
          <p className="text-white/70 text-sm mt-2 mb-3">Hilf uns beim Moderieren</p>
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <p className="text-emerald-400 text-sm">Schreibe im Global Chat:</p>
            <p className="text-white font-mono text-sm">"Ich möchte Co-Admin werden"</p>
          </div>
        </div>
      </div>
    </div>,

    // Panel 5: Badges
    <div key="badges" className={`${panelHeight} flex flex-col`}>
      <div className="flex-1 bg-gradient-to-br from-pink-500/30 to-rose-600/30 rounded-2xl p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-6 h-6 text-pink-400" />
          <h3 className="text-white text-lg font-bold">BADGES</h3>
        </div>
        <div className="space-y-2 text-sm mb-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
            <span>🎭</span>
            <p className="text-white/90 font-medium">Molester</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
            <span>👁️</span>
            <p className="text-white/90 font-medium">Rapist</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
            <span>🔍</span>
            <p className="text-white/90 font-medium">Noticer</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/60 text-xs">
          <MessageCircle className="w-3 h-3" />
          <p>Ideen? Schreibe in den Global Chat!</p>
        </div>
      </div>
    </div>,
  ];

  const titles = ['DISCORD', 'ULTIMATE', 'NEWS', 'CO-ADMIN', 'BADGES'];

  return (
    <div className="flex flex-col h-full">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevPanel}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h4 className="text-white text-base font-bold tracking-wide">{titles[currentPanel]}</h4>
        <button
          onClick={nextPanel}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentPanel * 100}%)` }}
        >
          {panels.map((panel, index) => (
            <div key={index} className="min-w-full h-full">
              {panel}
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {Array.from({ length: totalPanels }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToPanel(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentPanel
                ? 'bg-white w-4'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
