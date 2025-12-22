import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import MobileLayout from '@/components/layout/MobileLayout';
import MobileHeader from '@/components/layout/MobileHeader';
import SkeletonCard from '@/components/mobile/SkeletonCard';
import { 
  LogOut,
  Save,
  User,
  Mail,
  Globe,
  Edit2,
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
      <MobileLayout>
        <MobileHeader 
          title={t.common.profile}
          showLogo
          rightContent={<LanguageSwitcher />}
        />
        <main className="px-4 py-6">
          <SkeletonCard className="h-96" />
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobileHeader 
        title={t.common.profile}
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

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="bg-card/50 backdrop-blur border-2 border-primary/20 rounded-2xl p-6 animate-fade-in-up shadow-soft">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-3xl font-bold mb-4 shadow-glow active:scale-95 transition-transform"
            >
              {profile.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile.display_name || 'Your Profile'}
            </h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>

          {/* Profile Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                Display Name
              </Label>
              <Input
                id="displayName"
                value={profile.display_name || ''}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                disabled={!isEditing}
                className="h-12 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="h-12 bg-background/50 opacity-60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2 text-sm">
                <Edit2 className="w-4 h-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                className="min-h-[100px] bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                Preferred Language
              </Label>
              <div className="flex gap-2">
                {(['en', 'nl', 'ru'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => isEditing && setProfile({ ...profile, preferred_language: lang })}
                    disabled={!isEditing}
                    className={`flex-1 px-4 py-3 rounded-xl transition-all active:scale-95 text-sm font-medium ${
                      profile.preferred_language === lang
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    } ${!isEditing ? 'opacity-60' : ''}`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'nl' ? 'NL' : 'RU'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-12"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full h-12"
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
    </MobileLayout>
  );
};

export default Profile;
