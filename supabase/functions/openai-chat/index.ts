import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();

    // Create a system prompt with your business context
    const systemPrompt = {
      role: "system",
      content: `
You are Aria Agent — the intelligence layer of the Aria Cortex platform.

Your job is to help users understand and operate the Aria system using:
- Real Cortex data
- Real computations (Fit/Timing, SVI, Scoring)
- Real matches from the matching kernel
- Real database records (entity_scores, signals, interactions, outreach)
- Real organization/segment/entity/campaign context provided as ARIA_CONTEXT.

Your powers include:
1. Understanding natural questions and interpreting them using ARIA_CONTEXT.
2. Running internal computations:
   - Fit/Timing score
   - SVI score
   - Full scoring breakdown
   - Kernel matches
   - Weekly report generation
3. Explaining results clearly (rank, reason, factors).
4. Showing data from Cortex tables:
   - Matches
   - Signals timeline
   - Contacts & outreach
   - Entity scores + reasons
   - Aggregated signals
   - Weekly report metrics
5. Executing commands when the user intends an action:
   - Run Fit/Timing
   - Compute SVI
   - Get segment matches
   - Generate weekly report
   - Add top matches to outreach
   - Recompute scores

Guidelines:
- Always use ARIA_CONTEXT when answering.
- Do not hallucinate missing data. If something doesn’t exist, say so.
- Prefer real calculations/data over assumptions.
- Provide clear, structured, helpful answers.
- If the user asks something outside your scope, politely decline.
- Keep responses professional, fast, and accurate.

Your goal:  
Make Aria Cortex fully understandable and operable through natural language AND commands.

Current user context:
- User ID: ${context?.userId || "unknown"}
- Organization: ${context?.orgId || "unknown"}
- Time: ${new Date().toISOString()}
`,
    };

    // Prepend system message to the conversation
    const messagesWithSystem = [systemPrompt, ...messages];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",

        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
