import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Plus } from 'lucide-react';
import { 
  NutritionLayout, 
  NutritionCalorieRing, 
  NutritionMacroCard,
  NutritionMealCard 
} from '@/components/nutrition';
import { useNutritionLogs, useNutritionStats } from '@/hooks/nutrition';

export default function NutritionDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { todayLogs, loading: logsLoading } = useNutritionLogs();
  const stats = useNutritionStats({ todayLogs, calorieGoal: 2000 });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <NutritionLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </NutritionLayout>
    );
  }

  return (
    <NutritionLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-cyan-400 uppercase tracking-widest glitch-text-subtle">
            Metabolic Status
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Calorie Ring */}
        <section className="flex justify-center animate-fade-in">
          <NutritionCalorieRing 
            consumed={stats.totalCalories} 
            goal={stats.calorieGoal}
            size={220}
          />
        </section>

        {/* Macro Cards */}
        <section className="grid grid-cols-3 gap-3 animate-fade-in animation-delay-100">
          <NutritionMacroCard
            label="Protein"
            current={stats.totalProtein}
            goal={stats.proteinGoal}
            color="protein"
          />
          <NutritionMacroCard
            label="Carbs"
            current={stats.totalCarbs}
            goal={stats.carbsGoal}
            color="carbs"
          />
          <NutritionMacroCard
            label="Fats"
            current={stats.totalFats}
            goal={stats.fatsGoal}
            color="fats"
          />
        </section>

        {/* Quick Add Button */}
        <section className="animate-fade-in animation-delay-200">
          <Link
            to="/nutrition/scanner"
            className="nutrition-card-glow flex items-center justify-center gap-3 p-4 hover:border-cyan-400/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-400/30 transition-colors">
              <Plus className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-cyan-400 font-medium uppercase tracking-wider">
              Log Ration
            </span>
          </Link>
        </section>

        {/* Recent Meals */}
        <section className="animate-fade-in animation-delay-300">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-zinc-400 text-xs uppercase tracking-widest">Today's Intel</h2>
            <Link 
              to="/nutrition/log" 
              className="text-cyan-400 text-xs uppercase tracking-wider hover:underline"
            >
              View All
            </Link>
          </div>

          {logsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="nutrition-card h-20 animate-pulse" />
              ))}
            </div>
          ) : todayLogs.length === 0 ? (
            <div className="nutrition-card p-8 text-center">
              <p className="text-zinc-500">No rations logged today</p>
              <Link 
                to="/nutrition/scanner"
                className="text-cyan-400 text-sm mt-2 inline-block hover:underline"
              >
                Start tracking
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayLogs.slice(0, 3).map((meal) => (
                <NutritionMealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </section>
      </main>
    </NutritionLayout>
  );
}
