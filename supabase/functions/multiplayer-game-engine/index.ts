import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const countries = [
  { name: "Afghanistan", code: "AF", continent: "Asien" },
  { name: "Albanien", code: "AL", continent: "Europa" },
  { name: "Algerien", code: "DZ", continent: "Afrika" },
  { name: "Andorra", code: "AD", continent: "Europa" },
  { name: "Angola", code: "AO", continent: "Afrika" },
  { name: "Antigua und Barbuda", code: "AG", continent: "Nordamerika" },
  { name: "Argentinien", code: "AR", continent: "Südamerika" },
  { name: "Armenien", code: "AM", continent: "Asien" },
  { name: "Aserbaidschan", code: "AZ", continent: "Asien" },
  { name: "Äthiopien", code: "ET", continent: "Afrika" },
  { name: "Australien", code: "AU", continent: "Ozeanien" },
  { name: "Bahamas", code: "BS", continent: "Nordamerika" },
  { name: "Bahrain", code: "BH", continent: "Asien" },
  { name: "Bangladesch", code: "BD", continent: "Asien" },
  { name: "Barbados", code: "BB", continent: "Nordamerika" },
  { name: "Belarus", code: "BY", continent: "Europa" },
  { name: "Belgien", code: "BE", continent: "Europa" },
  { name: "Belize", code: "BZ", continent: "Nordamerika" },
  { name: "Benin", code: "BJ", continent: "Afrika" },
  { name: "Bhutan", code: "BT", continent: "Asien" },
  { name: "Bolivien", code: "BO", continent: "Südamerika" },
  { name: "Bosnien und Herzegowina", code: "BA", continent: "Europa" },
  { name: "Botswana", code: "BW", continent: "Afrika" },
  { name: "Brasilien", code: "BR", continent: "Südamerika" },
  { name: "Brunei", code: "BN", continent: "Asien" },
  { name: "Bulgarien", code: "BG", continent: "Europa" },
  { name: "Burkina Faso", code: "BF", continent: "Afrika" },
  { name: "Burundi", code: "BI", continent: "Afrika" },
  { name: "Chile", code: "CL", continent: "Südamerika" },
  { name: "China", code: "CN", continent: "Asien" },
  { name: "Costa Rica", code: "CR", continent: "Nordamerika" },
  { name: "Dänemark", code: "DK", continent: "Europa" },
  { name: "Deutschland", code: "DE", continent: "Europa" },
  { name: "Dominica", code: "DM", continent: "Nordamerika" },
  { name: "Dominikanische Republik", code: "DO", continent: "Nordamerika" },
  { name: "Dschibuti", code: "DJ", continent: "Afrika" },
  { name: "Ecuador", code: "EC", continent: "Südamerika" },
  { name: "El Salvador", code: "SV", continent: "Nordamerika" },
  { name: "Elfenbeinküste", code: "CI", continent: "Afrika" },
  { name: "Eritrea", code: "ER", continent: "Afrika" },
  { name: "Estland", code: "EE", continent: "Europa" },
  { name: "Eswatini", code: "SZ", continent: "Afrika" },
  { name: "Fidschi", code: "FJ", continent: "Ozeanien" },
  { name: "Finnland", code: "FI", continent: "Europa" },
  { name: "Frankreich", code: "FR", continent: "Europa" },
  { name: "Gabun", code: "GA", continent: "Afrika" },
  { name: "Gambia", code: "GM", continent: "Afrika" },
  { name: "Georgien", code: "GE", continent: "Asien" },
  { name: "Ghana", code: "GH", continent: "Afrika" },
  { name: "Grenada", code: "GD", continent: "Nordamerika" },
  { name: "Griechenland", code: "GR", continent: "Europa" },
  { name: "Guatemala", code: "GT", continent: "Nordamerika" },
  { name: "Guinea", code: "GN", continent: "Afrika" },
  { name: "Guinea-Bissau", code: "GW", continent: "Afrika" },
  { name: "Guyana", code: "GY", continent: "Südamerika" },
  { name: "Haiti", code: "HT", continent: "Nordamerika" },
  { name: "Honduras", code: "HN", continent: "Nordamerika" },
  { name: "Indien", code: "IN", continent: "Asien" },
  { name: "Indonesien", code: "ID", continent: "Asien" },
  { name: "Irak", code: "IQ", continent: "Asien" },
  { name: "Iran", code: "IR", continent: "Asien" },
  { name: "Irland", code: "IE", continent: "Europa" },
  { name: "Island", code: "IS", continent: "Europa" },
  { name: "Israel", code: "IL", continent: "Asien" },
  { name: "Italien", code: "IT", continent: "Europa" },
  { name: "Jamaika", code: "JM", continent: "Nordamerika" },
  { name: "Japan", code: "JP", continent: "Asien" },
  { name: "Jemen", code: "YE", continent: "Asien" },
  { name: "Jordanien", code: "JO", continent: "Asien" },
  { name: "Kambodscha", code: "KH", continent: "Asien" },
  { name: "Kamerun", code: "CM", continent: "Afrika" },
  { name: "Kanada", code: "CA", continent: "Nordamerika" },
  { name: "Kap Verde", code: "CV", continent: "Afrika" },
  { name: "Kasachstan", code: "KZ", continent: "Asien" },
  { name: "Katar", code: "QA", continent: "Asien" },
  { name: "Kenia", code: "KE", continent: "Afrika" },
  { name: "Kirgisistan", code: "KG", continent: "Asien" },
  { name: "Kiribati", code: "KI", continent: "Ozeanien" },
  { name: "Kolumbien", code: "CO", continent: "Südamerika" },
  { name: "Komoren", code: "KM", continent: "Afrika" },
  { name: "Kongo", code: "CG", continent: "Afrika" },
  { name: "Demokratische Republik Kongo", code: "CD", continent: "Afrika" },
  { name: "Nordkorea", code: "KP", continent: "Asien" },
  { name: "Südkorea", code: "KR", continent: "Asien" },
  { name: "Kosovo", code: "XK", continent: "Europa" },
  { name: "Kroatien", code: "HR", continent: "Europa" },
  { name: "Kuba", code: "CU", continent: "Nordamerika" },
  { name: "Kuwait", code: "KW", continent: "Asien" },
  { name: "Laos", code: "LA", continent: "Asien" },
  { name: "Lesotho", code: "LS", continent: "Afrika" },
  { name: "Lettland", code: "LV", continent: "Europa" },
  { name: "Libanon", code: "LB", continent: "Asien" },
  { name: "Liberia", code: "LR", continent: "Afrika" },
  { name: "Libyen", code: "LY", continent: "Afrika" },
  { name: "Liechtenstein", code: "LI", continent: "Europa" },
  { name: "Litauen", code: "LT", continent: "Europa" },
  { name: "Luxemburg", code: "LU", continent: "Europa" },
  { name: "Madagaskar", code: "MG", continent: "Afrika" },
  { name: "Malawi", code: "MW", continent: "Afrika" },
  { name: "Malaysia", code: "MY", continent: "Asien" },
  { name: "Malediven", code: "MV", continent: "Asien" },
  { name: "Mali", code: "ML", continent: "Afrika" },
  { name: "Malta", code: "MT", continent: "Europa" },
  { name: "Marokko", code: "MA", continent: "Afrika" },
  { name: "Marshallinseln", code: "MH", continent: "Ozeanien" },
  { name: "Mauretanien", code: "MR", continent: "Afrika" },
  { name: "Mauritius", code: "MU", continent: "Afrika" },
  { name: "Mexiko", code: "MX", continent: "Nordamerika" },
  { name: "Mikronesien", code: "FM", continent: "Ozeanien" },
  { name: "Moldau", code: "MD", continent: "Europa" },
  { name: "Monaco", code: "MC", continent: "Europa" },
  { name: "Mongolei", code: "MN", continent: "Asien" },
  { name: "Montenegro", code: "ME", continent: "Europa" },
  { name: "Mosambik", code: "MZ", continent: "Afrika" },
  { name: "Myanmar", code: "MM", continent: "Asien" },
  { name: "Namibia", code: "NA", continent: "Afrika" },
  { name: "Nauru", code: "NR", continent: "Ozeanien" },
  { name: "Nepal", code: "NP", continent: "Asien" },
  { name: "Neuseeland", code: "NZ", continent: "Ozeanien" },
  { name: "Nicaragua", code: "NI", continent: "Nordamerika" },
  { name: "Niederlande", code: "NL", continent: "Europa" },
  { name: "Niger", code: "NE", continent: "Afrika" },
  { name: "Nigeria", code: "NG", continent: "Afrika" },
  { name: "Nordmazedonien", code: "MK", continent: "Europa" },
  { name: "Norwegen", code: "NO", continent: "Europa" },
  { name: "Oman", code: "OM", continent: "Asien" },
  { name: "Österreich", code: "AT", continent: "Europa" },
  { name: "Pakistan", code: "PK", continent: "Asien" },
  { name: "Palau", code: "PW", continent: "Ozeanien" },
  { name: "Panama", code: "PA", continent: "Nordamerika" },
  { name: "Papua-Neuguinea", code: "PG", continent: "Ozeanien" },
  { name: "Paraguay", code: "PY", continent: "Südamerika" },
  { name: "Peru", code: "PE", continent: "Südamerika" },
  { name: "Philippinen", code: "PH", continent: "Asien" },
  { name: "Polen", code: "PL", continent: "Europa" },
  { name: "Portugal", code: "PT", continent: "Europa" },
  { name: "Ruanda", code: "RW", continent: "Afrika" },
  { name: "Rumänien", code: "RO", continent: "Europa" },
  { name: "Russland", code: "RU", continent: "Europa" },
  { name: "Salomonen", code: "SB", continent: "Ozeanien" },
  { name: "Sambia", code: "ZM", continent: "Afrika" },
  { name: "Samoa", code: "WS", continent: "Ozeanien" },
  { name: "San Marino", code: "SM", continent: "Europa" },
  { name: "São Tomé und Príncipe", code: "ST", continent: "Afrika" },
  { name: "Saudi-Arabien", code: "SA", continent: "Asien" },
  { name: "Schweden", code: "SE", continent: "Europa" },
  { name: "Schweiz", code: "CH", continent: "Europa" },
  { name: "Senegal", code: "SN", continent: "Afrika" },
  { name: "Serbien", code: "RS", continent: "Europa" },
  { name: "Seychellen", code: "SC", continent: "Afrika" },
  { name: "Sierra Leone", code: "SL", continent: "Afrika" },
  { name: "Singapur", code: "SG", continent: "Asien" },
  { name: "Slowakei", code: "SK", continent: "Europa" },
  { name: "Slowenien", code: "SI", continent: "Europa" },
  { name: "Somalia", code: "SO", continent: "Afrika" },
  { name: "Spanien", code: "ES", continent: "Europa" },
  { name: "Sri Lanka", code: "LK", continent: "Asien" },
  { name: "St. Kitts und Nevis", code: "KN", continent: "Nordamerika" },
  { name: "St. Lucia", code: "LC", continent: "Nordamerika" },
  { name: "St. Vincent und die Grenadinen", code: "VC", continent: "Nordamerika" },
  { name: "Südafrika", code: "ZA", continent: "Afrika" },
  { name: "Sudan", code: "SD", continent: "Afrika" },
  { name: "Südsudan", code: "SS", continent: "Afrika" },
  { name: "Suriname", code: "SR", continent: "Südamerika" },
  { name: "Syrien", code: "SY", continent: "Asien" },
  { name: "Tadschikistan", code: "TJ", continent: "Asien" },
  { name: "Tansania", code: "TZ", continent: "Afrika" },
  { name: "Thailand", code: "TH", continent: "Asien" },
  { name: "Timor-Leste", code: "TL", continent: "Asien" },
  { name: "Togo", code: "TG", continent: "Afrika" },
  { name: "Tonga", code: "TO", continent: "Ozeanien" },
  { name: "Trinidad und Tobago", code: "TT", continent: "Nordamerika" },
  { name: "Tschad", code: "TD", continent: "Afrika" },
  { name: "Tschechien", code: "CZ", continent: "Europa" },
  { name: "Tunesien", code: "TN", continent: "Afrika" },
  { name: "Türkei", code: "TR", continent: "Asien" },
  { name: "Turkmenistan", code: "TM", continent: "Asien" },
  { name: "Tuvalu", code: "TV", continent: "Ozeanien" },
  { name: "Uganda", code: "UG", continent: "Afrika" },
  { name: "Ukraine", code: "UA", continent: "Europa" },
  { name: "Ungarn", code: "HU", continent: "Europa" },
  { name: "Uruguay", code: "UY", continent: "Südamerika" },
  { name: "USA", code: "US", continent: "Nordamerika" },
  { name: "Usbekistan", code: "UZ", continent: "Asien" },
  { name: "Vanuatu", code: "VU", continent: "Ozeanien" },
  { name: "Vatikanstadt", code: "VA", continent: "Europa" },
  { name: "Venezuela", code: "VE", continent: "Südamerika" },
  { name: "Vereinigte Arabische Emirate", code: "AE", continent: "Asien" },
  { name: "Vietnam", code: "VN", continent: "Asien" },
  { name: "Weißrussland", code: "BY", continent: "Europa" },
  { name: "Zentralafrikanische Republik", code: "CF", continent: "Afrika" },
  { name: "Zypern", code: "CY", continent: "Europa" },
  { name: "Simbabwe", code: "ZW", continent: "Afrika" },
];

