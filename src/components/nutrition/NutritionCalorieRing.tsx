import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface NutritionCalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

export default function NutritionCalorieRing({ 
  consumed, 
  goal,
  size = 200 
}: NutritionCalorieRingProps) {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const isOver = consumed > goal;

  const data = useMemo(() => [
    { name: 'Consumed', value: Math.min(consumed, goal), color: 'hsl(186, 100%, 50%)' },
    { name: 'Remaining', value: remaining, color: 'hsl(0, 0%, 15%)' }
  ], [consumed, goal, remaining]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  filter: index === 0 ? 'drop-shadow(0 0 10px hsl(186 100% 50% / 0.5))' : 'none'
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold tabular-nums ${isOver ? 'text-red-400' : 'text-cyan-400'}`}>
          {consumed.toLocaleString()}
        </span>
        <span className="text-zinc-500 text-sm uppercase tracking-wider">
          / {goal.toLocaleString()} cal
        </span>
        <div className="mt-2 flex items-center gap-1">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isOver ? 'hsl(0, 70%, 50%)' : 'hsl(186, 100%, 50%)' }}
          />
          <span className={`text-xs ${isOver ? 'text-red-400' : 'text-cyan-400'}`}>
            {isOver ? `+${consumed - goal} over` : `${remaining} remaining`}
          </span>
        </div>
      </div>

      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(186 100% 50% / ${percentage / 100 * 0.3}) 0%, transparent 70%)`
        }}
      />
    </div>
  );
}
