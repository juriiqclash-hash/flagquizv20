import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import ChatHeader from "@/components/ChatHeader";
import ChatInput, { ChatMode } from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import ChatHistorySidebar, { SIDEBAR_OPEN_KEY, type MainView } from "@/components/ChatHistorySidebar";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ModelSelector, { type ModelId, type ModelVariant } from "@/components/ModelSelector";
import SleepingOverlay from "@/components/SleepingOverlay";
import LocationPrompt from "@/components/LocationPrompt";
import { useChat } from "@/hooks/useChat";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useDataConsent } from "@/hooks/useDataConsent";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useArtifacts } from "@/hooks/useArtifacts";
import { supabase } from "@/integrations/supabase/client";
import ArtifactPanel from "@/components/ArtifactPanel";
import quecksilverLogo from "@/assets/quecksilver-logo.png";
import { Globe } from "lucide-react";
import { AgentPanel, useAgent } from "@/components/AgentPanel";
import { LiveFeed } from "@/components/LiveFeed";
import { CollabBar } from "@/components/CollabBar";
import { useCollab } from "@/hooks/useCollab";
import { VoiceMode } from "@/components/VoiceMode";

const GREETINGS = [
  "What's the mission today?",
  "Ready to make some magic?",
  "Hit me with your best shot.",
  "What are we building today?",
  "What's the master plan?",
  "Got a challenge for me?",
  "I'm all ears.",
  "Ready when you are.",
  "Let's build something cool.",
  "I'm ready, are you?",
  "Ready to build something legendary.",
  "Let's make it happen.",
  "Let's get to work, boss.",
  "Ready to build something epic?",
  "What's the breakthrough today?",
  "What's on the horizon today?",
  "Ready to make history?",
  "What's the top priority?",
  "Ready to change the world?",
  "Ready for takeoff.",
  "What's on the agenda, boss?",
  "What's the play?",
  "What's the move today?",
  "Let's get the ball rolling.",
  "What's on the radar?",
];

const getRotatingGreeting = () => {
  const key = "qs_greeting_queue";
  let queue: number[];
  try { queue = JSON.parse(localStorage.getItem(key) || "[]"); } catch { queue = []; }
  if (queue.length === 0) {
    const indices = GREETINGS.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    queue = indices;
  }
  const idx = queue.shift()!;
  localStorage.setItem(key, JSON.stringify(queue));
  return GREETINGS[idx];
};

const FIXED_SUGGESTIONS = [
  { label: "🖼️ Create Image",      prompt: "__PICTURES__" },
  { label: "✍️ Write a Story",     prompt: "Help me write a story. What kind of story would you like? Please ask me about the genre, characters, and setting." },
  { label: "📄 Analyze Document",  prompt: "Help me analyze a document. Please ask me to upload or paste the document, and what I'd like to find out." },
  { label: "🌍 Learn a Language",  prompt: "Help me learn a language. Which language would you like to learn, and what's your current level? Please ask me." },
  { label: "🐛 Debug Code",        prompt: "Help me debug my code. Please ask me to share the code and describe the problem I'm facing." },
  { label: "📚 Create Study Plan", prompt: "Help me create a study plan. Please ask me what I want to learn, my current level, and how much time I have." },
  { label: "🎙️ Voice Chat",        prompt: "__VOICE_MODE__" },
];

const IMAGE_STYLES = [
  { label: "Photorealistic", prompt: "Create a photorealistic image of ", img: "/style-1.webp" },
  { label: "Anime", prompt: "Create an anime-style illustration of ", img: "/style-2.webp" },
  { label: "Oil Painting", prompt: "Create an oil painting of ", img: "/style-3.webp" },
  { label: "Watercolor", prompt: "Create a watercolor painting of ", img: "/style-4.webp" },
  { label: "Pencil Sketch", prompt: "Create a detailed pencil sketch of ", img: "/style-5.webp" },
  { label: "Pixel Art", prompt: "Create pixel art of ", img: "/style-6.webp" },
  { label: "3D Render", prompt: "Create a 3D rendered image of ", img: "/style-7.webp" },
  { label: "Cinematic", prompt: "Create a cinematic photograph of ", img: "/style-8.webp" },
  { label: "Minimalist", prompt: "Create a minimalist illustration of ", img: "/style-9.webp" },
  { label: "Fantasy Art", prompt: "Create a fantasy art illustration of ", img: "/style-10.webp" },
  { label: "Vintage", prompt: "Create a vintage-style illustration of ", img: "/style-11.webp" },
  { label: "Pop Art", prompt: "Create a pop art style image of ", img: "/style-12.webp" },
];

const NOTE_TEMPLATES = [
  { label: "Daily Journal", icon: "📔", prompt: "Help me write a daily journal entry for today." },
  { label: "Meeting Notes", icon: "📋", prompt: "Help me structure notes for a meeting." },
  { label: "To-Do List", icon: "✅", prompt: "Help me create an organized to-do list." },
  { label: "Brainstorm", icon: "💡", prompt: "Let's brainstorm ideas together on a topic." },
  { label: "Project Plan", icon: "🗂️", prompt: "Help me create a structured project plan." },
  { label: "Reading Notes", icon: "📚", prompt: "Help me take notes on what I'm reading." },
  { label: "Weekly Review", icon: "📅", prompt: "Help me do a weekly review — wins, learnings, next steps." },
  { label: "Quick Capture", icon: "⚡", prompt: "I want to quickly capture an idea:" },
];

