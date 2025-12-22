import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

interface InteractiveConfig {
  type: string;
  title?: string;
  description?: string;
  options?: string[];
  labels?: { left?: string; right?: string };
  prompt?: string;
  [key: string]: unknown;
}

interface InteractiveWrapperProps {
  config: InteractiveConfig;
  onComplete?: (response: unknown) => void;
}

const InteractiveWrapper = ({ config, onComplete }: InteractiveWrapperProps) => {
  const [response, setResponse] = useState<unknown>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete?.(response);
  };

  const renderInteractive = () => {
    switch (config.type) {
      case 'slider_assessment':
        return <SliderAssessment config={config} onChange={setResponse} />;
      case 'text_input':
        return <TextInputExercise config={config} onChange={setResponse} />;
      case 'checklist':
        return <ChecklistExercise config={config} onChange={setResponse} />;
      case 'self_diagnostic':
        return <SelfDiagnostic config={config} onChange={setResponse} />;
      default:
        return (
          <div className="text-center text-muted-foreground">
            Interactive exercise: {config.type}
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{config.title || 'Interactive Exercise'}</CardTitle>
        {config.description && (
          <p className="text-muted-foreground">{config.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {renderInteractive()}
        
        {!isCompleted ? (
          <Button onClick={handleComplete} className="w-full">
            Complete Exercise
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-accent">
            <CheckCircle className="w-5 h-5" />
            <span>Exercise Completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Sub-components for different exercise types

interface SliderAssessmentProps {
  config: InteractiveConfig;
  onChange: (value: number) => void;
}

const SliderAssessment = ({ config, onChange }: SliderAssessmentProps) => {
  const [value, setValue] = useState(50);

  const handleChange = (newValue: number[]) => {
    setValue(newValue[0]);
    onChange(newValue[0]);
  };

  return (
    <div className="space-y-4">
      <Slider
        value={[value]}
        onValueChange={handleChange}
        max={100}
        step={1}
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{config.labels?.left || 'Low'}</span>
        <span className="font-bold text-foreground">{value}%</span>
        <span>{config.labels?.right || 'High'}</span>
      </div>
    </div>
  );
};

interface TextInputExerciseProps {
  config: InteractiveConfig;
  onChange: (value: string) => void;
}

const TextInputExercise = ({ config, onChange }: TextInputExerciseProps) => {
  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{config.prompt}</p>
      <Textarea
        value={text}
        onChange={handleChange}
        placeholder="Write your response here..."
        rows={4}
      />
    </div>
  );
};

interface ChecklistExerciseProps {
  config: InteractiveConfig;
  onChange: (value: string[]) => void;
}

const ChecklistExercise = ({ config, onChange }: ChecklistExerciseProps) => {
  const [checked, setChecked] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    const newChecked = checked.includes(item)
      ? checked.filter(i => i !== item)
      : [...checked, item];
    setChecked(newChecked);
    onChange(newChecked);
  };

  return (
    <div className="space-y-2">
      {(config.options || []).map((option, index) => (
        <button
          key={index}
          onClick={() => toggleItem(option)}
          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
            checked.includes(option)
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              checked.includes(option)
                ? 'border-accent bg-accent'
                : 'border-muted-foreground'
            }`}>
              {checked.includes(option) && (
                <CheckCircle className="w-4 h-4 text-accent-foreground" />
              )}
            </div>
            <span>{option}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

interface SelfDiagnosticProps {
  config: InteractiveConfig;
  onChange: (value: Record<string, number>) => void;
}

const SelfDiagnostic = ({ config, onChange }: SelfDiagnosticProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRating = (item: string, rating: number) => {
    const newRatings = { ...ratings, [item]: rating };
    setRatings(newRatings);
    onChange(newRatings);
  };

  return (
    <div className="space-y-4">
      {(config.options || []).map((option, index) => (
        <div key={index} className="space-y-2">
          <p className="text-sm font-medium">{option}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => handleRating(option, rating)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  ratings[option] === rating
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InteractiveWrapper;
