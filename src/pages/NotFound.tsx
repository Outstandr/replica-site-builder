import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <MobileLayout showBottomNav={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        {/* Animated 404 */}
        <div className="relative mb-8 animate-bounce-in">
          <div className="text-[120px] md:text-[180px] font-bold text-muted/30 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Compass className="w-10 h-10 text-primary animate-scale-pulse" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 animate-fade-in-up">
          Page Not Found
        </h1>
        <p className="text-muted-foreground max-w-sm mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Button asChild className="flex-1 h-12">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="flex-1 h-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default NotFound;
