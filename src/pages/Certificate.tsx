import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Share2, Award, Calendar, Trophy, Sparkles, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import PageTransition from "@/components/layout/PageTransition";
import EmptyState from "@/components/mobile/EmptyState";

interface CertificateData {
  id: string;
  user_id: string;
  module_name: string;
  certificate_number: string;
  completed_at: string;
  score: number | null;
}

const moduleConfig: Record<string, { title: string; color: string }> = {
  rhythm: { title: "Rhythm", color: "primary" },
  energy: { title: "Energy", color: "secondary" },
  systems: { title: "Systems", color: "accent" },
  execution: { title: "Execution", color: "primary" },
  transformation: { title: "Transformation", color: "secondary" },
};

const Certificate = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
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
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Certificate" backPath="/dashboard" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
        </div>
      </MobileLayout>
    );
  }

  if (!certificate) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Certificate" backPath="/dashboard" />
        <div className="px-4 py-12">
          <EmptyState
            icon={Award}
            title="Certificate Not Found"
            description="This certificate does not exist or has been removed."
            action={{
              label: "Back to Dashboard",
              onClick: () => navigate("/dashboard")
            }}
          />
        </div>
      </MobileLayout>
    );
  }

  const config = moduleConfig[certificate.module_name] || moduleConfig.rhythm;
  const completedDate = new Date(certificate.completed_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader 
        title="Certificate"
        backPath="/dashboard"
        rightContent={
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        }
      />

      <PageTransition>
        <main className="px-4 py-6">
          {/* Celebration Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Sparkles className="absolute top-20 left-8 w-6 h-6 text-primary/40 animate-scale-pulse" />
            <Sparkles className="absolute top-32 right-12 w-4 h-4 text-secondary/40 animate-scale-pulse" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute top-48 left-16 w-5 h-5 text-accent/40 animate-scale-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Certificate Card */}
          <div 
            className="relative bg-card/90 backdrop-blur-sm rounded-3xl border-4 p-6 md:p-10 shadow-strong animate-fade-in-up"
            style={{ 
              borderColor: `hsl(var(--${config.color}))`,
            }}
          >
            {/* Decorative corners */}
            <div 
              className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl"
              style={{ borderColor: `hsl(var(--${config.color}))` }}
            />
            <div 
              className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl"
              style={{ borderColor: `hsl(var(--${config.color}))` }}
            />
            <div 
              className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl"
              style={{ borderColor: `hsl(var(--${config.color}))` }}
            />
            <div 
              className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 rounded-br-xl"
              style={{ borderColor: `hsl(var(--${config.color}))` }}
            />

            <div className="text-center py-4">
              {/* Badge */}
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce-slow"
                style={{ backgroundColor: `hsl(var(--${config.color}) / 0.15)` }}
              >
                <Trophy className="w-10 h-10" style={{ color: `hsl(var(--${config.color}))` }} />
              </div>

              {/* Title */}
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Certificate of Completion
              </p>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-6"
                style={{ color: `hsl(var(--${config.color}))` }}
              >
                {config.title} Mastery
              </h2>

              {/* Divider */}
              <div 
                className="w-16 h-1 mx-auto mb-6 rounded-full"
                style={{ backgroundColor: `hsl(var(--${config.color}))` }}
              />

              {/* Presented to */}
              <p className="text-sm text-muted-foreground mb-2">This is to certify that</p>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                {userName || "Student"}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
                has successfully completed all lessons and assessments in the{" "}
                <span className="font-semibold" style={{ color: `hsl(var(--${config.color}))` }}>
                  {config.title}
                </span>{" "}
                module of the RESET Blueprint® program.
              </p>

              {/* Score */}
              {certificate.score !== null && (
                <div className="mb-6">
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ backgroundColor: `hsl(var(--${config.color}) / 0.15)` }}
                  >
                    <Award className="w-5 h-5" style={{ color: `hsl(var(--${config.color}))` }} />
                    <span className="font-bold" style={{ color: `hsl(var(--${config.color}))` }}>
                      Score: {certificate.score}%
                    </span>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{completedDate}</span>
              </div>

              {/* Certificate ID */}
              <p className="mt-6 text-xs text-muted-foreground/60">
                ID: {certificate.certificate_number}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </main>
      </PageTransition>
    </MobileLayout>
  );
};

export default Certificate;