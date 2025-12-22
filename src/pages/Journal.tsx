import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles,
  LogOut,
  Plus,
  Calendar,
  Heart,
  Smile,
  Frown,
  Meh,
  Sun,
  Moon,
  ChevronLeft,
  Trash2,
  Edit2,
  Save,
  X,
  Star,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  tags: string[] | null;
  created_at: string;
}

const moodIcons = {
  happy: { icon: Smile, color: 'text-reset-s', bg: 'bg-reset-s/20', borderColor: 'reset-s' },
  neutral: { icon: Meh, color: 'text-reset-e', bg: 'bg-reset-e/20', borderColor: 'reset-e' },
  sad: { icon: Frown, color: 'text-reset-r', bg: 'bg-reset-r/20', borderColor: 'reset-r' },
  energized: { icon: Sun, color: 'text-reset-e2', bg: 'bg-reset-e2/20', borderColor: 'reset-e2' },
  calm: { icon: Moon, color: 'text-reset-t', bg: 'bg-reset-t/20', borderColor: 'reset-t' },
};

const Journal = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const t = useTranslations();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'neutral' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load journal entries');
      } else {
        setEntries(data || []);
      }
      setIsLoading(false);
    };

    fetchEntries();
  }, [user]);

  const handleSaveEntry = async () => {
    if (!user || !newEntry.content.trim()) {
      toast.error('Please write something before saving');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: newEntry.title || null,
          content: newEntry.content,
          mood: newEntry.mood,
        })
        .eq('id', editingId)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update entry');
      } else {
        toast.success('Entry updated');
        setEntries(entries.map(e => 
          e.id === editingId 
            ? { ...e, title: newEntry.title, content: newEntry.content, mood: newEntry.mood }
            : e
        ));
        setEditingId(null);
        setIsWriting(false);
        setNewEntry({ title: '', content: '', mood: 'neutral' });
      }
    } else {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: newEntry.title || null,
          content: newEntry.content,
          mood: newEntry.mood,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to save entry');
      } else {
        toast.success('Entry saved');
        setEntries([data, ...entries]);
        setIsWriting(false);
        setNewEntry({ title: '', content: '', mood: 'neutral' });
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete entry');
    } else {
      toast.success('Entry deleted');
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setNewEntry({
      title: entry.title || '',
      content: entry.content,
      mood: entry.mood || 'neutral',
    });
    setIsWriting(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-reset-r">
          <Sparkles className="w-12 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-reset-s/20 to-reset-e/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-gradient-to-br from-reset-t/20 to-reset-r/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-reset-e2/15 to-reset-s/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
        <Sparkles className="absolute top-32 left-20 w-4 h-4 text-reset-s/30 animate-scale-pulse" style={{ animationDelay: '0s' }} />
        <Star className="absolute top-48 right-32 w-3 h-3 text-reset-e/30 animate-scale-pulse" style={{ animationDelay: '1s' }} />
        <Heart className="absolute bottom-64 left-1/4 w-4 h-4 text-reset-t/30 animate-scale-pulse" style={{ animationDelay: '2s' }} />
        <Zap className="absolute top-1/3 right-20 w-3 h-3 text-reset-r/30 animate-scale-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="zen-container py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            <Sparkles className="w-6 h-6 text-reset-r" />
            <span className="text-xl font-bold bg-gradient-reset bg-clip-text text-transparent">
              {t.common.journal}
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-reset-r/10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="zen-container py-8 max-w-3xl mx-auto relative z-10">
        {/* New Entry Button */}
        {!isWriting && (
          <Button 
            variant="hero" 
            className="w-full mb-8 animate-bounce-in"
            onClick={() => setIsWriting(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Journal Entry
          </Button>
        )}

        {/* Writing Mode */}
        {isWriting && (
          <div 
            className="bg-card/50 backdrop-blur border-2 rounded-2xl p-6 mb-8 animate-bounce-in"
            style={{ 
              borderColor: 'hsl(var(--reset-s))',
              boxShadow: '0 8px 32px hsl(var(--reset-s) / 0.15)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? 'Edit Entry' : 'New Entry'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsWriting(false);
                  setEditingId(null);
                  setNewEntry({ title: '', content: '', mood: 'neutral' });
                }}
                className="hover:bg-reset-r/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <Input
              placeholder="Entry title (optional)"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              className="mb-4 bg-background/50 border-border/50 focus:border-reset-s"
            />

            <Textarea
              placeholder="Write your thoughts..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              className="mb-4 min-h-[200px] bg-background/50 border-border/50 focus:border-reset-s"
            />

            {/* Mood Selector */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">How are you feeling?</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(moodIcons).map(([mood, { icon: Icon, color, bg }]) => (
                  <button
                    key={mood}
                    onClick={() => setNewEntry({ ...newEntry, mood })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 ${
                      newEntry.mood === mood 
                        ? `${bg} ${color} ring-2 ring-current` 
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize text-sm">{mood}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button variant="hero" className="w-full" onClick={handleSaveEntry}>
              <Save className="w-5 h-5 mr-2" />
              {editingId ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 && !isWriting ? (
            <div className="text-center py-16 animate-bounce-in">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No entries yet</h3>
              <p className="text-muted-foreground">Start your journaling journey by creating your first entry</p>
            </div>
          ) : (
            entries.map((entry, index) => {
              const moodData = moodIcons[entry.mood as keyof typeof moodIcons] || moodIcons.neutral;
              const MoodIcon = moodData.icon;
              
              return (
                <div
                  key={entry.id}
                  className="bg-card/50 backdrop-blur border-2 rounded-xl p-6 hover:scale-[1.01] transition-all group animate-bounce-in"
                  style={{ 
                    borderColor: `hsl(var(--${moodData.borderColor}))`,
                    boxShadow: `0 4px 20px hsl(var(--${moodData.borderColor}) / 0.1)`,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${moodData.bg} flex items-center justify-center`}>
                        <MoodIcon className={`w-5 h-5 ${moodData.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {entry.title || 'Untitled Entry'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEntry(entry)}
                        className="hover:bg-reset-e/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-foreground/80 whitespace-pre-wrap line-clamp-4">
                    {entry.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Journal;