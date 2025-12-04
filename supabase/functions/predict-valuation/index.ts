/**
 * Supabase Edge Function that connects to your Python ML model
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// YOUR ML API URL
// For local testing: Use ngrok or your local IP
// For production: Deploy Flask API to Railway/Render/Heroku
const ML_API_URL =
  Deno.env.get("ML_API_URL") || "https://web-production-5f098.up.railway.app";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request
    const requestData = await req.json();

    // Two modes:
    // 1. Direct prediction (sector, geography, revenue provided)
    // 2. Entity-based (entity_id provided)

    let sector, geography, revenue;
    let entity_id = requestData.entity_id;

    if (
      requestData.sector &&
      requestData.geography &&
      requestData.revenue !== undefined
    ) {
      // Direct mode
      sector = requestData.sector;
      geography = requestData.geography;
      revenue = requestData.revenue;
    } else if (entity_id) {
      // Entity mode - fetch from database
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: entity, error: entityError } = await supabaseClient
        .from("companies")
        .select("*")
        .eq("id", entity_id)
        .single();

      if (entityError) {
        throw new Error(`Entity not found: ${entityError.message}`);
      }

      // Map entity fields to ML model inputs
      sector = entity.industry || entity.sector || "Other";
      geography = entity.country || entity.geography || "Global";
      revenue = entity.revenue || entity.revenue_millions || 0;

      console.log("Entity data:", { sector, geography, revenue });
    } else {
      throw new Error("Either provide entity_id OR sector/geography/revenue");
    }

    // Call your Python ML API
    console.log("Calling ML API at:", `${ML_API_URL}/predict`);

    const mlResponse = await fetch(`${ML_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sector,
        geography,
        revenue,
      }),
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      throw new Error(`ML API error: ${errorText}`);
    }

    const mlData = await mlResponse.json();

    // If entity_id provided, save to database
    if (entity_id && mlData.success) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Save prediction
      const { data: saved, error: saveError } = await supabaseClient
        .from("valuation_predictions")
        .insert({
          entity_id,
          revenue_multiple_expected: mlData.predictions.revenue_multiple,
          revenue_multiple_p25: mlData.predictions.multiple_range.low,
          revenue_multiple_p75: mlData.predictions.multiple_range.high,
          enterprise_value_low: mlData.predictions.ev_range.low * 1_000_000,
          enterprise_value_high: mlData.predictions.ev_range.high * 1_000_000,
          confidence_score: mlData.predictions.confidence,
          model_version: "flask-ml-v1.0",
          key_drivers: mlData.key_drivers,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error("Failed to save prediction:", saveError);
      } else {
        console.log("Prediction saved:", saved.id);
      }

      // Return saved prediction
      return new Response(
        JSON.stringify({
          success: true,
          prediction: saved,
          ml_response: mlData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Return ML response directly
    return new Response(JSON.stringify(mlData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
