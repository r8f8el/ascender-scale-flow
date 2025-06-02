
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ParticipantDataRequest {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, email, telefone, empresa, cargo }: ParticipantDataRequest = await req.json();

    // Enviar email para rafael.gontijo@ascalate.com.br com os dados do participante
    const adminEmailResponse = await resend.emails.send({
      from: "Ascalate <onboarding@resend.dev>",
      to: ["rafael.gontijo@ascalate.com.br"],
      subject: "Novos Dados de Participante - Arquivos Solicitados",
      html: `
        <h2>Novos Dados de Participante</h2>
        <p>Um participante preencheu seus dados para receber os arquivos:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dados do Participante:</h3>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${telefone}</p>
          <p><strong>Empresa:</strong> ${empresa}</p>
          <p><strong>Cargo:</strong> ${cargo}</p>
        </div>
        
        <p>Data do envio: ${new Date().toLocaleString('pt-BR')}</p>
        
        <p><strong>Ação necessária:</strong> Envie os arquivos para o email ${email}</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          Esta mensagem foi enviada automaticamente através do formulário de dados do participante no site Ascalate.
        </p>
      `,
    });

    // Enviar email de confirmação para o participante
    const participantEmailResponse = await resend.emails.send({
      from: "Ascalate <onboarding@resend.dev>",
      to: [email],
      subject: "Dados recebidos - Arquivos serão enviados em breve",
      html: `
        <h2>Olá ${nome}!</h2>
        <p>Recebemos seus dados com sucesso.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dados confirmados:</h3>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Empresa:</strong> ${empresa}</p>
          <p><strong>Cargo:</strong> ${cargo}</p>
        </div>
        
        <p>Os arquivos serão enviados para este email em breve.</p>
        
        <p>Atenciosamente,<br>
        Equipe Ascalate</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          Se você não solicitou esses arquivos, pode ignorar esta mensagem.
        </p>
      `,
    });

    console.log("Emails sent successfully:", { adminEmailResponse, participantEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-participant-data function:", error);
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
