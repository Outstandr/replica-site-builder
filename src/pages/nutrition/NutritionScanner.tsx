import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Keyboard, ImageIcon, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  NutritionLayout,
  NutritionScannerHUD,
  NutritionRadarScan,
  NutritionReviewModal
} from '@/components/nutrition';
import { useNutritionAnalyzer, useNutritionLogs } from '@/hooks/nutrition';
import { CalorieCameraService } from '@/services/CalorieCameraService';

export default function NutritionScanner() {
  const navigate = useNavigate();
  const [textQuery, setTextQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const { analyzing, result, error, analyzeImage, analyzeText, reset } = useNutritionAnalyzer();
  const { createLog } = useNutritionLogs();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      CalorieCameraService.dispose();
    };
  }, []);

  // Handle native camera capture using crash-proof service
  const handleCameraCapture = useCallback(async () => {
    setIsCapturing(true);
    try {
      const captureResult = await CalorieCameraService.openScanner();
      if (captureResult) {
        // Add data URL prefix for preview display
        const base64WithPrefix = `data:image/${captureResult.format};base64,${captureResult.base64}`;
        setPreviewImage(base64WithPrefix);
        
        const analysisResult = await analyzeImage(captureResult.base64);
        if (analysisResult) {
          setShowReviewModal(true);
        }
      }
    } finally {
      setIsCapturing(false);
    }
  }, [analyzeImage]);

  // Handle gallery pick using crash-proof service
  const handleGalleryPick = useCallback(async () => {
    setIsCapturing(true);
    try {
      const captureResult = await CalorieCameraService.openGallery();
      if (captureResult) {
        const base64WithPrefix = `data:image/${captureResult.format};base64,${captureResult.base64}`;
        setPreviewImage(base64WithPrefix);
        
        const analysisResult = await analyzeImage(captureResult.base64);
        if (analysisResult) {
          setShowReviewModal(true);
        }
      }
    } finally {
      setIsCapturing(false);
    }
  }, [analyzeImage]);

  const handleTextSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textQuery.trim()) return;

    const analysisResult = await analyzeText(textQuery);
    if (analysisResult) {
      setShowReviewModal(true);
    }
  }, [textQuery, analyzeText]);

  const handleConfirmLog = useCallback(async (data: { 
    meal_name: string; 
    calories: number; 
    protein: number; 
    carbs: number; 
    fats: number 
  }) => {
    setIsLogging(true);
    
    const log = await createLog({
      meal_name: data.meal_name,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats
    });

    setIsLogging(false);

    if (log) {
      toast.success('Ration logged successfully');
      setShowReviewModal(false);
      reset();
      setPreviewImage(null);
      setTextQuery('');
      navigate('/nutrition');
    } else {
      toast.error('Failed to log ration');
    }
  }, [createLog, navigate, reset]);

  return (
    <NutritionLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => navigate('/nutrition')} 
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-cyan-400 uppercase tracking-widest">
            Target Acquisition
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="px-4 py-6">
        <Tabs defaultValue="camera" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-zinc-900 border border-zinc-800">
            <TabsTrigger 
              value="camera" 
              className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-400"
            >
              <Camera className="w-4 h-4 mr-2" />
              Visual Scan
            </TabsTrigger>
            <TabsTrigger 
              value="text"
              className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-400"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Manual Intel
            </TabsTrigger>
          </TabsList>

          {/* Camera Tab */}
          <TabsContent value="camera" className="space-y-6">
            <NutritionScannerHUD>
              {analyzing ? (
                <NutritionRadarScan className="w-full h-full" />
              ) : previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Food preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-sm">No target acquired</span>
                </div>
              )}
            </NutritionScannerHUD>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Camera button */}
              <Button
                onClick={handleCameraCapture}
                disabled={analyzing || isCapturing}
                className="flex-1 h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider"
              >
                {analyzing || isCapturing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    {analyzing ? 'Scanning...' : 'Capturing...'}
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Camera
                  </>
                )}
              </Button>

              {/* Gallery button */}
              <Button
                onClick={handleGalleryPick}
                disabled={analyzing || isCapturing}
                variant="outline"
                className="h-14 px-6 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              >
                <Image className="w-5 h-5" />
              </Button>
            </div>

            {error && (
              <div className="nutrition-card p-4 border-red-500/50 text-center">
                <p className="text-red-400 text-sm">{error}</p>
                <button 
                  onClick={reset}
                  className="text-cyan-400 text-sm mt-2 hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="space-y-6">
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="nutrition-card p-4">
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
                  Describe Target
                </label>
                <Input
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder="e.g. Grilled chicken breast with rice and vegetables"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                />
                <p className="text-zinc-500 text-xs mt-2">
                  Include portion sizes for better accuracy
                </p>
              </div>

              {analyzing ? (
                <div className="nutrition-card aspect-square max-w-xs mx-auto">
                  <NutritionRadarScan className="w-full h-full" />
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={analyzing || !textQuery.trim()}
                className="w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider text-lg disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Intel'
                )}
              </Button>

              {error && (
                <div className="nutrition-card p-4 border-red-500/50 text-center">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </main>

      {/* Review Modal */}
      <NutritionReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        result={result}
        onConfirm={handleConfirmLog}
        isLogging={isLogging}
      />
    </NutritionLayout>
  );
}
