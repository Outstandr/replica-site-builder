import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslations } from "@/hooks/useTranslations";

export const Hero = () => {
  const t = useTranslations();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted to-background">
      {/* Animated background blobs */}
      <div className="absolute top-20 right-10 md:right-20 w-48 h-48 md:w-96 md:h-96 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl opacity-30 md:opacity-40 animate-float" />
      <div className="absolute bottom-20 left-10 md:left-20 w-64 h-64 md:w-[500px] md:h-[500px] bg-gradient-to-br from-accent to-reset-energy rounded-full blur-3xl opacity-20 md:opacity-30 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-br from-reset-execution to-reset-transformation rounded-full blur-3xl opacity-25 md:opacity-35 animate-float" style={{ animationDelay: "4s" }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] opacity-10 md:opacity-20" />

      {/* Floating particles - hidden on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <Star className="absolute top-20 left-10 w-6 h-6 text-primary animate-scale-pulse" />
        <Star className="absolute top-40 right-32 w-4 h-4 text-accent animate-scale-pulse" style={{ animationDelay: "1s" }} />
        <Sparkles className="absolute bottom-32 left-40 w-8 h-8 text-secondary animate-scale-pulse" style={{ animationDelay: "2s" }} />
        <Zap className="absolute bottom-20 right-20 w-6 h-6 text-reset-energy animate-scale-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="zen-container relative z-10 text-center py-12 px-4 md:py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border-2 animate-glow-border shadow-glow animate-bounce-in">
            <Sparkles className="w-5 h-5 text-primary animate-scale-pulse" />
            <span className="text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t.landing.hero.badge}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-tight animate-bounce-in animation-delay-100">
            {t.landing.hero.title}{" "}
            <span className="gradient-text neon-text text-shadow-soft">
              {t.landing.hero.titleHighlight}
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground/80 font-semibold max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            {t.landing.hero.subtitle}<br className="hidden sm:block"/>
            <span className="sm:hidden"> </span>{t.landing.hero.subtitleMobile}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up animation-delay-300 w-full sm:w-auto">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="hero" className="group text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-neon hover-lift w-full sm:w-auto">
                {t.landing.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="zen"
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 hover-lift w-full sm:w-auto"
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t.landing.hero.ctaSecondary}
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 pt-12 md:pt-16 animate-fade-in-up animation-delay-400">
            <div className="text-center hover-lift">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black gradient-text animate-scale-pulse">10K+</div>
              <div className="text-sm sm:text-base font-semibold text-foreground/70 mt-1 sm:mt-2">Students Transformed</div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black gradient-text animate-scale-pulse" style={{ animationDelay: "0.5s" }}>95%</div>
              <div className="text-sm sm:text-base font-semibold text-foreground/70 mt-1 sm:mt-2">Success Rate</div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black gradient-text animate-scale-pulse" style={{ animationDelay: "1s" }}>5 Steps</div>
              <div className="text-sm sm:text-base font-semibold text-foreground/70 mt-1 sm:mt-2">To Transformation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};