const seededShuffle = (array: any[], seed: string) => {
  const arr = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  for (let i = arr.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = Math.floor((hash / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create client with user's JWT to verify authentication
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create service role client for privileged operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const { lobbyId, action, userId } = await req.json()

    // Verify the user ID matches the authenticated user
    if (userId !== user.id) {
      console.error('User ID mismatch:', { provided: userId, authenticated: user.id });
      return new Response(JSON.stringify({ error: 'User ID mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'complete_game') {
      // Verify user is actually a participant in this lobby
      const { data: participant, error: participantError } = await supabaseClient
        .from('match_participants')
        .select('*')
        .eq('lobby_id', lobbyId)
        .eq('user_id', user.id)
        .single();

      if (participantError || !participant) {
        console.error('User not in lobby:', participantError);
        return new Response(JSON.stringify({ error: 'Not a participant in this lobby' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log('🏁 Player completed game:', { lobbyId, userId })
      
      // Get lobby data
      const { data: lobby } = await supabaseClient
        .from('lobbies')
        .select('*')
        .eq('id', lobbyId)
        .single()

      if (!lobby || lobby.status !== 'started') {
        return new Response(JSON.stringify({ success: false, message: 'Lobby not active' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const correctAnswers = participant.current_answer?.split(',').filter((a: string) => a.trim()) || []
      
      // Determine required count based on game mode
      let requiredCount = 10 // Default for flags mode
      
      if (lobby.selected_game_mode === 'continents' && lobby.selected_continent) {
        // Count countries in the selected continent
        const continentCountries = countries.filter(c => c.continent === lobby.selected_continent)
        requiredCount = continentCountries.length
        console.log(`📍 Continent mode: ${lobby.selected_continent}, required: ${requiredCount}, player has: ${correctAnswers.length}`)
      } else {
        console.log(`🏴 Flags mode: required: 10, player has: ${correctAnswers.length}`)
      }
      
      if (correctAnswers.length < requiredCount) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Not all answers correct yet',
          current: correctAnswers.length,
          required: requiredCount
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log('🏆 Winner confirmed! Finishing game:', userId)

      // Update lobby as finished with this player as winner
      await supabaseClient
        .from('lobbies')
        .update({
          status: 'finished',
          winner_id: userId
        })
        .eq('id', lobbyId)

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Game completed',
        winner: userId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
