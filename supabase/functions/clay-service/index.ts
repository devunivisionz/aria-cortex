import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    // Parse incoming Clay data
    const clayData = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Transform Clay columns to match your schema
    const transformedData = {
      legal_name: clayData.name || clayData.legal_name,
      display_name: clayData.name || clayData.display_name,
      industry: clayData.industry || clayData.primary_industry,
      country: clayData.country,
      city: clayData.city || clayData.location,
      website: clayData.website,
      employee_count: parseEmployeeCount(
        clayData.size || clayData.employee_count
      ),
      description: clayData.description,
      linkedin_url: clayData.linkedin_url,
      last_synced_at: new Date().toISOString(),
    };

    // Remove null/undefined fields
    Object.keys(transformedData).forEach(
      (key) => transformedData[key] === undefined && delete transformedData[key]
    );

    // Insert into Supabase table with upsert
    const { data, error } = await supabaseClient
      .from("companies")
      .upsert(transformedData, {
        onConflict: "legal_name,country",
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error processing Clay data:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

// Helper function to parse employee count
function parseEmployeeCount(sizeString: string | undefined): number | null {
  if (!sizeString) return null;

  const match = sizeString.replace(/,/g, "").match(/\d+/);
  return match ? parseInt(match[0]) : null;
}
