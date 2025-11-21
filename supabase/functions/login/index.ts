// supabase/functions/login/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";

interface LoginRequest {
  email: string;
  password: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email, password }: LoginRequest = await req.json();

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: "Email and password are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Sign in the user
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    if (error) {
      console.error("Login error:", error);

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        return new Response(
          JSON.stringify({
            error: "Invalid email or password",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      //   if (error.message.includes("Email not confirmed")) {
      //     return new Response(
      //       JSON.stringify({
      //         error: "Please verify your email before signing in",
      //       }),
      //       {
      //         status: 403,
      //         headers: { ...corsHeaders, "Content-Type": "application/json" },
      //       }
      //     );
      //   }

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Ensure we have valid session data
    if (!data.session) {
      return new Response(
        JSON.stringify({
          error: "Failed to create session",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare response with auth.users data only
    const response = {
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
        phone: data.user.phone,
        phone_confirmed_at: data.user.phone_confirmed_at,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
        last_sign_in_at: data.user.last_sign_in_at,
        app_metadata: data.user.app_metadata,
        user_metadata: data.user.user_metadata,
        role: data.user.role,
        aud: data.user.aud,
        confirmation_sent_at: data.user.confirmation_sent_at,
        confirmed_at: data.user.confirmed_at,
        // Include name from user_metadata if available
        full_name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          null,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type,
        user: data.session.user,
      },
      message: "Login successful",
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
