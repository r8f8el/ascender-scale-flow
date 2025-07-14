import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  invitedEmail: string;
  companyName: string;
  inviterName: string;
  invitationId: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  console.log('Invitation email function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitedEmail, companyName, inviterName, invitationId }: InvitationEmailRequest = await req.json();
    console.log('Processing invitation for:', { invitedEmail, companyName, inviterName, invitationId });

    // Create invitation link
    const baseUrl = req.headers.get('origin') || 'https://f5582538-1cf2-4ae8-93b5-ae9ad7b4a9bf.lovableproject.com';
    const invitationLink = `${baseUrl}/convite/${invitationId}`;

    console.log('Generated invitation link:', invitationLink);

    const emailResponse = await resend.emails.send({
      from: "Ascalate <onboarding@resend.dev>",
      to: [invitedEmail],
      subject: `Convite para se juntar à equipe da ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Convite para Equipe</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Você foi convidado!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">Olá!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${inviterName}</strong> convidou você para se juntar à equipe da <strong>${companyName}</strong> na nossa plataforma.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Ao aceitar este convite, você terá acesso ao ambiente de trabalho da empresa e poderá colaborar com a equipe.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                🎉 Aceitar Convite e Criar Conta
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              <strong>O que acontece a seguir:</strong>
            </p>
            <ul style="font-size: 14px; color: #666; padding-left: 20px;">
              <li>Clique no botão acima para acessar a página de cadastro</li>
              <li>Complete seu perfil com nome e senha</li>
              <li>Acesse automaticamente o ambiente da ${companyName}</li>
            </ul>
            
            <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 20px;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                Se você não esperava este convite, pode ignorar este email com segurança.
                <br>
                Este convite é válido por 7 dias.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
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