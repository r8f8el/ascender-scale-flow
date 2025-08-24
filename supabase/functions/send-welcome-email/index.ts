import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Send welcome email function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { email, name, confirmationUrl }: WelcomeEmailRequest = await req.json();

    console.log('Sending welcome email to:', email);

    const emailResponse = await resend.emails.send({
      from: "Ascalate <onboarding@resend.dev>",
      to: [email],
      subject: "Confirme sua conta - Ascalate",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirme sua conta - Ascalate</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo à Ascalate!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${name}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Obrigado por se cadastrar na nossa plataforma. Para começar a usar todos os recursos disponíveis, 
              você precisa confirmar seu endereço de email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Confirmar Email
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
            </p>
            <p style="font-size: 12px; color: #888; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
              ${confirmationUrl}
            </p>
            
            <hr style="border: none; height: 1px; background: #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666;">
              <strong>Próximos passos após a confirmação:</strong>
            </p>
            <ul style="color: #666; font-size: 14px;">
              <li>Faça login na plataforma</li>
              <li>Complete seu perfil</li>
              <li>Explore todos os recursos disponíveis</li>
              <li>Entre em contato conosco se precisar de ajuda</li>
            </ul>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #1565c0;">
                <strong>💡 Dica:</strong> Verifique sua caixa de spam se não receber o email de confirmação.
              </p>
            </div>
            
            <p style="font-size: 12px; color: #888; margin-top: 30px;">
              Se você não criou uma conta conosco, pode ignorar este email com segurança.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 14px; color: #666; margin: 0;">
                <strong>Ascalate Consultoria</strong><br>
                Telefone: (11) 99999-9999<br>
                Email: <a href="mailto:contato@ascalate.com.br" style="color: #667eea;">contato@ascalate.com.br</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro ao enviar email de boas-vindas. Verifique os logs para mais detalhes.'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);