import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Play, BookOpen, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/useTranslations";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { cn } from "@/lib/utils";

interface Module {
  name: string;
  title: string;
  description: string;
  color: string;
  lessonCount: number;
  completedCount: number;
}

const modules: Omit<Module, "lessonCount" | "completedCount">[] = [
  { name: "rhythm", title: "Rhythm", description: "Build a strong foundation through structure and rhythm", color: "hsl(var(--reset-rhythm))" },
  { name: "energy", title: "Energy", description: "Break through blockages and reclaim your vital power", color: "hsl(var(--reset-energy))" },
  { name: "systems", title: "Systems", description: "Emotional growth and conscious connection", color: "hsl(var(--reset-systems))" },
  { name: "execution", title: "Execution", description: "Put leadership and consistency into practice", color: "hsl(var(--reset-execution))" },
  { name: "transformation", title: "Transformation", description: "Identity, mastery, and the embodiment of trust", color: "hsl(var(--reset-transformation))" },
];

const MasterclassLibrary = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const translations = useTranslations();
  const [activeTab, setActiveTab] = useState("video");
  const [modulesData, setModulesData] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchModuleData = async () => {
      if (!user) return;

      try {
        const enrichedModules = await Promise.all(
          modules.map(async (mod) => {
            const { count: lessonCount } = await supabase
              .from("masterclass_lessons")
              .select("*", { count: "exact", head: true })
              .eq("module_name", mod.name);

            const { data: lessons } = await supabase
              .from("masterclass_lessons")
              .select("id")
              .eq("module_name", mod.name);

            const lessonIds = lessons?.map(l => l.id) || [];

            const { count: completedCount } = await supabase
              .from("user_lesson_progress")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .eq("completed", true)
              .in("lesson_id", lessonIds);

            return {
              ...mod,
              lessonCount: lessonCount || 0,
              completedCount: completedCount || 0,
            };
          })
        );

        setModulesData(enrichedModules);
      } catch (error) {
        console.error("Error fetching module data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModuleData();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <MobileLayout>
        <MobileHeader 
          title={translations.nav.masterclasses} 
          subtitle="Access all your learning content"
        />
        <main className="px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <SkeletonCard key={i} variant="module" />
            ))}
          </div>
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobileHeader 
        title={translations.nav.masterclasses} 
        subtitle="Access all your learning content"
        showLogo
      />

      <main className="px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
            <TabsTrigger value="video" className="flex items-center gap-2 h-full data-[state=active]:shadow-md">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span> Courses
            </TabsTrigger>
            <TabsTrigger value="book" className="flex items-center gap-2 h-full data-[state=active]:shadow-md">
              <BookOpen className="w-4 h-4" />
              E-Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulesData.map((mod, index) => (
                <Link
                  key={mod.name}
                  to={`/module/${mod.name}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="relative rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg active:scale-[0.98] bg-card/50"
                    style={{
                      borderColor: `${mod.color}30`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${mod.color}20` }}
                    >
                      <Play className="w-6 h-6" style={{ color: mod.color }} />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1.5">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {mod.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {mod.completedCount}/{mod.lessonCount} lessons
                      </span>
                      {mod.lessonCount > 0 && (
                        <div className="flex items-center gap-1 text-gold">
                          <Star className="w-4 h-4" />
                          <span>
                            {Math.round((mod.completedCount / mod.lessonCount) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${mod.lessonCount > 0 ? (mod.completedCount / mod.lessonCount) * 100 : 0}%`,
                          backgroundColor: mod.color,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="book" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulesData.map((mod, index) => (
                <Link
                  key={mod.name}
                  to={`/book/${mod.name}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="relative rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg active:scale-[0.98] bg-card/50"
                    style={{
                      borderColor: `${mod.color}30`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${mod.color}20` }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: mod.color }} />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1.5">
                      {mod.title} Book
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Read the complete {mod.title} guide
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>~30 min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </MobileLayout>
  );
};

export default MasterclassLibrary;
