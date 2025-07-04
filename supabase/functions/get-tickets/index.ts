
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obter parâmetros da URL
    const url = new URL(req.url);
    const userEmail = url.searchParams.get('user_email');
    const isAdmin = url.searchParams.get('admin') === 'true';

    let query = supabase
      .from('tickets')
      .select(`
        *,
        ticket_categories(name),
        ticket_priorities(name, color),
        ticket_statuses(name, color, is_closed)
      `)
      .order('created_at', { ascending: false });

    // Se não for admin, filtrar apenas pelos tickets do usuário
    if (!isAdmin && userEmail) {
      query = query.eq('user_email', userEmail);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Erro ao buscar tickets:', error);
      throw error;
    }

    console.log(`Tickets encontrados: ${tickets?.length || 0}`);

    return new Response(
      JSON.stringify({
        success: true,
        tickets: tickets || [],
        count: tickets?.length || 0
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Erro ao buscar tickets:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
