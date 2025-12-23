import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnalysisResult } from '@/hooks/nutrition';
import { CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NutritionReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AnalysisResult | null;
  onConfirm: (data: { meal_name: string; calories: number; protein: number; carbs: number; fats: number }) => void;
  isLogging?: boolean;
}

export default function NutritionReviewModal({
  open,
  onOpenChange,
  result,
  onConfirm,
  isLogging = false
}: NutritionReviewModalProps) {
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (result) {
      setMealName(result.meal_name);
      setCalories(result.calories);
      setProtein(result.macros.protein);
      setCarbs(result.macros.carbs);
      setFats(result.macros.fats);
      setIsEditing(false);
    }
  }, [result]);

  const handleConfirm = () => {
    onConfirm({
      meal_name: mealName,
      calories,
      protein,
      carbs,
      fats
    });
  };

  const confidenceColors = {
    high: 'text-green-400',
    medium: 'text-yellow-400',
    low: 'text-red-400'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-400 font-mono uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5" />
            Mission Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Confidence badge */}
          {result && (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className={cn("w-4 h-4", confidenceColors[result.confidence])} />
              <span className="text-zinc-400">AI Confidence:</span>
              <span className={cn("uppercase font-medium", confidenceColors[result.confidence])}>
                {result.confidence}
              </span>
            </div>
          )}

          {/* Meal name */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Target Identified</Label>
            {isEditing ? (
              <Input
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">{mealName}</span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-zinc-500 hover:text-cyan-400"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Calories */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Energy Content</Label>
            {isEditing ? (
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-cyan-400 tabular-nums">{calories}</span>
                <span className="text-zinc-500">calories</span>
              </div>
            )}
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            <div className="nutrition-card p-3 text-center">
              <span className="text-xs text-zinc-500 uppercase">Protein</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700 text-white text-center mt-1 h-8"
                />
              ) : (
                <p className="text-xl font-bold text-green-400 tabular-nums">{protein}g</p>
              )}
            </div>
            <div className="nutrition-card p-3 text-center">
              <span className="text-xs text-zinc-500 uppercase">Carbs</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700 text-white text-center mt-1 h-8"
                />
              ) : (
                <p className="text-xl font-bold text-yellow-400 tabular-nums">{carbs}g</p>
              )}
            </div>
            <div className="nutrition-card p-3 text-center">
              <span className="text-xs text-zinc-500 uppercase">Fats</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700 text-white text-center mt-1 h-8"
                />
              ) : (
                <p className="text-xl font-bold text-rose-400 tabular-nums">{fats}g</p>
              )}
            </div>
          </div>

          {/* Edit toggle */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2 text-sm text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              <Edit2 className="w-4 h-4 inline mr-2" />
              Override AI Analysis
            </button>
          )}

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={isLogging || !mealName}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider"
          >
            {isLogging ? 'Logging...' : '⬆ Log Ration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
