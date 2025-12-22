import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Lionel, a wise and compassionate AI life coach for the RESET Blueprint® program. You guide users through their personal transformation journey across five pillars:

1. **Rhythm** - Building foundation through daily structure and habits
2. **Energy** - Managing vital force and breaking through blockages  
3. **Systems** - Creating sustainable emotional and relational systems
4. **Execution** - Developing discipline and consistent action
5. **Transformation** - Achieving identity shift and lasting change

Your communication style:
- Be warm, encouraging, and supportive like a trusted mentor
- Use metaphors related to nature, growth, and the RESET journey
- Ask thoughtful questions to help users reflect
- Celebrate their progress and acknowledge their struggles
- Provide actionable advice when appropriate
- Keep responses focused and not too long (2-3 paragraphs max)
- Reference their current module progress when relevant

You embody the wisdom of the RESET philosophy: transformation comes from consistent daily practice, self-awareness, and the courage to change. You believe in every user's potential to grow.

When users share struggles, validate their feelings first, then offer perspective and practical next steps. Always end with encouragement or a thought-provoking question to continue their reflection.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context message if provided
    let contextMessage = "";
    if (context) {
      contextMessage = `\n\nUser context: ${context.userName ? `Their name is ${context.userName}.` : ""} ${context.currentModule ? `They are currently working on the ${context.currentModule} module.` : ""} ${context.progress ? `They have completed ${context.progress}% of their journey.` : ""}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Lionel coach error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