const VISIBLE_WINDOW = 40;
const LOAD_MORE_COUNT = 20;

// Helper: always focus input
const focusInput = (ref: React.RefObject<HTMLTextAreaElement>, delay = 80) => {
  setTimeout(() => ref.current?.focus({ preventScroll: true }), delay);
};

// ── NotesView ─────────────────────────────────────────────────────────────
interface NoteRecord { id: string; title: string; content: string; created_at: string; updated_at: string; }

const NotesView = ({ deviceId, onStartChat }: { deviceId: string; onStartChat: (prompt: string) => void }) => {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [active, setActive] = useState<NoteRecord | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("notes").select("*")
      .eq("device_id", deviceId).order("updated_at", { ascending: false });
    setNotes((data as NoteRecord[]) || []);
  };

  useEffect(() => { load(); }, [deviceId]);

  const createNote = async () => {
    const { data } = await supabase.from("notes").insert({
      device_id: deviceId, title: "Untitled", content: "",
    }).select().single();
    if (data) { setActive(data as NoteRecord); setTitle("Untitled"); setContent(""); load(); }
  };

  const saveNote = async () => {
    if (!active) return;
    setSaving(true);
    await supabase.from("notes").update({ title: title || "Untitled", content, updated_at: new Date().toISOString() }).eq("id", active.id);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    if (active?.id === id) { setActive(null); setTitle(""); setContent(""); }
    setConfirmDelete(null);
    load();
  };

  const copyNote = async (note: NoteRecord) => {
    await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(note.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareNote = async (note: NoteRecord) => {
    const text = `${note.title}\n\n${note.content}`;
    if (navigator.share) await navigator.share({ title: note.title, text }).catch(() => {});
    else await navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-24 pb-36">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-medium text-foreground">Your Notes</h1>
        <button onClick={createNote}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          + New Note
        </button>
      </div>
      <p className="mb-8 text-muted-foreground">Write, organise, and share your notes</p>

      {/* Quick-start templates */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 mb-10">
        {NOTE_TEMPLATES.map((tmpl) => (
          <button key={tmpl.label} onClick={() => onStartChat(tmpl.prompt)}
            className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:bg-muted hover:scale-[1.02] active:scale-[0.98]">
            <span className="text-2xl">{tmpl.icon}</span>
            <span className="text-sm font-medium text-foreground leading-tight">{tmpl.label}</span>
          </button>
        ))}
      </div>

      {/* Notes list / editor */}
      {active ? (
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
          <button onClick={() => setActive(null)} className="text-xs text-primary hover:underline self-start">← Back to notes</button>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-base font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Start writing…" rows={12}
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
          <div className="flex gap-2">
            <button onClick={saveNote} disabled={saving}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${saved ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
              {saved ? "✓ Saved" : saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => copyNote(active)}
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
              {copied === active.id ? "✓ Copied" : "Copy"}
            </button>
            <button onClick={() => shareNote(active)}
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
              Share
            </button>
            <button onClick={() => setConfirmDelete(active.id)}
              className="ml-auto rounded-xl border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              Delete
            </button>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-muted-foreground gap-3">
          <span className="text-4xl">📝</span>
          <p className="text-sm">No notes yet — create one or use a template above</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map(note => (
            <div key={note.id} onClick={() => { setActive(note); setTitle(note.title); setContent(note.content); }}
              className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{note.title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{note.content || "Empty"}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button onClick={() => copyNote(note)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs">
                  {copied === note.id ? "✓" : "📋"}
                </button>
                <button onClick={() => shareNote(note)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  🔗
                </button>
                <button onClick={() => setConfirmDelete(note.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm mx-4 rounded-2xl border border-border bg-card shadow-xl p-6"
            onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-foreground mb-2">Delete this note?</p>
            <p className="text-xs text-muted-foreground mb-5">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => deleteNote(confirmDelete)}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:bg-destructive/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PicturesView = ({ userId, onStyleClick }: { userId?: string; onStyleClick: (prompt: string) => void }) => {
  const [userImages, setUserImages] = useState<{ id: string; url: string; source: string }[]>([]);
  const [preview, setPreview] = useState<{ url: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchImages = () => {
    if (!userId) return;
    supabase.from("user_images").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setUserImages((data as any[]) || []));
  };

  useEffect(() => { fetchImages(); }, [userId]);

  const handleCopy = async (url: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch {
      await navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-${Date.now()}.jpg`;
    a.target = "_blank";
    a.click();
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      await navigator.share({ url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from("user_images").delete().eq("id", id);
    setUserImages(prev => prev.filter(img => img.id !== id));
    if (preview?.id === id) setPreview(null);
    setDeleting(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-24 pb-36">
      <h1 className="mb-1 text-3xl font-medium text-foreground">Create Image</h1>
      <p className="mb-8 text-muted-foreground">Pick a style or describe your image in the input below</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {IMAGE_STYLES.map((style) => (
          <button key={style.label} onClick={() => onStyleClick(style.prompt)}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden transition-transform hover:scale-[1.03] active:scale-[0.98]">
            <img src={style.img} alt={style.label} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute bottom-2.5 left-3 text-sm font-medium text-white drop-shadow">{style.label}</span>
          </button>
        ))}
      </div>

      {userImages.length > 0 && (
        <>
          <div className="mt-10 mb-4 flex items-center gap-3">
            <h2 className="text-lg font-medium text-foreground">Your Images</h2>
            <span className="text-sm text-muted-foreground">{userImages.length} images</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {userImages.map((img) => (
              <button key={img.id} onClick={() => setPreview({ url: img.url, id: img.id })}
                className="group relative aspect-square overflow-hidden rounded-xl hover:opacity-90 transition-opacity">
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                  {img.source === "generated" ? "AI" : "📎"}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Lightbox with actions */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setPreview(null)}>
          <img src={preview.url} alt="" className="max-h-[75vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={e => e.stopPropagation()} />
          {/* Action bar */}
          <div className="mt-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <button onClick={() => handleCopy(preview.url)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-white transition-colors">
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
            <button onClick={() => handleDownload(preview.url)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-white transition-colors">
              ⬇ Download
            </button>
            <button onClick={() => handleShare(preview.url)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-white transition-colors">
              🔗 Share
            </button>
            <button onClick={() => handleDelete(preview.id)} disabled={deleting === preview.id}
              className="flex items-center gap-1.5 rounded-xl bg-red-500/30 hover:bg-red-500/50 px-4 py-2 text-sm text-red-300 transition-colors disabled:opacity-50">
              {deleting === preview.id ? "…" : "🗑 Delete"}
            </button>
            <button onClick={() => setPreview(null)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-white transition-colors">
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// NOTE: MusicView and VideoView components removed — code preserved in git history for re-adding later


const Index = ({ initialView }: { initialView?: MainView }) => {
  const { user } = useAuth();
  const { conversationId: urlConvId } = useParams();
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const { language, setLanguage } = useLanguage();
  const { consentGiven, loading: consentLoading, giveConsent } = useDataConsent(deviceId);
  const { location: userLocation, asked: locationAsked, loading: locationLoading, requestBrowserLocation, setManualCity, dismiss: dismissLocation } = useLocation();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [greeting] = useState(() => getRotatingGreeting());

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_OPEN_KEY) === "1"; } catch { return false; }
  });
  const [mainView, setMainView] = useState<MainView>(initialView || "chat");

  const [activeMode, setActiveMode] = useState<ChatMode>("default");
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>(() => (localStorage.getItem("qs_selected_model") as ModelId) || "zora");
  const [selectedVariant, setSelectedVariant] = useState<ModelVariant>(() => (localStorage.getItem("qs_selected_variant") as ModelVariant) || "omni");
  const [customInstructions, setCustomInstructions] = useState(() => localStorage.getItem("qs_custom_instructions") || "");
  const [memory] = useState(() => localStorage.getItem("qs_ai_memory") || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const currentConvIdRef = useRef<string | null>(null);
  const pendingMessageRef = useRef<{ message: string; mode: ChatMode; imageUrls?: string[] } | null>(null);

  const [visibleCount, setVisibleCount] = useState(VISIBLE_WINDOW);
  const [loadingMore, setLoadingMore] = useState(false);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const {
    conversations, activeConversationId, setActiveConversationId,
    createConversation, updateConversationTitle, saveMessage, loadMessages,
    deleteConversation, shareConversation, unshareConversation, renameConversation,
    hasMoreConversations, loadMoreConversations, conversationsLoading,
    searchQuery, setSearchQuery,
  } = useChatHistory(deviceId, consentGiven, user);

  const isLoggedIn = !!user;
  const firstUserMsgRef = useRef<string | null>(null);
  const firstImageUrlRef = useRef<string | null>(null);
  const titleGeneratedRef = useRef(false);

  // Focus input on mount and after consent loads
  useEffect(() => {
    if (!consentLoading) {
      focusInput(inputRef, 150);
    }
  }, [consentLoading]);

  // Focus when switching conversations (separate because it needs its own delay)
  useEffect(() => { focusInput(inputRef, 200); }, [activeConversationId]);

  const saveImage = useCallback(async (url: string, source: "uploaded" | "generated") => {
    if (!user) return;
    await supabase.from("user_images").insert({ user_id: user.id, conversation_id: currentConvIdRef.current, url, source });
  }, [user]);

  const chatOptions = useMemo(() => ({
    onUserMessage: async (message: string, imageUrls?: string[]) => {
      if (!isLoggedIn || incognitoMode) return; // incognito: no saving
      let convId = currentConvIdRef.current;
      if (!convId) {
        convId = await createConversation(message || "[Image]");
        currentConvIdRef.current = convId;
        firstUserMsgRef.current = message;
        firstImageUrlRef.current = imageUrls?.[0] || null;
        titleGeneratedRef.current = false;
        // Mark urlLoadedRef so the urlConvId effect doesn't reload messages
        // when we navigate (which would wipe React state with stale DB data)
        urlLoadedRef.current = true;
        if (convId) navigate(`/c/${convId}`, { replace: true });
      }
      if (convId) {
        if (imageUrls && imageUrls.length > 0) {
          const structured = imageUrls.length > 1
            ? JSON.stringify({ type: "images", urls: imageUrls, text: message })
            : JSON.stringify({ type: "image", url: imageUrls[0], text: message });
          await saveMessage(convId, "user", structured);
        } else {
          await saveMessage(convId, "user", message);
        }
      }
    },
    onAssistantMessage: async (message: string) => {
      if (!isLoggedIn || incognitoMode) return; // incognito: no saving
      processArtifacts(message);
      const convId = currentConvIdRef.current;
      if (convId) await saveMessage(convId, "assistant", message);
      // Skip title generation for the short image placeholder text
      if (convId && firstUserMsgRef.current !== null && !titleGeneratedRef.current
          && message !== "Here's your generated image:") {
        titleGeneratedRef.current = true;
        updateConversationTitle(convId, firstUserMsgRef.current || "", message, language);
        firstUserMsgRef.current = null;
        firstImageUrlRef.current = null;
      }
    },
    onImageGenerated: async (url: string) => {
      if (incognitoMode) return; // incognito: no saving
      saveImage(url, "generated");
      if (!firstImageUrlRef.current) firstImageUrlRef.current = url;
      const convId = currentConvIdRef.current;
      if (convId && isLoggedIn) {
        await saveMessage(convId, "assistant", JSON.stringify({ type: "image", url }));
        // Generate title from user's image prompt
        if (firstUserMsgRef.current !== null && !titleGeneratedRef.current) {
          titleGeneratedRef.current = true;
          updateConversationTitle(convId, firstUserMsgRef.current || "", firstUserMsgRef.current || "Image", language);
          firstUserMsgRef.current = null;
        }
      }
    },
    onImageUploaded: (url: string) => { saveImage(url, "uploaded"); },
    onModeChange: (mode: ChatMode) => { setActiveMode(mode); },
    language, customInstructions, selectedModel, selectedVariant,
    userLocation: userLocation?.city, memory,
    deviceId,
  }), [isLoggedIn, incognitoMode, createConversation, updateConversationTitle, saveMessage, saveImage, language, customInstructions, selectedModel, selectedVariant, userLocation, memory, setActiveMode]);

  const { messages, isLoading, isThinking, searchStatus, sendMessage, clearMessages, setInitialMessages, stopGeneration, retryLastMessage } = useChat(chatOptions);

  // Focus after AI finishes responding (isLoading goes false)
  useEffect(() => {
    if (!isLoading) focusInput(inputRef, 80);
  }, [isLoading]);

  useEffect(() => {
    currentConvIdRef.current = activeConversationId;
    setVisibleCount(VISIBLE_WINDOW);
  }, [activeConversationId]);

  const totalMessages = messages.length;
  const startIndex = Math.max(0, totalMessages - visibleCount);
  const visibleMessages = messages.slice(startIndex);
  const hasMoreAbove = startIndex > 0;



  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMoreAbove) return;
    setLoadingMore(true);
    const el = messagesContainerRef.current;
    const prevScrollHeight = el?.scrollHeight || 0;
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, totalMessages));
    requestAnimationFrame(() => {
      if (el) { el.scrollTop = el.scrollHeight - prevScrollHeight; }
      setLoadingMore(false);
    });
  }, [loadingMore, hasMoreAbove, totalMessages]);

  const urlLoadedRef = useRef(false);
  useEffect(() => {
    if (!urlConvId) return;
    // Don't reload if this is already the active conversation (e.g. just navigated here from a new chat)
    if (urlConvId === currentConvIdRef.current) {
      urlLoadedRef.current = true;
      return;
    }
    if (!urlLoadedRef.current && conversations.length > 0) {
      urlLoadedRef.current = true;
      const exists = conversations.find(c => c.id === urlConvId);
      if (exists) handleSelectConversation(urlConvId);
    }
  }, [urlConvId, conversations]);

  // Click on non-interactive area → focus input
  const handlePageClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest('button, a, input, textarea, select, [role="button"], [contenteditable]');
    // Use mouseup so we don't interrupt text selection (mousedown fires before selection exists)
    if (!interactive && window.getSelection()?.toString() === "") focusInput(inputRef, 10);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handlePageClick);
    return () => document.removeEventListener("mouseup", handlePageClick);
  }, [handlePageClick]);

  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    const isNewMessage = messages.length > prevMessageCountRef.current;
    const isFirstMessage = prevMessageCountRef.current === 0 && messages.length > 0;
    prevMessageCountRef.current = messages.length;
    if (isNewMessage) {
      // First message needs longer delay for layout transition to complete
      const delay = isFirstMessage ? 120 : 0;
      const scroll = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
            setShowScrollDown(false);
          });
        });
      };
      if (delay > 0) setTimeout(scroll, delay);
      else scroll();
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const docEl = document.documentElement;
    setShowScrollDown(docEl.scrollHeight - docEl.scrollTop - docEl.clientHeight > 200);
    if (docEl.scrollTop < 100 && hasMoreAbove && !loadingMore) handleLoadMore();
  }, [hasMoreAbove, loadingMore, handleLoadMore]);



  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    setShowScrollDown(false);
  }, []);

  const handleCustomInstructionsChange = useCallback((instructions: string) => {
    setCustomInstructions(instructions);
    localStorage.setItem("qs_custom_instructions", instructions);
  }, []);

  const handleNewChat = useCallback(() => {
    clearMessages();
    setChatStarted(false);
    setActiveConversationId(null);
    currentConvIdRef.current = null;
    setMainView("chat");
    setSidebarOpen(false);
    setActiveMode("default"); // always reset mode on new chat
    navigate("/", { replace: true });
    focusInput(inputRef, 100);
  }, [clearMessages, setActiveConversationId, navigate]);

  const handleSelectConversation = useCallback(async (id: string) => {
    // If this conversation is already loaded in React state (e.g. just created),
    // don't reload from DB — it would wipe in-progress image generation
    if (id === currentConvIdRef.current && messages.length > 0) {
      setActiveConversationId(id);
      if (window.innerWidth < 768) setSidebarOpen(false);
      return;
    }
    setActiveConversationId(id);
    currentConvIdRef.current = id;
    const msgs = await loadMessages(id);
    const formatted = msgs.map((m) => {
      let content: any = m.content;
      try {
        const parsed = JSON.parse(m.content);
        if (parsed && (parsed.type === "image" || parsed.type === "images")) content = parsed;
      } catch {}
      return { role: m.role as "user" | "assistant", content };
    });
    setInitialMessages(formatted);
    setChatStarted(true);
    setVisibleCount(VISIBLE_WINDOW);
    if (window.innerWidth < 768) setSidebarOpen(false);
    navigate(`/c/${id}`, { replace: true });
    setTimeout(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
      focusInput(inputRef, 100);
    }, 100);
  }, [setActiveConversationId, loadMessages, setInitialMessages, navigate]);

  const handleEditMessage = useCallback((msgIndex: number, newText: string) => {
    setInitialMessages(messages.slice(0, msgIndex));
    setTimeout(() => sendMessage(newText, activeMode), 50);
  }, [messages, setInitialMessages, sendMessage, activeMode]);

  const handleRegenerateFromUser = useCallback((msgIndex: number) => {
    const userMsg = messages[msgIndex];
    const text = typeof userMsg.content === "string" ? userMsg.content : (userMsg.content as any).text || "";
    setInitialMessages(messages.slice(0, msgIndex));
    setTimeout(() => sendMessage(text, activeMode), 50);
  }, [messages, setInitialMessages, sendMessage, activeMode]);

  const LOCATION_KEYWORDS = /\b(wetter|weather|temperatur|temperature|forecast|vorhersage|karte|map|maps|in meiner nähe|nearby|standort|location|wo bin ich|where am i)\b/i;

  const handleSend = async (message: string, mode: ChatMode, imageUrls?: string[], docs?: { name: string; base64: string; mimeType: string }[]) => {
    if (!userLocation && LOCATION_KEYWORDS.test(message)) {
      pendingMessageRef.current = { message, mode, imageUrls };
      setShowLocationPrompt(true);
      return;
    }
    setMainView("chat");
    setChatStarted(true);
    if (imageUrls && user) imageUrls.forEach(url => saveImage(url, "uploaded"));

    // Agent mode: open fullscreen panel immediately, don't touch chat state yet
    if (mode === "agent") {
      setChatStarted(true);
      setActiveMode("default"); // reset mode pill

      // Capture current messages for context (before any state changes)
      const contextMessages = messages
        .filter(m => typeof m.content === "string")
        .map(m => ({ role: m.role, content: m.content as string }));

      startAgent(message, {
        messages: contextMessages,
        language,
        selectedModel,
        customInstructions,
      });
      return;
    }

    sendMessage(message, mode, imageUrls, docs);
  };

  const handleLocationSet = () => {
    setShowLocationPrompt(false);
    if (pendingMessageRef.current) {
      const { message, mode, imageUrls } = pendingMessageRef.current;
      pendingMessageRef.current = null;
      setTimeout(() => sendMessage(message, mode, imageUrls), 100);
    }
  };

  const handleLocationDismiss = () => {
    setShowLocationPrompt(false);
    if (pendingMessageRef.current) {
      const { message, mode, imageUrls } = pendingMessageRef.current;
      pendingMessageRef.current = null;
      sendMessage(message, mode, imageUrls);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "__VOICE_MODE__") {
      setVoiceModeActive(true);
      setChatStarted(true);
      return;
    }
    if (suggestion === "__PICTURES__") {
      setMainView("pictures");
      return;
    }
    if (inputRef.current) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(inputRef.current, suggestion);
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      inputRef.current.focus();
    }
  };
  const [chatStarted, setChatStarted] = useState(false);
  const { artifacts, activeIndex: artifactIndex, isOpen: artifactOpen, processMessage: processArtifacts, close: closeArtifacts, open: openArtifacts, setActiveIndex: setArtifactIndex } = useArtifacts();

  // ── New features ──────────────────────────────────────────────────────────
  const { agentTask, agentContext, startAgent, closeAgent } = useAgent();
  const { collaborators, enabled: collabEnabled, enable: enableCollab, disable: disableCollab, broadcastTyping, myColor } = useCollab({
    conversationId: activeConversationId,
    userId: user?.id,
    userName: user?.email?.split("@")[0] || "Anonymous",
  });
  const [showLiveFeed, setShowLiveFeed] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  // Stable callback for VoiceMode — never recreated, so the ref inside VoiceMode stays valid
  // Navigate to the right URL when switching views
  const handleViewChange = useCallback((view: MainView) => {
    setMainView(view);
    if (view === "notes") navigate("/notes", { replace: true });
    else if (view === "pictures") navigate("/pictures", { replace: true });
    else navigate("/", { replace: true });
  }, [navigate]);

  const handleVoiceSend = useCallback((text: string) => {
    setChatStarted(true);
    sendMessage(text, "default");
  }, [sendMessage]);
  // retryLastMessage already restores mode via onModeChange in useChat
  const latestAIMessage = useMemo(() => {
    const lastAI = [...messages].reverse().find(m => m.role === "assistant" && typeof m.content === "string");
    return typeof lastAI?.content === "string" ? lastAI.content : undefined;
  }, [messages]);

  const hasMessages = chatStarted || messages.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SleepingOverlay />
      <MaintenanceBanner userEmail={user?.email} />
      <AnnouncementBanner />

      {!incognitoMode && <ChatHistorySidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((p) => !p)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={deleteConversation}
        onShareConversation={shareConversation}
        onUnshareConversation={unshareConversation}
        onRenameConversation={renameConversation}
        hasMoreConversations={hasMoreConversations}
        onLoadMoreConversations={loadMoreConversations}
        isLoggedIn={isLoggedIn}
        deviceId={deviceId}
        userId={user?.id}
        activeView={mainView}
        onViewChange={handleViewChange}
        conversationsLoading={conversationsLoading}
      />}

      <div className={`flex min-h-screen transition-all duration-200 ${incognitoMode ? "ml-0" : sidebarOpen ? "md:ml-72" : "ml-0"} ${incognitoMode ? "bg-zinc-950" : ""}`}>
        {/* Main chat column */}
        <div className={`flex flex-1 flex-col min-w-0 ${artifactOpen ? "md:w-1/2" : "w-full"}`}>
        <ChatHeader user={user} onToggleIncognito={() => {
          setIncognitoMode(p => !p);
          if (incognitoMode) { clearMessages(); setActiveMode("default"); }
        }} incognitoMode={incognitoMode} />

        <div className="fixed left-16 top-4 z-30 flex items-center gap-2">
          <ModelSelector selectedModel={selectedModel} onModelChange={(m) => { setSelectedModel(m); localStorage.setItem("qs_selected_model", m); }} />
        </div>

        <main className={`flex flex-1 flex-col items-center px-4 ${!hasMessages && mainView === "chat" && "justify-center min-h-[calc(100vh-80px)]"}`}>

          {/* ── PICTURES VIEW ─────────────────────────────────────────── */}
          {mainView === "pictures" && (
            <PicturesView
              userId={user?.id}
              onStyleClick={(prompt) => {
                setActiveMode("image");
                handleViewChange("chat");
                setTimeout(() => {
                  if (inputRef.current) {
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                    setter?.call(inputRef.current, prompt);
                    inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
                    inputRef.current.focus();
                  }
                }, 60);
              }}
            />
          )}

          {/* ── NOTES VIEW ────────────────────────────────────────────── */}
          {mainView === "notes" && (
            <NotesView deviceId={deviceId} onStartChat={(prompt) => {
              handleViewChange("chat");
              setTimeout(() => {
                if (inputRef.current) {
                  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                  setter?.call(inputRef.current, prompt);
                  inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
                  inputRef.current.focus();
                }
              }, 80);
            }} />
          )}

                    {/* ── CHAT VIEW ─────────────────────────────────────────────── */}
          {mainView === "chat" && (!hasMessages ? (
            incognitoMode ? (
              /* ── INCOGNITO START SCREEN ── */
              <div className="flex w-full flex-col items-center px-4">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    className="text-zinc-300">
                    <path d="M9 10h.01"/><path d="M15 10h.01"/>
                    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
                  </svg>
                </div>
                <h1 className="mb-2 text-2xl font-semibold text-zinc-100">Incognito Mode</h1>
                <div className="mx-auto mb-6 max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-sm text-zinc-400 leading-relaxed">
                  Incognito chats are not saved to history or used to train models. Your conversation disappears when you close this session.
                </div>
                <div className="mx-auto w-full max-w-2xl">
                  <ChatInput
                    onSend={handleSend} isLoading={isLoading || !!agentTask} activeMode={activeMode}
                    onModeChange={setActiveMode} onStop={stopGeneration}
                    selectedModel={selectedModel} selectedVariant={selectedVariant}
                    onVariantChange={(v) => { setSelectedVariant(v); localStorage.setItem("qs_selected_variant", v); }}
                    textareaRef={inputRef} hasMessages={false} mainView={mainView}
                    latestAssistantMessage={latestAIMessage}
                    onToggleLiveFeed={() => setShowLiveFeed(p => !p)}
                    showLiveFeed={showLiveFeed}
                  />
                </div>
              </div>
            ) : (
            /* ── NORMAL START SCREEN ── */
            <div className="flex w-full flex-col items-center">
              <img src={quecksilverLogo} alt="QueckSilver" className="mb-2 h-40 w-40 object-contain mt-[-16px]" />
              <h1 className="mb-3 text-center text-3xl font-medium text-foreground md:text-4xl animate-fade-in">{greeting}</h1>
              <div className="mx-auto w-full max-w-2xl px-4">
                <ChatInput
                  onSend={handleSend} isLoading={isLoading || !!agentTask} activeMode={activeMode}
                  onModeChange={setActiveMode} onStop={stopGeneration}
                  selectedModel={selectedModel} selectedVariant={selectedVariant}
                  onVariantChange={(v) => { setSelectedVariant(v); localStorage.setItem("qs_selected_variant", v); }}
                  textareaRef={inputRef} hasMessages={false} mainView={mainView}
                  latestAssistantMessage={latestAIMessage}
                  onToggleLiveFeed={() => setShowLiveFeed(p => !p)}
                  showLiveFeed={showLiveFeed}
                />
                {/* Voice mode — shown on start screen below the input */}
                {voiceModeActive ? (
                  <div className="mt-3">
                    <VoiceMode
                      onSend={handleVoiceSend}
                      onStop={stopGeneration}
                      latestAssistantMessage={latestAIMessage}
                      isAIResponding={isLoading}
                      onClose={() => setVoiceModeActive(false)}
                    />
                  </div>
                ) : null}
                <div className="mt-3 flex flex-col items-center gap-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    {FIXED_SUGGESTIONS.slice(0, 4).map((s) => (
                      <button key={s.label} onClick={() => handleSuggestionClick(s.prompt)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground whitespace-nowrap">
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {FIXED_SUGGESTIONS.slice(4).map((s) => (
                      <button key={s.label} onClick={() => handleSuggestionClick(s.prompt)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground whitespace-nowrap">
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            ) /* end incognito ternary */
          ) : (
            <div className="w-full max-w-3xl mx-auto pb-32 pt-24" style={{ paddingBottom: voiceModeActive ? "11rem" : undefined }}>
              <div ref={messagesContainerRef} className="flex-1 space-y-6" style={{ overflowAnchor: "none" }}>
                {hasMoreAbove && (
                  <div ref={topSentinelRef} className="flex justify-center py-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                )}
                {visibleMessages.map((msg, idx) => (
                  <ChatMessage
                    key={startIndex + idx}
                    role={msg.role} content={msg.content}
                    isStreaming={isLoading && msg.role === "assistant" && startIndex + idx === messages.length - 1}
                    isError={!!msg.error} onRetry={msg.error ? retryLastMessage : undefined}
                    onSuggestionClick={handleSuggestionClick}
                    onEditMessage={msg.role === "user" ? (newText) => handleEditMessage(startIndex + idx, newText) : undefined}
                    onRegenerateFromUser={msg.role === "user" ? () => handleRegenerateFromUser(startIndex + idx) : undefined}
                    deviceId={deviceId}
                  />
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 pl-1">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center" style={{ overflow: 'visible' }}>
                      <div className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-t-primary" />
                      <img src={quecksilverLogo} alt="QueckSilver" className="h-6 w-6" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-muted-foreground">
                        {activeMode === "image" ? "Loading Atelier 3..." : searchStatus ? (
                          <span className="flex items-center gap-2"><Globe className="h-4 w-4 animate-pulse" />{searchStatus}</span>
                        ) : isThinking ? (
                          <span className="flex items-center gap-2"><span className="text-base">🤔</span><span className="animate-pulse font-medium">Thinking...</span></span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ))}

          {(hasMessages || mainView !== "chat") && (
            <div className={`fixed bottom-0 right-0 px-4 pb-4 pt-2 transition-all duration-200 ${sidebarOpen && !incognitoMode ? "md:left-72" : "left-0"} ${incognitoMode ? "bg-zinc-950" : "bg-background"}`}>
              <div className="relative mx-auto w-full max-w-3xl">
                {showScrollDown && (
                  <button onClick={scrollToBottom} className="absolute -top-12 left-1/2 z-30 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-md transition-all hover:bg-accent hover:shadow-lg">
                    <ArrowDown className="h-5 w-5 text-foreground" />
                  </button>
                )}
                {/* Voice mode bar — shown above input when active */}
                {voiceModeActive && (
                  <div className="mb-2">
                    <VoiceMode
                      onSend={handleVoiceSend}
                      onStop={stopGeneration}
                      latestAssistantMessage={latestAIMessage}
                      isAIResponding={isLoading}
                      onClose={() => setVoiceModeActive(false)}
                    />
                  </div>
                )}
                <ChatInput
                  onSend={(msg, mode, imgs, docs) => {
                    // In pictures view, always send as image mode
                    handleSend(msg, mainView === "pictures" ? "image" : mode, imgs, docs);
                    if (mainView === "pictures") handleViewChange("chat");
                  }}
                  isLoading={isLoading || !!agentTask}
                  activeMode={mainView === "pictures" ? "image" : activeMode}
                  onModeChange={setActiveMode} onStop={stopGeneration}
                  selectedModel={selectedModel} selectedVariant={selectedVariant}
                  onVariantChange={(v) => { setSelectedVariant(v); localStorage.setItem("qs_selected_variant", v); }} hasMessages={hasMessages}
                  textareaRef={inputRef} mainView={mainView}
                  latestAssistantMessage={latestAIMessage}
                  onToggleLiveFeed={() => setShowLiveFeed(p => !p)}
                  showLiveFeed={showLiveFeed}
                />
                <p className="mt-1.5 text-center text-[11px] text-muted-foreground/50 select-none">
                  {incognitoMode
                    ? "Incognito chats are not saved to history or used to train models."
                    : "QueckSilver can make mistakes. Please check important information."
                  }
                </p>
              </div>
            </div>
          )}
        </main>

        <footer className="px-6 py-4 text-center text-sm text-muted-foreground">
          © 2026 QueckSilver AI
        </footer>

        <LocationPrompt
          open={showLocationPrompt} loading={locationLoading}
          pendingMessage={pendingMessageRef.current?.message}
          onRequestBrowser={() => { requestBrowserLocation().then(handleLocationSet); }}
          onManualCity={(city) => { setManualCity(city).then(handleLocationSet); }}
          onDismiss={handleLocationDismiss}
        />

        {/* ── Agent Panel ─────────────────────────────────────────────── */}
        {agentTask && (
          <AgentPanel
            task={agentTask}
            {...agentContext}
            onAnswer={async (rawAnswer) => {
              // Strip any stray JSON tool calls from the answer
              const clean = rawAnswer.replace(/\{[\s\S]*?"tool"\s*:\s*"[^"]*"[\s\S]*?\}/g, "").trim();
              const finalAnswer = clean.length > 20 ? clean : rawAnswer;

              closeAgent();
              setChatStarted(true);

              // Inject BOTH user task + AI answer into chat — clean slate
              const userMsg = { role: "user" as const, content: agentTask || "" };
              const aiMsg   = { role: "assistant" as const, content: finalAnswer };
              setInitialMessages([...messages, userMsg, aiMsg]);

              // Persist to DB
              let convId = activeConversationId || currentConvIdRef.current;
              if (!convId) {
                convId = await createConversation(agentTask || "Agent task");
                if (convId) {
                  currentConvIdRef.current = convId;
                  navigate(`/c/${convId}`, { replace: true });
                }
              }
              if (convId) {
                await saveMessage(convId, "user", agentTask || "");
                await saveMessage(convId, "assistant", finalAnswer);
                updateConversationTitle(convId, agentTask || "", finalAnswer, language);
              }
            }}
            onClose={closeAgent}
          />
        )}

        {/* ── Live Feed Panel ──────────────────────────────────────────── */}
        {showLiveFeed && (
          <LiveFeed
            isAIBusy={isLoading}
            onClose={() => setShowLiveFeed(false)}
            onFrame={(dataUrl, prompt) => {
                setChatStarted(true);
                setMainView("chat");
                // Convert base64 dataURL → Blob without fetch() (avoids CORS)
                const [header, b64] = dataUrl.split(",");
                const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
                const binary = atob(b64);
                const arr = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
                const blob = new Blob([arr], { type: mime });
                const file = new File([blob], `frame-${Date.now()}.jpg`, { type: mime });
                supabase.storage.from("chat-uploads")
                  .upload(`${Date.now()}-frame.jpg`, file)
                  .then(({ data, error }) => {
                    if (error || !data) return;
                    const { data: urlData } = supabase.storage.from("chat-uploads").getPublicUrl(data.path);
                    sendMessage(prompt, "default", [urlData.publicUrl]);
                  });
              }}
          />
        )}
        </div>{/* end main chat column */}

        {/* Artifact panel — right side, fixed height */}
        {artifactOpen && (
          <div className="hidden md:flex md:w-1/2 md:flex-col md:border-l md:border-border sticky top-0 h-screen">
            <ArtifactPanel
              artifacts={artifacts}
              activeIndex={artifactIndex}
              onClose={closeArtifacts}
              onNavigate={setArtifactIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
