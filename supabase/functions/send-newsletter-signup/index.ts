
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterSignupRequest {
  nome: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, email }: NewsletterSignupRequest = await req.json();

    // Enviar email de confirmação para o usuário
    const userEmailResponse = await resend.emails.send({
      from: "Ascalate <onboarding@resend.dev>",
      to: [email],
      subject: "Bem-vindo à nossa lista de atualizações!",
      html: `
        <h2>Olá ${nome}!</h2>
        <p>Obrigado por se cadastrar em nossa lista de atualizações.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>O que você pode esperar:</h3>
          <ul>
            <li>📊 Insights exclusivos sobre FP&A</li>
            <li>🎯 Convites para eventos especiais</li>
            <li>📚 Materiais gratuitos e templates</li>
            <li>🤝 Oportunidades de networking</li>
          </ul>
        </div>
        
        <p>Fique atento ao seu email para não perder nenhuma novidade!</p>
        
        <p>Atenciosamente,<br>
        Equipe Ascalate</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          Se você não se cadastrou para receber esses emails, pode ignorar esta mensagem.
        </p>
      `,
    });

    // Enviar notificação para a empresa
    const adminEmailResponse = await resend.emails.send({
      from: "Ascalate <onboarding@resend.dev>",
      to: ["rafael.gontijo@ascalate.com.br"],
      subject: "Novo Cadastro - Lista de Email",
      html: `
        <h2>Novo Cadastro na Lista de Email</h2>
        <p>Uma nova pessoa se cadastrou para receber atualizações:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dados do Cadastro:</h3>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>
        
        <p>Data do cadastro: ${new Date().toLocaleString('pt-BR')}</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          Esta mensagem foi enviada automaticamente através do formulário de cadastro do site Ascalate.
        </p>
      `,
    });

    console.log("Emails sent successfully:", { userEmailResponse, adminEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-newsletter-signup function:", error);
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
