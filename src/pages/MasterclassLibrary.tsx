import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Play, BookOpen, Clock, Star, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/useTranslations";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
            // Get lesson count
            const { count: lessonCount } = await supabase
              .from("masterclass_lessons")
              .select("*", { count: "exact", head: true })
              .eq("module_name", mod.name);

            // Get completed count
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {translations.nav.masterclasses}
              </h1>
              <p className="text-sm text-muted-foreground">
                Access all your learning content
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Video Courses
            </TabsTrigger>
            <TabsTrigger value="book" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              E-Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulesData.map((mod) => (
                <Link
                  key={mod.name}
                  to={`/module/${mod.name}`}
                  className="group"
                >
                  <div
                    className="relative rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    style={{
                      borderColor: `${mod.color}30`,
                      background: `linear-gradient(135deg, ${mod.color}05, ${mod.color}10)`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${mod.color}20` }}
                    >
                      <Play className="w-6 h-6" style={{ color: mod.color }} />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulesData.map((mod) => (
                <Link
                  key={mod.name}
                  to={`/book/${mod.name}`}
                  className="group"
                >
                  <div
                    className="relative rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    style={{
                      borderColor: `${mod.color}30`,
                      background: `linear-gradient(135deg, ${mod.color}05, ${mod.color}10)`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${mod.color}20` }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: mod.color }} />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">
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
    </div>
  );
};

export default MasterclassLibrary;
