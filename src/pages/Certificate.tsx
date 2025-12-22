import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Download, Share2, Award, Calendar, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CertificateData {
  id: string;
  user_id: string;
  module_name: string;
  certificate_number: string;
  completed_at: string;
  score: number | null;
}

const moduleConfig: Record<string, { title: string; color: string }> = {
  rhythm: { title: "Rhythm", color: "hsl(var(--reset-rhythm))" },
  energy: { title: "Energy", color: "hsl(var(--reset-energy))" },
  systems: { title: "Systems", color: "hsl(var(--reset-systems))" },
  execution: { title: "Execution", color: "hsl(var(--reset-execution))" },
  transformation: { title: "Transformation", color: "hsl(var(--reset-transformation))" },
};

const Certificate = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) return;

      try {
        const { data: certData, error: certError } = await supabase
          .from("user_certificates")
          .select("*")
          .eq("id", certificateId)
          .maybeSingle();

        if (certError) throw certError;
        setCertificate(certData);

        if (certData) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", certData.user_id)
            .maybeSingle();

          if (profileData?.display_name) {
            setUserName(profileData.display_name);
          }
        }
      } catch (error) {
        console.error("Error fetching certificate:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RESET Certificate",
          text: `Check out my ${moduleConfig[certificate?.module_name || ""]?.title} certification!`,
          url,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Certificate link copied to clipboard",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Certificate Not Found</h2>
          <p className="text-muted-foreground mb-4">This certificate does not exist or has been removed.</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const config = moduleConfig[certificate.module_name] || moduleConfig.rhythm;
  const completedDate = new Date(certificate.completed_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-12">
        {/* Certificate Card */}
        <div 
          className="relative rounded-3xl border-4 p-8 md:p-12 bg-card shadow-2xl"
          style={{ 
            borderColor: config.color,
            background: `linear-gradient(135deg, ${config.color}05, transparent, ${config.color}05)`
          }}
        >
          {/* Decorative corners */}
          <div 
            className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 rounded-tl-xl"
            style={{ borderColor: config.color }}
          />
          <div 
            className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 rounded-tr-xl"
            style={{ borderColor: config.color }}
          />
          <div 
            className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 rounded-bl-xl"
            style={{ borderColor: config.color }}
          />
          <div 
            className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 rounded-br-xl"
            style={{ borderColor: config.color }}
          />

          <div className="text-center">
            {/* Logo/Badge */}
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Trophy className="w-10 h-10" style={{ color: config.color }} />
            </div>

            {/* Title */}
            <h1 className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Certificate of Completion
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: config.color }}>
              {config.title} Mastery
            </h2>

            {/* Divider */}
            <div 
              className="w-24 h-1 mx-auto mb-8 rounded-full"
              style={{ backgroundColor: config.color }}
            />

            {/* Presented to */}
            <p className="text-muted-foreground mb-2">This is to certify that</p>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {userName || "Student"}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              has successfully completed all lessons and assessments in the{" "}
              <span className="font-semibold" style={{ color: config.color }}>
                {config.title}
              </span>{" "}
              module of the RESET Blueprint® program.
            </p>

            {/* Score (if available) */}
            {certificate.score !== null && (
              <div className="mb-8">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Award className="w-5 h-5" style={{ color: config.color }} />
                  <span className="font-bold" style={{ color: config.color }}>
                    Score: {certificate.score}%
                  </span>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{completedDate}</span>
            </div>

            {/* Certificate number */}
            <p className="mt-6 text-xs text-muted-foreground/60">
              Certificate ID: {certificate.certificate_number}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Certificate;
