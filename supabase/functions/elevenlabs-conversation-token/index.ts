import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ELEVENLABS_AGENT_ID) {
      console.error("ELEVENLABS_AGENT_ID not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs Agent ID not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    let userBriefing = null;

    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Decode the JWT to get user ID
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (user && !userError) {
          console.log("Fetching user briefing for:", user.id);
          
          // Fetch the unified user briefing in ONE database call
          const { data: briefing, error: briefingError } = await supabase.rpc(
            "get_user_full_briefing",
            { p_user_id: user.id }
          );

          if (briefingError) {
            console.error("Error fetching briefing:", briefingError);
          } else {
            userBriefing = briefing;
            console.log("User briefing fetched successfully");
          }
        } else {
          console.log("No authenticated user found or error:", userError);
        }
      } catch (authError) {
        console.error("Error processing auth:", authError);
      }
    }

    console.log("Requesting conversation token for agent:", ELEVENLABS_AGENT_ID);

    // Build the request body with dynamic variables if we have user data
    const requestBody: Record<string, unknown> = {};
    
    if (userBriefing) {
      // Format the user data as a comprehensive context string
      const profile = userBriefing.profile || {};
      const todayNutrition = userBriefing.today_nutrition || {};
      const todaySteps = userBriefing.today_steps || {};
      const streak = userBriefing.streak || {};
      const recentWorkouts = userBriefing.recent_workouts || [];
      const recentJournal = userBriefing.recent_journal || [];

      const contextString = `
[LIVE USER DATA STREAMS - ${new Date().toISOString()}]

PROFILE:
- Name: ${profile.name || "User"}
- Mission: ${profile.mission || "Not set"}
- Resistance: ${profile.resistance || "Not set"}
- Daily Step Goal: ${profile.daily_step_goal || 10000}
- Daily Calorie Goal: ${profile.daily_calorie_goal || 2000}
- Weight: ${profile.weight_kg ? `${profile.weight_kg}kg` : "Not set"}

TODAY'S ACTIVITY:
- Steps: ${todaySteps.steps || 0} / ${todaySteps.goal || 10000} (${Math.round(((todaySteps.steps || 0) / (todaySteps.goal || 10000)) * 100)}% complete)
- Active Minutes: ${todaySteps.active_minutes || 0}
- Calories Burned: ${todaySteps.calories_burned || 0}

TODAY'S NUTRITION:
- Calories: ${todayNutrition.total_calories || 0} / ${profile.daily_calorie_goal || 2000}
- Protein: ${todayNutrition.total_protein || 0}g
- Carbs: ${todayNutrition.total_carbs || 0}g
- Fats: ${todayNutrition.total_fats || 0}g
- Meals Logged: ${todayNutrition.meals_logged || 0}

STREAK STATUS:
- Current Streak: ${streak.current_streak || 0} days
- Longest Streak: ${streak.longest_streak || 0} days
- Total Days Completed: ${streak.total_days_completed || 0}

RECENT WORKOUTS (Last 3):
${recentWorkouts.length > 0 
  ? recentWorkouts.map((w: Record<string, unknown>, i: number) => 
      `${i + 1}. ${new Date(w.date as string).toLocaleDateString()} - ${w.duration_minutes || 0} min, ${w.steps || 0} steps, ${w.distance_km || 0}km`
    ).join("\n")
  : "No recent workouts logged"}

RECENT JOURNAL ENTRIES:
${recentJournal.length > 0
  ? recentJournal.map((j: Record<string, unknown>, i: number) => 
      `${i + 1}. ${new Date(j.date as string).toLocaleDateString()} - Mood: ${j.mood || "N/A"} - ${j.reflection || "No content"}`
    ).join("\n")
  : "No recent journal entries"}

Use this data to provide proactive, contextual coaching. Reference their recent activity naturally. If they haven't logged activity today, encourage them. If they're on a streak, celebrate it.
      `.trim();

      requestBody.conversation_config_override = {
        agent: {
          prompt: {
            prompt: contextString
          }
        }
      };
      
      console.log("Injecting user context into conversation");
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get conversation token from ElevenLabs" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Successfully obtained signed URL with user context");

    return new Response(
      JSON.stringify({ signed_url: data.signed_url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating conversation token:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
