import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar } from 'lucide-react';
import { format, startOfDay, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { NutritionLayout, NutritionMealCard } from '@/components/nutrition';
import { useNutritionLogs, MealLog } from '@/hooks/nutrition';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function NutritionLog() {
  const { logs, loading, deleteLog } = useNutritionLogs();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = format(new Date(log.created_at), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(log);
    return acc;
  }, {} as Record<string, MealLog[]>);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    const success = await deleteLog(deleteTarget);
    if (success) {
      toast.success('Ration deleted');
    } else {
      toast.error('Failed to delete ration');
    }
    setDeleteTarget(null);
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    if (isSameDay(date, today)) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    }
    
    return format(date, 'EEEE, MMM d');
  };

  const getDayTotals = (dayLogs: MealLog[]) => {
    return dayLogs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fats: acc.fats + log.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  return (
    <NutritionLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/nutrition" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-cyan-400 uppercase tracking-widest">
            Mission Log
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="px-4 py-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
                <div className="nutrition-card h-20 animate-pulse" />
                <div className="nutrition-card h-20 animate-pulse" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-400 mb-2">No Intel Recorded</h2>
            <p className="text-zinc-600 mb-4">Start tracking your nutrition</p>
            <Link 
              to="/nutrition/scanner"
              className="inline-block px-6 py-3 bg-cyan-500 text-black font-bold uppercase tracking-wider rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Log First Ration
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateKey) => {
              const dayLogs = groupedLogs[dateKey];
              const totals = getDayTotals(dayLogs);
              
              return (
                <section key={dateKey}>
                  {/* Date header */}
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-zinc-400 text-sm font-medium">
                      {formatDateHeader(dateKey)}
                    </h2>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-cyan-400">{totals.calories} cal</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-green-400">P:{totals.protein}g</span>
                      <span className="text-yellow-400">C:{totals.carbs}g</span>
                      <span className="text-rose-400">F:{totals.fats}g</span>
                    </div>
                  </div>

                  {/* Day's meals */}
                  <div className="space-y-3">
                    {dayLogs.map((meal) => (
                      <NutritionMealCard 
                        key={meal.id} 
                        meal={meal}
                        showDelete
                        onDelete={(id) => setDeleteTarget(id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Ration?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. The ration will be permanently removed from your log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NutritionLayout>
  );
}
