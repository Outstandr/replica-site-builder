import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles,
  LogOut,
  ChevronLeft,
  Save,
  User,
  Mail,
  Globe,
  Edit2,
  Star,
  Heart,
  Zap
} from 'lucide-react';

interface Profile {
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  preferred_language: string;
}

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const t = useTranslations();
  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    bio: '',
    avatar_url: null,
    preferred_language: 'en',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url,
          preferred_language: data.preferred_language || 'en',
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        preferred_language: profile.preferred_language,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated');
      setLanguage(profile.preferred_language as 'en' | 'nl' | 'ru');
      setIsEditing(false);
    }
    
    setIsSaving(false);
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
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-reset-r/20 to-reset-e/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-gradient-to-br from-reset-s/20 to-reset-t/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-reset-e2/15 to-reset-r/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
        <Sparkles className="absolute top-32 left-20 w-4 h-4 text-reset-r/30 animate-scale-pulse" style={{ animationDelay: '0s' }} />
        <Star className="absolute top-48 right-32 w-3 h-3 text-reset-e/30 animate-scale-pulse" style={{ animationDelay: '1s' }} />
        <Heart className="absolute bottom-64 left-1/4 w-4 h-4 text-reset-s/30 animate-scale-pulse" style={{ animationDelay: '2s' }} />
        <Zap className="absolute top-1/3 right-20 w-3 h-3 text-reset-t/30 animate-scale-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="zen-container py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            <Sparkles className="w-6 h-6 text-reset-r" />
            <span className="text-xl font-bold bg-gradient-reset bg-clip-text text-transparent">
              {t.common.profile}
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

      <main className="zen-container py-8 max-w-2xl mx-auto relative z-10">
        {/* Profile Card */}
        <div 
          className="bg-card/50 backdrop-blur border-2 rounded-2xl p-8 animate-bounce-in"
          style={{ 
            borderColor: 'hsl(var(--reset-r))',
            boxShadow: '0 8px 32px hsl(var(--reset-r) / 0.15)'
          }}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className="w-24 h-24 rounded-full bg-gradient-reset flex items-center justify-center text-white text-3xl font-bold mb-4 hover:scale-110 transition-transform cursor-pointer"
              style={{ boxShadow: '0 0 40px hsl(var(--reset-r) / 0.4)' }}
            >
              {profile.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile.display_name || 'Your Profile'}
            </h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Display Name
              </Label>
              <Input
                id="displayName"
                value={profile.display_name || ''}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                disabled={!isEditing}
                className="bg-background/50 border-border/50 focus:border-reset-r"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-background/50 opacity-60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                className="bg-background/50 min-h-[100px] border-border/50 focus:border-reset-r"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Preferred Language
              </Label>
              <div className="flex gap-2">
                {(['en', 'nl', 'ru'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => isEditing && setProfile({ ...profile, preferred_language: lang })}
                    disabled={!isEditing}
                    className={`px-4 py-2 rounded-lg transition-all hover:scale-105 ${
                      profile.preferred_language === lang
                        ? 'bg-reset-r text-white shadow-lg'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    style={profile.preferred_language === lang ? { boxShadow: '0 4px 15px hsl(var(--reset-r) / 0.3)' } : {}}
                  >
                    {lang === 'en' ? 'English' : lang === 'nl' ? 'Nederlands' : 'Русский'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;