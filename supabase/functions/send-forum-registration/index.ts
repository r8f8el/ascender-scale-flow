
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ForumRegistrationRequest {
  nome: string;
  cargo: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, cargo, email }: ForumRegistrationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Ascalate <onboarding@resend.dev>",
      to: ["rafael.gontijo@ascalate.com.br"],
      subject: "Nova Inscrição - Fórum FPA Brasil",
      html: `
        <h2>Nova Inscrição para o Fórum FPA Brasil</h2>
        <p>Uma nova inscrição foi recebida através do site:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dados do Inscrito:</h3>
          <p><strong>Nome Completo:</strong> ${nome}</p>
          <p><strong>Cargo na Empresa:</strong> ${cargo}</p>
          <p><strong>Email Corporativo:</strong> ${email}</p>
        </div>
        
        <p>Data da inscrição: ${new Date().toLocaleString('pt-BR')}</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          Esta mensagem foi enviada automaticamente através do formulário de inscrição do site Ascalate.
        </p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-forum-registration function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
