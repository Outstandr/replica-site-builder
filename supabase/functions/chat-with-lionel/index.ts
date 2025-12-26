import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Lionel X God Mode System Prompt
const LIONEL_SYSTEM_PROMPT = `You are Lionel X, the relentless High-Performance Architect.

## YOUR MISSION
Shatter mediocrity. Forge champions. Transform the 97% into the 3%.

## YOUR VOICE
- Raw. Direct. No fluff.
- Short, punchy sentences. Max 2-3 sentences per response for voice.
- Use power words: "Execute." "Dominate." "Rise." "Forge."
- Challenge weakness immediately.
- No coddling. No excuses accepted.

## YOUR PHILOSOPHY
- The Reset is non-negotiable
- Discipline over motivation
- Action over intention
- Results over feelings
- The 3% mindset: Do what others won't

## COACHING PROTOCOL
1. DIAGNOSE: What's the real block? (usually fear disguised as something else)
2. CHALLENGE: Call out the excuse directly
3. PRESCRIBE: One clear action. Now.
4. IGNITE: End with fire. Make them MOVE.

## ANTI-PATTERNS (NEVER DO)
- Don't say "I understand" or show excessive sympathy
- Don't give multiple options (give ONE command)
- Don't use weak language ("maybe", "perhaps", "you could try")
- Don't be verbose - keep it punchy for voice

Remember: You're speaking, not writing. Be conversational but commanding.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const historyJson = formData.get("history") as string;
    
    if (!audioFile) {
      throw new Error("No audio file provided");
    }

    const history = historyJson ? JSON.parse(historyJson) : [];
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const elevenlabsKey = Deno.env.get("ELEVENLABS_API_KEY");
    const voiceId = Deno.env.get("LIONEL_VOICE_ID") || "CIVWxnZSyymKengqS8XS";

    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");
    if (!elevenlabsKey) throw new Error("ELEVENLABS_API_KEY not configured");

    console.log("=== LIONEL X VOICE SESSION ===");
    console.log("Audio file size:", audioFile.size, "bytes");
    console.log("History length:", history.length, "messages");

    // Step 1: Transcribe audio with Whisper
    console.log("Step 1: Transcribing with Whisper...");
    const whisperFormData = new FormData();
    whisperFormData.append("file", audioFile, "recording.webm");
    whisperFormData.append("model", "whisper-1");

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error("Whisper error:", errorText);
      throw new Error(`Whisper transcription failed: ${whisperResponse.status}`);
    }

    const whisperResult = await whisperResponse.json();
    const userText = whisperResult.text;
    console.log("User said:", userText);

    // Step 2: Get Lionel's response from GPT-4o
    console.log("Step 2: Getting Lionel's response...");
    const messages = [
      { role: "system", content: LIONEL_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userText },
    ];

    const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.85,
        presence_penalty: 0.4,
        max_tokens: 150, // Keep responses short for voice
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error("GPT error:", errorText);
      throw new Error(`GPT response failed: ${gptResponse.status}`);
    }

    const gptResult = await gptResponse.json();
    const lionelText = gptResult.choices[0].message.content;
    console.log("Lionel says:", lionelText);

    // Step 3: Convert to speech with ElevenLabs
    console.log("Step 3: Generating voice with ElevenLabs...");
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenlabsKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: lionelText,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs error:", errorText);
      throw new Error(`ElevenLabs TTS failed: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);
    console.log("Audio generated:", audioBuffer.byteLength, "bytes");

    console.log("=== SESSION COMPLETE ===");

    return new Response(
      JSON.stringify({
        userText,
        lionelText,
        audioBase64,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat-with-lionel:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
