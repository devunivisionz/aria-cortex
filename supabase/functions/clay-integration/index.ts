import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { sb } from "../_shared/common.ts";

// Clay API Configuration
const CLAY_API_KEY = Deno.env.get("CLAY_API_KEY")!;
const CLAY_TABLE_ID = "t_0t58htaPzJySmBRUWUx"; // Extracted from your table URL
const CLAY_WORKSPACE_ID = "843156";
const CLAY_WORKBOOK_ID = "wb_0t58hta6NcAtSFkPU8v";

interface ClayRecord {
  id: string;
  [key: string]: any;
}

interface ClayWebhookPayload {
  tableId: string;
  rowId: string;
  data: Record<string, any>;
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route: POST /clay-integration/webhook - Receive data from Clay
    if (path.includes("/webhook") && req.method === "POST") {
      const payload: ClayWebhookPayload = await req.json();
      
      // Store Clay data in Supabase
      const { data, error } = await sb
        .from("clay_data")
        .insert({
          table_id: payload.tableId,
          row_id: payload.rowId,
          data: payload.data,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Data received from Clay",
          data 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
    }

    // Route: POST /clay-integration/send - Send data to Clay via HTTP API
    if (path.includes("/send") && req.method === "POST") {
      const body = await req.json();
      
      // Clay doesn't have a public API for adding rows directly
      // This would typically use Clay's webhook endpoint for the table
      // You need to get the webhook URL from your Clay table settings
      
      const clayWebhookUrl = Deno.env.get("CLAY_WEBHOOK_URL");
      
      if (!clayWebhookUrl) {
        throw new Error("CLAY_WEBHOOK_URL not configured");
      }

      const response = await fetch(clayWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Data sent to Clay",
          result 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
    }

    // Route: GET /clay-integration/sync - Sync data from Supabase to Clay
    if (path.includes("/sync") && req.method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      
      // Get data from your Supabase table that needs to be synced
      const { data: companies, error } = await sb
        .from("companies")
        .select("*")
        .limit(limit);

      if (error) throw error;

      const clayWebhookUrl = Deno.env.get("CLAY_WEBHOOK_URL");
      
      if (!clayWebhookUrl) {
        throw new Error("CLAY_WEBHOOK_URL not configured");
      }

      // Send each company to Clay
      const results = [];
      for (const company of companies || []) {
        try {
          const response = await fetch(clayWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(company),
          });
          
          const result = await response.json();
          results.push({ company: company.id, success: true, result });
        } catch (err) {
          results.push({ company: company.id, success: false, error: String(err) });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${results.length} records to Clay`,
          results 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
    }

    // Route: POST /clay-integration/enrich - Enrich company data via Clay API
    if (path.includes("/enrich") && req.method === "POST") {
      const { domain } = await req.json();
      
      if (!domain) {
        return new Response(
          JSON.stringify({ error: "Domain is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "content-type": "application/json" },
          }
        );
      }

      try {
        // Call Clay's enrichment API
        const clayResponse = await fetch("https://api.clay.com/v1/enrichment", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${CLAY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: domain,
            enrichments: ["company_info", "contact_info"],
          }),
        });

        if (!clayResponse.ok) {
          const errorText = await clayResponse.text();
          throw new Error(`Clay API error: ${clayResponse.status} - ${errorText}`);
        }

        const enrichedData = await clayResponse.json();

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: enrichedData 
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "content-type": "application/json" },
          }
        );
      } catch (enrichError) {
        console.error("Enrichment error:", enrichError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to enrich company data",
            details: String(enrichError)
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "content-type": "application/json" },
          }
        );
      }
    }

    // Route: GET /clay-integration/status - Check integration status
    if (path.includes("/status") && req.method === "GET") {
      const hasApiKey = !!CLAY_API_KEY;
      const hasWebhookUrl = !!Deno.env.get("CLAY_WEBHOOK_URL");
      
      return new Response(
        JSON.stringify({
          success: true,
          status: {
            apiKeyConfigured: hasApiKey,
            webhookUrlConfigured: hasWebhookUrl,
            tableId: CLAY_TABLE_ID,
            workspaceId: CLAY_WORKSPACE_ID,
            workbookId: CLAY_WORKBOOK_ID,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
    }

    // Default response for unknown routes
    return new Response(
      JSON.stringify({ 
        error: "Not found",
        availableRoutes: [
          "POST /webhook - Receive data from Clay",
          "POST /send - Send data to Clay",
          "GET /sync - Sync Supabase data to Clay",
          "GET /status - Check integration status"
        ]
      }),
      {
        status: 404,
        headers: { ...corsHeaders, "content-type": "application/json" },
      }
    );

  } catch (e) {
    console.error("Clay integration error:", e);
    return new Response(
      JSON.stringify({ 
        error: String(e),
        message: "Clay integration failed" 
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
