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
  Edit2
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            <Sparkles className="w-6 h-6 text-reset-r" />
            <span className="text-xl font-bold bg-gradient-reset bg-clip-text text-transparent">
              {t.common.profile}
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Card */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-reset flex items-center justify-center text-white text-3xl font-bold mb-4">
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
                className="bg-background/50"
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
                className="bg-background/50 min-h-[100px]"
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
                    className={`px-4 py-2 rounded-lg transition-all ${
                      profile.preferred_language === lang
                        ? 'bg-reset-r text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
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
