import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateOrganizationId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `org_${timestamp}${randomPart}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Received body:", JSON.stringify(body));

    const email = body.email;
    const password = body.password;
    const fullName = body.fullName;
    const phone = body.phone;
    const organizationName = body.organizationName;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create organization object
    let organization = null;
    if (organizationName && organizationName.trim() !== "") {
      organization = {
        organizationId: generateOrganizationId(),
        organizationName: organizationName.trim(),
      };
    }
    console.log("Organization object:", JSON.stringify(organization));

    // Prepare user metadata
    const userMetadata = {
      name: fullName && fullName.trim() !== "" ? fullName.trim() : "Guest User",
      phone: phone || null,
      role: "user",
      status: "active",
      organization: organization,
    };

    // Create user in auth.users
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: false,
        user_metadata: userMetadata,
      });

    if (authError) {
      console.error("Auth error:", JSON.stringify(authError));
      throw authError;
    }
    console.log("User created:", authData.user.id);

    // Create company record FIRST
    let companyRecord = null;
    let companyError = null;
    if (organization) {
      const { data: companyData, error: compErr } = await supabaseAdmin
        .from("companies")
        .insert({
          id: organization.organizationId,
          name: organization.organizationName,
          created_by: authData.user.id,
        })
        .select()
        .single();

      companyError = compErr;
      if (compErr) {
        console.error("Company creation error:", JSON.stringify(compErr));
      } else {
        companyRecord = companyData;
        console.log("Company created:", JSON.stringify(companyData));
      }
    }

    // UPSERT profile record (insert or update if exists)
    const profileData = {
      id: authData.user.id,
      email: authData.user.email,
      full_name: userMetadata.name,
      phone: userMetadata.phone,
      role: userMetadata.role,
      status: userMetadata.status,
      company_id: companyRecord ? organization?.organizationId : null,
      company_name: organization?.organizationName || null,
      organization_id: organization?.organizationId || null,
      organization_name: organization?.organizationName || null,
      updated_at: new Date().toISOString(),
    };

    console.log("Profile data to upsert:", JSON.stringify(profileData));

    // Use upsert instead of insert
    const { data: profileResult, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(profileData, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile upsert error:", JSON.stringify(profileError));
    } else {
      console.log("Profile upserted:", JSON.stringify(profileResult));
    }

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: userMetadata.name,
          phone: userMetadata.phone,
          role: userMetadata.role,
          status: userMetadata.status,
          organization: organization,
        },
        profile: profileResult || null,
        company: companyRecord || null,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during registration",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
