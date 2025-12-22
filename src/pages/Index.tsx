import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, Video, Menu, X, Leaf, Zap, Heart, Mountain, Flower } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();

  const resetSteps = [
    { letter: "R", title: t.landing.resetOverview.rhythm.title, subtitle: t.landing.resetOverview.rhythm.subtitle, description: t.landing.resetOverview.rhythm.description, icon: Leaf, color: "reset-rhythm", symbolism: t.landing.resetOverview.rhythm.symbolism },
    { letter: "E", title: t.landing.resetOverview.energy.title, subtitle: t.landing.resetOverview.energy.subtitle, description: t.landing.resetOverview.energy.description, icon: Zap, color: "reset-energy", symbolism: t.landing.resetOverview.energy.symbolism },
    { letter: "S", title: t.landing.resetOverview.systems.title, subtitle: t.landing.resetOverview.systems.subtitle, description: t.landing.resetOverview.systems.description, icon: Heart, color: "reset-systems", symbolism: t.landing.resetOverview.systems.symbolism },
    { letter: "E", title: t.landing.resetOverview.execution.title, subtitle: t.landing.resetOverview.execution.subtitle, description: t.landing.resetOverview.execution.description, icon: Mountain, color: "reset-execution", symbolism: t.landing.resetOverview.execution.symbolism },
    { letter: "T", title: t.landing.resetOverview.transformation.title, subtitle: t.landing.resetOverview.transformation.subtitle, description: t.landing.resetOverview.transformation.description, icon: Flower, color: "reset-transformation", symbolism: t.landing.resetOverview.transformation.symbolism },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="zen-container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold gradient-text">RESET Blueprint®️</h1>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>{t.landing.about}</Button>
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}>{t.landing.testimonialsLink}</Button>
              <LanguageSwitcher />
              <Button variant="zen" size="sm" onClick={() => navigate('/dashboard')}>{t.auth.signIn}</Button>
              <Button variant="hero" size="sm" onClick={() => navigate('/dashboard')}>{t.auth.getStarted}<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in-up">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}>{t.landing.about}</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}>{t.landing.testimonialsLink}</Button>
              <div className="px-2 py-2"><LanguageSwitcher /></div>
              <Button variant="zen" className="w-full" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>{t.auth.signIn}</Button>
              <Button variant="hero" className="w-full" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>{t.auth.getStarted}<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          )}
        </div>
      </nav>

      <Hero />

      {/* RESET Overview */}
      <section id="about" className="py-24 bg-gradient-to-b from-muted via-background to-muted relative overflow-hidden">
        <div className="zen-container relative z-10">
          <div className="text-center mb-20 space-y-6 animate-fade-in-up">
            <h2 className="text-5xl md:text-7xl font-black">
              {t.landing.resetOverview.title.split('RESET')[0]}<span className="gradient-text neon-text">RESET</span>{t.landing.resetOverview.title.split('RESET')[1]}
            </h2>
            <p className="text-2xl text-foreground/80 font-bold max-w-2xl mx-auto">{t.landing.resetOverview.subtitle}<br/>{t.landing.resetOverview.subtitleDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {resetSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="group relative animate-bounce-in hover-lift" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-card to-card/50 border-3 hover:border-4 transition-all duration-300 shadow-medium hover:shadow-strong relative overflow-hidden" style={{ borderColor: `hsl(var(--${step.color}))`, boxShadow: `0 8px 32px hsl(var(--${step.color}) / 0.15)` }}>
                    <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 shadow-lg animate-scale-pulse" style={{ backgroundColor: `hsl(var(--${step.color}) / 0.2)`, boxShadow: `0 4px 20px hsl(var(--${step.color}) / 0.3)` }}>
                      <Icon className="w-10 h-10" style={{ color: `hsl(var(--${step.color}))` }} />
                    </div>
                    <div className="absolute top-6 right-6 w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl border-3 shadow-glow animate-scale-pulse" style={{ backgroundColor: `hsl(var(--${step.color}))`, borderColor: `hsl(var(--${step.color}))`, color: `hsl(var(--card))`, boxShadow: `0 0 20px hsl(var(--${step.color}) / 0.5)` }}>{step.letter}</div>
                    <h3 className="relative text-3xl font-black mb-2">{step.title}</h3>
                    <p className="relative text-base font-bold mb-4" style={{ color: `hsl(var(--${step.color}))` }}>{step.subtitle}</p>
                    <p className="relative text-foreground/70 font-medium mb-4 leading-relaxed">{step.description}</p>
                    <div className="relative pt-4 border-t-2" style={{ borderColor: `hsl(var(--${step.color}) / 0.3)` }}><p className="text-sm text-foreground/60 font-semibold">{step.symbolism}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="zen-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t.landing.features.title}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t.landing.features.subtitle}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="border-0 shadow-medium hover:shadow-strong transition-shadow"><CardContent className="pt-8 text-center space-y-4"><div className="w-16 h-16 mx-auto rounded-xl bg-reset-rhythm/10 flex items-center justify-center"><Video className="w-8 h-8 text-reset-rhythm" /></div><h3 className="text-xl font-bold">{t.landing.features.masterclasses.title}</h3><p className="text-muted-foreground">{t.landing.features.masterclasses.description}</p></CardContent></Card>
            <Card className="border-0 shadow-medium hover:shadow-strong transition-shadow"><CardContent className="pt-8 text-center space-y-4"><div className="w-16 h-16 mx-auto rounded-xl bg-reset-energy/10 flex items-center justify-center"><BookOpen className="w-8 h-8 text-reset-energy" /></div><h3 className="text-xl font-bold">{t.landing.features.ereader.title}</h3><p className="text-muted-foreground">{t.landing.features.ereader.description}</p></CardContent></Card>
            <Card className="border-0 shadow-medium hover:shadow-strong transition-shadow"><CardContent className="pt-8 text-center space-y-4"><div className="w-16 h-16 mx-auto rounded-xl bg-reset-systems/10 flex items-center justify-center"><Users className="w-8 h-8 text-reset-systems" /></div><h3 className="text-xl font-bold">{t.landing.features.community.title}</h3><p className="text-muted-foreground">{t.landing.features.community.description}</p></CardContent></Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-primary/5 via-reset-energy/5 to-reset-transformation/5">
        <div className="zen-container">
          <div className="text-center mb-16"><h2 className="text-4xl font-bold mb-4">{t.landing.testimonials.title}</h2><p className="text-xl text-muted-foreground">{t.landing.testimonials.subtitle}</p></div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="border-0 shadow-medium"><CardContent className="pt-8 space-y-4"><p className="text-muted-foreground italic">"{t.landing.testimonials.quote1}"</p><p className="font-semibold">- {t.landing.testimonials.author1}</p></CardContent></Card>
            <Card className="border-0 shadow-medium"><CardContent className="pt-8 space-y-4"><p className="text-muted-foreground italic">"{t.landing.testimonials.quote2}"</p><p className="font-semibold">- {t.landing.testimonials.author2}</p></CardContent></Card>
            <Card className="border-0 shadow-medium"><CardContent className="pt-8 space-y-4"><p className="text-muted-foreground italic">"{t.landing.testimonials.quote3}"</p><p className="font-semibold">- {t.landing.testimonials.author3}</p></CardContent></Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="zen-container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">{t.landing.cta.title}</h2>
            <p className="text-xl text-muted-foreground">{t.landing.cta.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="journey" size="lg" className="text-lg px-8" onClick={() => navigate('/dashboard')}>{t.landing.cta.button}<ArrowRight className="w-5 h-5 ml-2" /></Button>
              <Button variant="outline" size="lg" className="text-lg px-8">{t.landing.cta.downloadGuide}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="zen-container"><div className="text-center text-muted-foreground"><p className="mb-2">© 2025 {t.landing.footer.title}. {t.landing.footer.copyright}</p><p className="text-sm">{t.landing.footer.description}</p></div></div>
      </footer>
    </div>
  );
};

export default Index;