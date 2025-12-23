import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallBanner = () => {
  const { isInstallable, isInstalled, isDismissed, isIOS, install, dismiss } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner after a short delay if installable and not dismissed
    if (isInstallable && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isDismissed]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    dismiss();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-50 safe-area-mb"
      >
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">R</span>
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-semibold text-foreground text-base">
                Install RESET
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isIOS
                  ? 'Add to your home screen for the best experience'
                  : 'Install for quick access and offline use'}
              </p>

              {isIOS ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Share className="w-4 h-4" />
                    Tap Share
                  </span>
                  <span>→</span>
                  <span className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add to Home Screen
                  </span>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    Maybe Later
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
