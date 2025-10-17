import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/data/countries';

// Import Country type
import type { Country } from '@/data/countries';

// Deterministic PRNG + shuffle based on room_code to keep both clients in sync
const stringToSeed = (str: string) => {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0);
};

const mulberry32 = (a: number) => {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const seededShuffle = <T,>(array: T[], seedStr: string) => {
  const seed = stringToSeed(seedStr || 'default-seed');
  const rand = mulberry32(seed);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};


interface Lobby {
  id: string;
  room_code: string;
  owner_id: string;
  status: 'waiting' | 'started' | 'finished';
  round_start_timestamp?: number;
  time_limit: number;
  current_question_index: number;
  current_country_code?: string;
  winner_id?: string;
  game_mode?: string;
  selected_game_mode?: string;
  selected_continent?: string;
}

interface Participant {
  id: string;
  lobby_id: string;
  match_id: string;
  user_id: string;
  username: string;
  status: 'alive' | 'eliminated';
  score: number;
  lives: number;
  last_answer?: string;
  answer_time?: string;
  current_answer?: string;
  answer_submitted_at?: string;
  avatar_url?: string;
}

export const useMultiplayer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [gameCountries, setGameCountries] = useState<Country[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Tab visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Enhanced Real-time subscriptions with presence tracking
  useEffect(() => {
    if (!currentLobby || !user) return;

    console.log('Setting up enhanced realtime subscriptions for lobby:', currentLobby.id);

    // Create presence channel for this lobby
    const presenceChannel = supabase.channel(`lobby-presence-${currentLobby.id}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track user presence
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const online = Object.keys(newState);
        console.log('Presence sync:', online);
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        setOnlineUsers(prev => [...prev.filter(id => id !== key), key]);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        setOnlineUsers(prev => prev.filter(id => id !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user as online when successfully subscribed
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            tab_visible: isTabVisible,
          });
        }
      });

    // Subscribe to lobby updates with unique channel name - CRITICAL FOR SYNC
    const lobbyChannel = supabase
      .channel(`lobby-updates-${currentLobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${currentLobby.id}`
        },
        (payload) => {
          console.log('🚨 LOBBY UPDATE RECEIVED:', payload);
          if (payload.eventType === 'UPDATE') {
            const updatedLobby = { ...payload.new } as Lobby;
            setCurrentLobby(prev => prev ? { ...prev, ...updatedLobby } : null);
            
            // 🚨 CRITICAL: React to game start
            if (payload.new.status === 'started' && payload.new.round_start_timestamp) {
              console.log('🎮 GAME STARTING! round_start_timestamp:', payload.new.round_start_timestamp);
              // This will trigger the game start in components
            }
          }
        }
      )
      .subscribe();

    // Subscribe to participant updates with unique channel name
    const participantChannel = supabase
      .channel(`participant-updates-${currentLobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants',
          filter: `lobby_id=eq.${currentLobby.id}`
        },
        (payload) => {
          console.log('🎯 Participant update payload:', payload.eventType, payload.new || payload.old);
          if (payload.eventType === 'INSERT') {
            const newParticipant = { ...payload.new, status: payload.new.status as 'alive' | 'eliminated' } as Participant;
            console.log('➕ New participant joining:', newParticipant.username, newParticipant.user_id);
            
            // Load avatar for new participant
            supabase
              .from('profiles')
              .select('avatar_url')
              .eq('user_id', newParticipant.user_id)
              .single()
              .then(({ data: profile }) => {
                const participantWithAvatar = { 
                  ...newParticipant, 
                  avatar_url: profile?.avatar_url || null 
                };
                
                setParticipants(prev => {
                  // Check if participant already exists to avoid duplicates
                  const exists = prev.find(p => p.user_id === participantWithAvatar.user_id);
                  if (exists) {
                    console.log('⚠️ Participant already exists, skipping:', participantWithAvatar.username);
                    return prev;
                  }
                  const updated = [...prev, participantWithAvatar];
                  console.log('✅ Updated participants list:', updated.map(p => ({ username: p.username, user_id: p.user_id })));
                  return updated;
                });
              });
          } else if (payload.eventType === 'UPDATE') {
            console.log('🔄 Participant updated:', payload.new.username);
            setParticipants(prev => 
              prev.map(p => p.id === payload.new.id ? { ...payload.new, status: payload.new.status as 'alive' | 'eliminated' } as Participant : p)
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('➖ Participant left:', payload.old.username);
            setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    setIsConnected(true);

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(lobbyChannel);
      supabase.removeChannel(participantChannel);
      setIsConnected(false);
    };
  }, [currentLobby, user, isTabVisible]);

  // Update presence when tab visibility changes
  useEffect(() => {
    if (!currentLobby || !user) return;

    const updatePresence = async () => {
      const channel = supabase.channel(`lobby-presence-${currentLobby.id}`);
      await channel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
        tab_visible: isTabVisible,
      });
    };

    updatePresence();
  }, [isTabVisible, currentLobby, user]);

  // Remove old triggerRoundAdvancement - now handled by edge function

  const createMatch = useCallback(async (timeLimit: number = 10) => {
    console.log('Creating lobby...', { user, timeLimit });
    
    if (!user) {
      console.log('No user found');
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Du musst angemeldet sein, um eine Lobby zu erstellen.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      console.log('Generating room code...');
      // Generate room code
      const { data: roomCode, error: codeError } = await supabase.rpc('generate_room_code');
      if (codeError) {
        console.error('Room code error:', codeError);
        throw codeError;
      }
      console.log('Room code generated:', roomCode);

      console.log('Creating lobby record...');
      // Create lobby with simplified structure
      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .insert({
          room_code: roomCode,
          owner_id: user.id,
          time_limit: timeLimit
        })
        .select()
        .single();

      if (lobbyError) {
        console.error('Lobby creation error:', lobbyError);
        throw lobbyError;
      }
      console.log('Lobby created:', lobby);

      console.log('Getting user profile...');
      // Get user profile for username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();
      console.log('Profile:', profile);

      console.log('Joining lobby as owner...');
      // Join the lobby as owner with 5 lives
      const { error: joinError } = await supabase
        .from('match_participants')
        .insert({
          lobby_id: lobby.id,
          match_id: null,
          user_id: user.id,
          username: profile?.username || 'Spieler',
          lives: 5
        } as any);

      if (joinError) {
        console.error('Join error:', joinError);
        throw joinError;
      }
      console.log('Successfully joined lobby');

      setCurrentLobby({ 
        ...lobby, 
        status: lobby.status as 'waiting' | 'started' | 'finished'
      } as Lobby);
      
      // Select 10 random countries from all 197 using seeded shuffle
      const shuffled = seededShuffle(countries, roomCode);
      setGameCountries(shuffled.slice(0, 10));

      // Load participants immediately after creating lobby
      setTimeout(async () => {
        const { data: participants } = await supabase
          .from('match_participants')
          .select('*')
          .eq('lobby_id', lobby.id)
          .order('joined_at', { ascending: true });
        
        if (participants) {
          console.log('🔄 Initial participants after create:', participants);
          
          // Load avatar URLs for all participants
          const participantsWithAvatars = await Promise.all(
            participants.map(async (p) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('user_id', p.user_id)
                .single();
              
              return { 
                ...p, 
                status: p.status as 'alive' | 'eliminated',
                lives: p.lives || 5,
                avatar_url: profile?.avatar_url || null
              };
            })
          );
          
          setParticipants(participantsWithAvatars);
        }
      }, 500);

      toast({
        title: 'Lobby erstellt!',
        description: `Raumcode: ${roomCode}`,
      });

      return lobby;
    } catch (error) {
      console.error('Error creating lobby:', error);
      toast({
        title: 'Fehler',
        description: `Lobby konnte nicht erstellt werden: ${error.message || error}`,
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const joinMatch = useCallback(async (roomCode: string) => {
    console.log('Joining lobby with room code:', roomCode);
    
    if (!user) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Du musst angemeldet sein, um einer Lobby beizutreten.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Find lobby by room code
      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      console.log('Found lobby:', lobby, lobbyError);

      if (lobbyError) {
        toast({
          title: 'Lobby nicht gefunden',
          description: 'Überprüfe den Raumcode und versuche es erneut.',
          variant: 'destructive',
        });
        return false;
      }

      // Check if already joined
      const { data: existingParticipant } = await supabase
        .from('match_participants')
        .select('id')
        .eq('lobby_id', lobby.id)
        .eq('user_id', user.id)
        .single();

      console.log('Existing participation:', existingParticipant);

      if (existingParticipant) {
        console.log('Already joined, setting lobby');
        setCurrentLobby({ 
          ...lobby, 
          status: lobby.status as 'waiting' | 'started' | 'finished'
        } as Lobby);
        return true;
      }

      // Get user profile for username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      console.log('User profile:', profile);

        // Join the lobby with 5 lives for new game mode
        const { error: joinError } = await supabase
          .from('match_participants')
          .insert({
            lobby_id: lobby.id,
            match_id: null,
            user_id: user.id,
            username: profile?.username || 'Spieler',
            lives: 5
          } as any);

      console.log('Join result:', joinError);

      if (joinError) throw joinError;

      setCurrentLobby({ 
        ...lobby, 
        status: lobby.status as 'waiting' | 'started' | 'finished'
      } as Lobby);
      
      // Select 10 random countries from all 197 using seeded shuffle
      const shuffled = seededShuffle(countries, lobby.room_code);
      setGameCountries(shuffled.slice(0, 10));

      // Load all participants after joining
      setTimeout(async () => {
        const { data: participants } = await supabase
          .from('match_participants')
          .select('*')
          .eq('lobby_id', lobby.id)
          .order('joined_at', { ascending: true });
        
        if (participants) {
          console.log('🔄 Initial participants after join:', participants);
          
          // Load avatar URLs for all participants
          const participantsWithAvatars = await Promise.all(
            participants.map(async (p) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('user_id', p.user_id)
                .single();
              
              return { 
                ...p, 
                status: p.status as 'alive' | 'eliminated',
                lives: p.lives || 5,
                avatar_url: profile?.avatar_url || null
              };
            })
          );
          
          setParticipants(participantsWithAvatars);
        }
      }, 500);

      toast({
        title: 'Lobby beigetreten!',
        description: `Du bist der Lobby ${roomCode} beigetreten.`,
      });

      return true;
    } catch (error) {
      console.error('Error joining lobby:', error);
      toast({
        title: 'Fehler',
        description: 'Konnte der Lobby nicht beitreten.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  // 🚨 CRITICAL: New synchronized game start function
  const startMatch = useCallback(async () => {
    if (!currentLobby || !user || currentLobby.owner_id !== user.id) return;

    try {
      console.log('🎮 HOST STARTING GAME - Setting status to started with timestamp');
      
      const roundStartTimestamp = Date.now();
      
      const { error } = await supabase
        .from('lobbies')
        .update({
          status: 'started',
          round_start_timestamp: roundStartTimestamp,
          current_country_code: gameCountries[0]?.code,
          current_question_index: 0
        })
        .eq('id', currentLobby.id);

      if (error) throw error;

      console.log('🚨 GAME STARTED! round_start_timestamp:', roundStartTimestamp);
      
      toast({
        title: 'Spiel gestartet!',
        description: 'Das Spiel beginnt jetzt für alle Spieler!',
      });
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: 'Fehler',
        description: 'Spiel konnte nicht gestartet werden.',
        variant: 'destructive',
      });
    }
  }, [currentLobby, user, gameCountries, toast]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!currentLobby || !user) return;

    try {
      console.log('🎯 Submitting answer:', answer);
      
      // Call edge function to handle answer submission and game logic
      const { data, error } = await supabase.functions.invoke('multiplayer-game-engine', {
        body: {
          lobbyId: currentLobby.id,
          action: 'submit_answer',
          userId: user.id,
          answer: answer
        }
      });

      if (error) {
        console.error('❌ Error submitting answer:', error);
        toast({
          title: 'Fehler',
          description: 'Antwort konnte nicht übermittelt werden.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.challengeStarted) {
        toast({
          title: '⏰ Challenge gestartet!',
          description: 'Du warst zuerst! Der andere hat 10 Sekunden Zeit.',
          className: 'bg-primary text-primary-foreground',
        });
      } else if (data?.bothCorrect) {
        // Show round result screen briefly before next round
        setTimeout(() => {
          toast({
            title: '🎉 Beide richtig!',
            description: 'Nächste Runde startet...',
            className: 'bg-success text-success-foreground',
          });
        }, 500);
      } else if (data?.lifeLost) {
        const isMe = data.loser === participants.find(p => p.user_id === user.id)?.username;
        setTimeout(() => {
          toast({
            title: isMe ? '💔 Leben verloren!' : '🎯 Gegner zu langsam!',
            description: isMe ? 'Du warst zu langsam!' : `${data.loser} war zu langsam!`,
            variant: isMe ? 'destructive' : 'default',
            className: isMe ? '' : 'bg-success text-success-foreground',
          });
        }, 500);
      } else if (data?.gameEnded) {
        const isWinner = data.winner === participants.find(p => p.user_id === user.id)?.username;
        toast({
          title: isWinner ? '🏆 Du hast gewonnen!' : '💔 Spiel beendet!',
          description: isWinner ? 'Glückwunsch!' : `${data.winner} hat gewonnen!`,
          variant: isWinner ? 'default' : 'destructive',
          className: isWinner ? 'bg-success text-success-foreground' : '',
        });
      }

      console.log('✅ Answer processed:', data);
    } catch (error) {
      console.error('❌ Error in submitAnswer:', error);
    }
  }, [currentLobby, user, toast, participants, supabase]);

  const leaveMatch = useCallback(async (force: boolean = false) => {
    if (!currentLobby || !user) return;

    // Only leave if explicitly requested (not just tab close/reload)
    if (!force && document.visibilityState === 'hidden') {
      console.log('Tab hidden, not leaving lobby automatically');
      return;
    }

    try {
      await supabase
        .from('match_participants')
        .delete()
        .eq('lobby_id', currentLobby.id)
        .eq('user_id', user.id);

      setCurrentLobby(null);
      setParticipants([]);
      setOnlineUsers([]);
      setIsConnected(false);

      if (force) {
        toast({
          title: 'Lobby verlassen',
          description: 'Du hast die Lobby verlassen.',
        });
      }
    } catch (error) {
      console.error('Error leaving lobby:', error);
    }
  }, [currentLobby, user, toast]);

  // Improved lobby restoration with reconnection logic
  useEffect(() => {
    const restoreLobby = async () => {
      if (!user || currentLobby) return;
      
      console.log('🔄 Trying to restore lobby for user:', user.id);
      
      // Get latest participation for this user
      const { data: mp, error: mpError } = await supabase
        .from('match_participants')
        .select('lobby_id, joined_at')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(1);

      console.log('📋 Latest participation:', mp, mpError);

      const lobbyId = mp?.[0]?.lobby_id;
      if (!lobbyId) {
        console.log('❌ No lobby found for user');
        return;
      }

      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*')
        .eq('id', lobbyId)
        .in('status', ['waiting', 'started'])
        .maybeSingle();

      console.log('🏠 Found lobby:', lobby, lobbyError);

      if (lobby) {
        console.log('✅ Restoring lobby:', lobby.room_code);
        setCurrentLobby({ 
          ...lobby, 
          status: lobby.status as 'waiting' | 'started' | 'finished'
        } as Lobby);
        
        // Only show reconnection message if game is in progress
        // Hinweis beim Wiederverbinden entfernt (kein Toast mehr gewünscht)
      } else {
        console.log('🚫 No active lobby found for this user');
      }
    };

    restoreLobby();
  }, [user, currentLobby, toast]);

  // Load participants when lobby changes
  useEffect(() => {
    if (!currentLobby) {
      console.log('No current lobby, clearing participants');
      setParticipants([]);
      return;
    }

    const loadParticipants = async () => {
      console.log('🔍 Loading participants for lobby:', currentLobby.id);
      const { data, error } = await supabase
        .from('match_participants')
        .select('*')
        .eq('lobby_id', currentLobby.id)
        .order('joined_at', { ascending: true });

      console.log('📊 Participants query result:', { data, error, count: data?.length });
      
      if (!error && data) {
        // Load avatar URLs for all participants
        const participantsWithAvatars = await Promise.all(
          data.map(async (p) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('avatar_url')
              .eq('user_id', p.user_id)
              .single();
            
            return { 
              ...p, 
              status: p.status as 'alive' | 'eliminated',
              lives: p.lives || 5,
              avatar_url: profile?.avatar_url || null
            };
          })
        );
        
        console.log('✅ Setting participants with avatars:', participantsWithAvatars.map(p => ({ username: p.username, user_id: p.user_id })));
        setParticipants(participantsWithAvatars);
      } else if (error) {
        console.error('❌ Error loading participants:', error);
        // Retry if RLS issue
        if (error.message.includes('row-level security')) {
          console.log('🔄 RLS issue detected, retrying in 2 seconds...');
          setTimeout(loadParticipants, 2000);
        }
      }
    };

    // Load immediately
    loadParticipants();
    
    // Also reload after delays to ensure we catch any recent insertions
    const timer1 = setTimeout(loadParticipants, 1000);
    const timer2 = setTimeout(loadParticipants, 2000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentLobby]);

  const eliminatePlayer = useCallback(async (playerId?: string) => {
    if (!currentLobby || !user) return;
    
    const targetPlayerId = playerId || user.id;

    try {
      console.log('Removing life from player:', targetPlayerId);
      
      // Get current participant to check lives
      const { data: participant } = await supabase
        .from('match_participants')
        .select('lives')
        .eq('lobby_id', currentLobby.id)
        .eq('user_id', targetPlayerId)
        .single();

      if (!participant) return;

      const newLives = Math.max(0, participant.lives - 1);
      const newStatus = newLives === 0 ? 'eliminated' : 'alive';

      const { error } = await supabase
        .from('match_participants')
        .update({
          lives: newLives,
          status: newStatus
        })
        .eq('lobby_id', currentLobby.id)
        .eq('user_id', targetPlayerId);

      if (error) throw error;

      // Check if match should end (only one player left with lives)
      const { data: aliveParticipants } = await supabase
        .from('match_participants')
        .select('user_id, username, lives')
        .eq('lobby_id', currentLobby.id)
        .eq('status', 'alive');

      if (aliveParticipants && aliveParticipants.length <= 1) {
        // End the match - last player standing wins
        const winnerId = aliveParticipants[0]?.user_id;
        
        await supabase
          .from('lobbies')
          .update({
            status: 'finished',
            winner_id: winnerId
          })
          .eq('id', currentLobby.id);

        console.log('Lobby ended, winner:', winnerId);
      }
    } catch (error) {
      console.error('Error removing life from player:', error);
    }
  }, [currentLobby, user]);

  const kickPlayer = useCallback(async (userId: string) => {
    if (!currentLobby || !user || currentLobby.owner_id !== user.id) return;

    try {
      const { error } = await supabase
        .from('match_participants')
        .delete()
        .eq('lobby_id', currentLobby.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Spieler entfernt',
        description: 'Der Spieler wurde aus der Lobby entfernt.',
      });
    } catch (error) {
      console.error('Error kicking player:', error);
      toast({
        title: 'Fehler',
        description: 'Spieler konnte nicht entfernt werden.',
        variant: 'destructive',
      });
    }
  }, [currentLobby, user, toast]);

  const updateSettings = useCallback(async (settings: { timeLimit?: number, gameMode?: string }) => {
    if (!currentLobby || !user || currentLobby.owner_id !== user.id) return;

    try {
      const updateData: any = {};

      if (settings.timeLimit !== undefined) {
        updateData.time_limit = settings.timeLimit;
      }

      if (settings.gameMode !== undefined) {
        updateData.game_mode = settings.gameMode;
      }

      const { error } = await supabase
        .from('lobbies')
        .update(updateData)
        .eq('id', currentLobby.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating lobby settings:', error);
      toast({
        title: 'Fehler',
        description: 'Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    }
  }, [currentLobby, user, toast]);

  return {
    currentMatch: currentLobby, // For compatibility
    currentLobby,
    participants,
    gameCountries,
    isConnected,
    onlineUsers,
    isTabVisible,
    createMatch,
    joinMatch,
    startMatch,
    submitAnswer,
    eliminatePlayer,
    leaveMatch,
    kickPlayer,
    updateSettings
  };
};