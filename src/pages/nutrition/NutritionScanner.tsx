import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Keyboard, ImageIcon } from 'lucide-react';
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
import { useNutritionAnalyzer, useNutritionLogs, AnalysisResult } from '@/hooks/nutrition';

export default function NutritionScanner() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textQuery, setTextQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const { analyzing, result, error, analyzeImage, analyzeText, reset } = useNutritionAnalyzer();
  const { createLog } = useNutritionLogs();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      
      const analysisResult = await analyzeImage(base64);
      if (analysisResult) {
        setShowReviewModal(true);
      }
    };
    reader.readAsDataURL(file);
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

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

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

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Capture button */}
            <Button
              onClick={handleCaptureClick}
              disabled={analyzing}
              className="w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider text-lg"
            >
              {analyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Target
                </>
              )}
            </Button>

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
