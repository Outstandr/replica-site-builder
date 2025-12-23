import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { NutritionLayout } from '@/components/nutrition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function NutritionProtocol() {
  const { user } = useAuth();
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('daily_calorie_goal')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.daily_calorie_goal) {
        setCalorieGoal(data.daily_calorie_goal);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ daily_calorie_goal: calorieGoal })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Protocol updated');
    }
  };

  const presetGoals = [
    { label: 'Cut', calories: 1500, description: 'Aggressive deficit' },
    { label: 'Maintain', calories: 2000, description: 'Standard intake' },
    { label: 'Bulk', calories: 2500, description: 'Caloric surplus' },
    { label: 'Mass', calories: 3000, description: 'Maximum gains' },
  ];

  return (
    <NutritionLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/nutrition" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-cyan-400 uppercase tracking-widest">
            Protocol Settings
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* Daily Target Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm uppercase tracking-widest">Daily Energy Target</h2>
          </div>

          <div className="nutrition-card-glow p-6">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider mb-2 block">
              Calorie Goal
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
                className="bg-zinc-800 border-zinc-700 text-white text-2xl font-bold h-14 text-center"
                min={1000}
                max={10000}
                step={50}
              />
              <span className="text-zinc-500 text-lg">cal</span>
            </div>

            {/* Macro preview based on goal */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <span className="text-green-400 font-bold">{Math.round((calorieGoal * 0.30) / 4)}g</span>
                <p className="text-zinc-500 text-xs">Protein</p>
              </div>
              <div>
                <span className="text-yellow-400 font-bold">{Math.round((calorieGoal * 0.40) / 4)}g</span>
                <p className="text-zinc-500 text-xs">Carbs</p>
              </div>
              <div>
                <span className="text-rose-400 font-bold">{Math.round((calorieGoal * 0.30) / 9)}g</span>
                <p className="text-zinc-500 text-xs">Fats</p>
              </div>
            </div>
          </div>
        </section>

        {/* Preset Goals */}
        <section className="space-y-4">
          <h2 className="text-zinc-400 text-sm uppercase tracking-widest">Quick Protocols</h2>
          <div className="grid grid-cols-2 gap-3">
            {presetGoals.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setCalorieGoal(preset.calories)}
                className={`nutrition-card p-4 text-left transition-all ${
                  calorieGoal === preset.calories 
                    ? 'border-cyan-400/50 shadow-[0_0_15px_hsl(186,100%,50%/0.2)]' 
                    : 'hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">{preset.label}</span>
                  {calorieGoal === preset.calories && (
                    <Check className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-cyan-400 font-bold">{preset.calories} cal</p>
                <p className="text-zinc-500 text-xs mt-1">{preset.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Protocol
            </>
          )}
        </Button>

        {/* Info Card */}
        <div className="nutrition-card p-4 text-center">
          <p className="text-zinc-500 text-sm">
            Macro split: 30% Protein • 40% Carbs • 30% Fats
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Based on standard athletic performance guidelines
          </p>
        </div>
      </main>
    </NutritionLayout>
  );
}
