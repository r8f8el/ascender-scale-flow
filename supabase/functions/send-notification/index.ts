
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'ticket_created' | 'team_invitation';
  data: {
    ticketNumber?: string;
    title?: string;
    userName?: string;
    userEmail?: string;
    priority?: string;
    description?: string;
    // For team invitations
    invitedEmail?: string;
    inviterName?: string;
    companyName?: string;
    inviteUrl?: string;
    message?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Notification function called');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: NotificationRequest = await req.json();
    console.log('Received notification request:', requestBody);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (requestBody.type === 'ticket_created') {
      return await handleTicketNotification(requestBody.data);
    } else if (requestBody.type === 'team_invitation') {
      return await handleTeamInvitationNotification(requestBody.data);
    }

    throw new Error('Invalid notification type');

  } catch (error: any) {
    console.error("Error in notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro ao processar notificação'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function handleTicketNotification(data: any): Promise<Response> {
  try {
    console.log('Enviando notificação de novo chamado...');

    // 1. Email para o cliente (confirmação)
    const clientEmailResponse = await resend.emails.send({
      from: "Suporte Ascalate <suporte@ascalate.com.br>",
      to: [data.userEmail],
      subject: `Confirmação: Seu chamado #${data.ticketNumber} foi aberto com sucesso!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #003366;">Chamado Aberto com Sucesso!</h2>
          
          <p>Olá, <strong>${data.userName}</strong>,</p>
          
          <p>Recebemos o seu chamado e nossa equipe já foi notificada.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #f07c00; margin: 20px 0;">
            <h3 style="color: #003366; margin-top: 0;">Resumo do seu chamado:</h3>
            <p><strong>Nº do Ticket:</strong> ${data.ticketNumber}</p>
            <p><strong>Título:</strong> ${data.title}</p>
            <p><strong>Prioridade:</strong> ${data.priority}</p>
            <p><strong>Status:</strong> Aberto</p>
          </div>
          
          <p>Você pode acompanhar o andamento pelo painel em nosso site. Responderemos o mais breve possível.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Ascalate</strong>
          </p>
        </div>
      `,
    });

    console.log("Email do cliente enviado:", clientEmailResponse);

    // 2. Email para os administradores
    const adminEmails = [
      "daniel@ascalate.com.br",
      "rafael.gontijo@ascalate.com.br"
    ];

    const adminEmailResponse = await resend.emails.send({
      from: "Sistema Ascalate <sistema@ascalate.com.br>",
      to: adminEmails,
      subject: `🚨 Novo Chamado: #${data.ticketNumber} - ${data.priority}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">🚨 Novo Chamado Recebido</h2>
          
          <p>Um novo chamado foi aberto na plataforma.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Detalhes:</h3>
            <p><strong>Nº do Ticket:</strong> ${data.ticketNumber}</p>
            <p><strong>Cliente:</strong> ${data.userName} (${data.userEmail})</p>
            <p><strong>Prioridade:</strong> ${data.priority}</p>
            <p><strong>Título:</strong> ${data.title}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #003366; margin-top: 0;">Descrição:</h4>
            <p style="white-space: pre-wrap;">${data.description}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://klcfzhpttcsjuynumzgi.supabase.co" 
               style="background-color: #f07c00; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              📋 Acessar Painel de Administração
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Sistema Automatizado de Chamados - Ascalate
          </p>
        </div>
      `,
    });

    console.log("Email dos admins enviado:", adminEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      clientEmailId: clientEmailResponse.data?.id,
      adminEmailId: adminEmailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Erro ao enviar notificação de chamado:", error);
    throw error;
  }
}

async function handleTeamInvitationNotification(data: any): Promise<Response> {
  try {
    console.log('Enviando convite de equipe...');

    const emailResponse = await resend.emails.send({
      from: "Ascalate <onboarding@resend.dev>",
      to: [data.invitedEmail],
      subject: `Convite para se juntar à equipe da ${data.companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Convite para Equipe</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Você foi convidado!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">Olá!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${data.inviterName}</strong> convidou você para se juntar à equipe da <strong>${data.companyName}</strong> na plataforma Ascalate.
            </p>
            
            ${data.message ? `
            <div style="background: #f8f9ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0; font-style: italic; color: #555;">
                "${data.message}"
              </p>
            </div>
            ` : ''}
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Ao aceitar este convite, você terá acesso ao painel da empresa e poderá colaborar com a equipe em projetos, documentos e muito mais.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.inviteUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                🚀 Aceitar Convite e Criar Conta
              </a>
            </div>
            
            <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 20px;">
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                Se você não esperava este convite, pode ignorar este email com segurança.
                <br>
                <strong>Ascalate</strong> - Plataforma de Gestão Empresarial
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Convite enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Erro ao enviar convite:", error);
    throw error;
  }
}

serve(handler);
