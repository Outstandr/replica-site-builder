import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGoogleMapsKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApiKey() {
      try {
        const { data, error: fetchError } = await supabase.functions.invoke('get-maps-key');
        
        if (fetchError) throw fetchError;
        
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        setError('Failed to load map configuration');
      } finally {
        setLoading(false);
      }
    }

    fetchApiKey();
  }, []);

  return { apiKey, loading, error };
}
