import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { org_id, name, description, dna, filters } = await req.json();

    if (!org_id || !name) {
      return new Response(
        JSON.stringify({ error: "org_id and name required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let userId = null;
    if (token) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError) {
        console.error("Auth error:", authError);
      }
      userId = user?.id;
    }

    // Generate UUID manually
    const mandateId = crypto.randomUUID();

    console.log("Inserting mandate:", {
      id: mandateId,
      organization_id: org_id,
      name,
      created_by: userId,
      dna: dna || {},
    });

    // 1️⃣ Insert mandate with minimal fields - NO .select()
    const { data, error: mandateErr } = await supabase
      .from("users_mandates")
      .insert({
        id: mandateId,
        organization_id: org_id,
        name,
        description: description || null,
        dna: dna || {},
        created_by: userId,
      });
    // ❌ DO NOT ADD .select() here - this causes the relationship lookup

    if (mandateErr) {
      console.error(
        "Mandate error details:",
        JSON.stringify(mandateErr, null, 2)
      );
      throw new Error(`Mandate insert failed: ${mandateErr.message}`);
    }

    console.log("Mandate inserted successfully");

    // 2️⃣ Create mandate filters if provided
    // if (filters !== undefined) {
    //   const { error: filterErr } = await supabase
    //     .from("mandate_filters")
    //     .insert({
    //       mandate_id: mandateId,
    //       filters: filters ?? {},
    //     });

    //   if (filterErr) {
    //     console.error("Filter error:", filterErr);
    //     // Continue even if filters fail
    //   }
    // }

    return new Response(
      JSON.stringify({
        ok: true,
        mandate_id: mandateId,
        organization_id: org_id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Full error:", e);
    return new Response(
      JSON.stringify({
        error: e.message || String(e),
        details: e.details || e.hint || null,
        code: e.code || null,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
