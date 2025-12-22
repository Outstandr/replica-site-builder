import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileHeader from '@/components/layout/MobileHeader';
import FloatingActionButton from '@/components/mobile/FloatingActionButton';
import EmptyState from '@/components/mobile/EmptyState';
import SkeletonCard from '@/components/mobile/SkeletonCard';
import { 
  LogOut,
  Plus,
  Calendar,
  Smile,
  Frown,
  Meh,
  Sun,
  Moon,
  Trash2,
  Edit2,
  Save,
  X,
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
  happy: { icon: Smile, color: 'text-accent', bg: 'bg-accent/20' },
  neutral: { icon: Meh, color: 'text-primary', bg: 'bg-primary/20' },
  sad: { icon: Frown, color: 'text-destructive', bg: 'bg-destructive/20' },
  energized: { icon: Sun, color: 'text-gold', bg: 'bg-gold/20' },
  calm: { icon: Moon, color: 'text-secondary', bg: 'bg-secondary/20' },
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
      <MobileLayout>
        <MobileHeader 
          title={t.common.journal}
          showLogo
          rightContent={<LanguageSwitcher />}
        />
        <main className="px-4 py-6 space-y-4">
          {[1, 2, 3].map(i => (
            <SkeletonCard key={i} />
          ))}
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobileHeader 
        title={t.common.journal}
        showLogo
        rightContent={
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-10 w-10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        }
      />

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Writing Mode */}
        {isWriting && (
          <div className="bg-card/50 backdrop-blur border-2 border-accent/30 rounded-2xl p-5 mb-6 animate-fade-in-up shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
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
                className="h-10 w-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <Input
              placeholder="Entry title (optional)"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              className="mb-4 h-12 bg-background/50"
            />

            <Textarea
              placeholder="Write your thoughts..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              className="mb-4 min-h-[160px] bg-background/50"
            />

            {/* Mood Selector */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-3">How are you feeling?</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(moodIcons).map(([mood, { icon: Icon, color, bg }]) => (
                  <button
                    key={mood}
                    onClick={() => setNewEntry({ ...newEntry, mood })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all active:scale-95 ${
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

            <Button className="w-full h-12" onClick={handleSaveEntry}>
              <Save className="w-5 h-5 mr-2" />
              {editingId ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 && !isWriting ? (
            <EmptyState
              icon={Calendar}
              title="No entries yet"
              description="Start your journaling journey by creating your first entry"
              action={{
                label: "Write First Entry",
                onClick: () => setIsWriting(true)
              }}
            />
          ) : (
            entries.map((entry, index) => {
              const moodData = moodIcons[entry.mood as keyof typeof moodIcons] || moodIcons.neutral;
              const MoodIcon = moodData.icon;
              
              return (
                <div
                  key={entry.id}
                  className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-5 transition-all group animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${moodData.bg} flex items-center justify-center shrink-0`}>
                        <MoodIcon className={`w-5 h-5 ${moodData.color}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {entry.title || 'Untitled Entry'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEntry(entry)}
                        className="h-9 w-9"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="h-9 w-9 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-foreground/80 whitespace-pre-wrap line-clamp-4 text-sm">
                    {entry.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      {!isWriting && entries.length > 0 && (
        <FloatingActionButton
          onClick={() => setIsWriting(true)}
          icon={<Plus className="w-6 h-6" />}
        />
      )}
    </MobileLayout>
  );
};

export default Journal;
