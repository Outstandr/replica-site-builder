import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalysisResult {
  meal_name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  confidence: 'high' | 'medium' | 'low';
}

export function useNutritionAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (imageBase64: string): Promise<AnalysisResult | null> => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64 }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to analyze image');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const analysisResult: AnalysisResult = {
        meal_name: data.meal_name || 'Unknown Food',
        calories: data.calories || 0,
        macros: {
          protein: data.macros?.protein || 0,
          carbs: data.macros?.carbs || 0,
          fats: data.macros?.fats || 0
        },
        confidence: data.confidence || 'medium'
      };

      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      console.error('Food analysis error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const analyzeText = useCallback(async (textQuery: string): Promise<AnalysisResult | null> => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-food', {
        body: { textQuery }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to analyze food');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const analysisResult: AnalysisResult = {
        meal_name: data.meal_name || textQuery,
        calories: data.calories || 0,
        macros: {
          protein: data.macros?.protein || 0,
          carbs: data.macros?.carbs || 0,
          fats: data.macros?.fats || 0
        },
        confidence: data.confidence || 'medium'
      };

      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      console.error('Food analysis error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setAnalyzing(false);
  }, []);

  return {
    analyzing,
    result,
    error,
    analyzeImage,
    analyzeText,
    reset
  };
}
