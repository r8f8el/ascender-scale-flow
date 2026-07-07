import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'ticket_created' | 'team_invitation' | 'document_requested' | 'document_submitted' | 'document_evaluated';
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
    // For document requests / checklists
    recipientEmail?: string;
    clientName?: string;
    clientEmail?: string;
    clientCompany?: string;
    documentTitle?: string;
    dueDate?: string;
    periodReference?: string;
    portalUrl?: string;
    adminPanelUrl?: string;
    filename?: string;
    status?: 'approved' | 'rejected';
    rejectionReason?: string;
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
    } else if (requestBody.type === 'document_requested') {
      return await handleDocumentRequestedNotification(requestBody.data);
    } else if (requestBody.type === 'document_submitted') {
      return await handleDocumentSubmittedNotification(requestBody.data);
    } else if (requestBody.type === 'document_evaluated') {
      return await handleDocumentEvaluatedNotification(requestBody.data);
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
      from: "Sistema Ascalate <sistema@ascalate.com.br>",
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

async function handleDocumentRequestedNotification(data: any): Promise<Response> {
  try {
    console.log('Enviando notificação de documento solicitado...');
    const formattedDate = data.dueDate ? new Date(data.dueDate).toLocaleDateString('pt-BR') : 'Não informada';

    const emailResponse = await resend.emails.send({
      from: "Sistema Ascalate <sistema@ascalate.com.br>",
      to: [data.recipientEmail],
      subject: `📁 Novo Documento Solicitado: ${data.documentTitle} (${data.periodReference})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: #003366;">📁 Novo Documento Solicitado</h2>
          <p>Olá, <strong>${data.clientName}</strong>,</p>
          <p>A equipe de consultoria da Ascalate solicitou o envio de um documento para o ciclo de planejamento orçamentário.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #003366; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #003366; margin-top: 0; margin-bottom: 12px;">Detalhes do Pedido:</h3>
            <p style="margin: 6px 0;"><strong>Documento:</strong> ${data.documentTitle}</p>
            <p style="margin: 6px 0;"><strong>Período de Referência:</strong> ${data.periodReference}</p>
            <p style="margin: 6px 0;"><strong>Prazo de Entrega:</strong> <span style="color: #d97706; font-weight: bold;">${formattedDate}</span></p>
          </div>
          
          ${data.description ? `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h4 style="color: #374151; margin-top: 0; margin-bottom: 8px;">Descrição / Instruções:</h4>
            <p style="margin: 0; font-size: 14px; color: #4b5563;">${data.description}</p>
          </div>
          ` : ''}
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${data.portalUrl || 'https://lovable.dev'}" 
               style="background-color: #003366; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              🚀 Enviar Documento no Portal
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Ascalate</strong>
          </p>
        </div>
      `,
    });

    console.log("Email de documento solicitado enviado:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de solicitação de documento:", error);
    throw error;
  }
}

async function handleDocumentSubmittedNotification(data: any): Promise<Response> {
  try {
    console.log('Enviando notificação de documento submetido ao admin...');
    const adminEmails = ["daniel@ascalate.com.br", "rafael.gontijo@ascalate.com.br"];

    const emailResponse = await resend.emails.send({
      from: "Sistema Ascalate <sistema@ascalate.com.br>",
      to: adminEmails,
      subject: `📤 Documento Recebido: ${data.clientCompany} - ${data.documentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: #047857;">📤 Novo Documento Recebido</h2>
          <p>Um cliente enviou um arquivo para avaliação no checklist de documentos.</p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-left: 4px solid #047857; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #047857; margin-top: 0; margin-bottom: 12px;">Dados do Envio:</h3>
            <p style="margin: 6px 0;"><strong>Empresa:</strong> ${data.clientCompany}</p>
            <p style="margin: 6px 0;"><strong>Enviado por:</strong> ${data.clientName} (${data.clientEmail})</p>
            <p style="margin: 6px 0;"><strong>Solicitação:</strong> ${data.documentTitle}</p>
            <p style="margin: 6px 0;"><strong>Mês de Referência:</strong> ${data.periodReference}</p>
            <p style="margin: 6px 0;"><strong>Nome do Arquivo:</strong> ${data.filename}</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${data.adminPanelUrl || 'https://lovable.dev'}" 
               style="background-color: #047857; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              📋 Avaliar no Painel de Administração
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Sistema Automatizado - Ascalate
          </p>
        </div>
      `,
    });

    console.log("Email de documento recebido enviado aos admins:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de documento submetido:", error);
    throw error;
  }
}

async function handleDocumentEvaluatedNotification(data: any): Promise<Response> {
  try {
    console.log('Enviando notificação de documento avaliado ao cliente...');
    const isApproved = data.status === 'approved';
    const statusText = isApproved ? 'Aprovado' : 'Ajuste Requerido';
    const statusColor = isApproved ? '#047857' : '#dc2626';

    const emailResponse = await resend.emails.send({
      from: "Consultoria Ascalate <suporte@ascalate.com.br>",
      to: [data.recipientEmail],
      subject: `${isApproved ? '✅ Aprovado' : '⚠️ Ajuste Requerido'}: Documento ${data.documentTitle} - Ref. ${data.periodReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: ${statusColor};">${isApproved ? '✅ Documento Aprovado!' : '⚠️ Ajuste Requerido no Documento'}</h2>
          <p>Olá, <strong>${data.clientName}</strong>,</p>
          <p>A equipe de consultoria revisou o documento enviado por você:</p>
          
          <div style="background-color: ${isApproved ? '#f0fdf4' : '#fef2f2'}; padding: 20px; border-left: 4px solid ${statusColor}; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 6px 0;"><strong>Documento:</strong> ${data.documentTitle}</p>
            <p style="margin: 6px 0;"><strong>Referência:</strong> ${data.periodReference}</p>
            <p style="margin: 6px 0;"><strong>Status da Avaliação:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
          </div>

          ${!isApproved && data.rejectionReason ? `
          <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #b45309; margin-top: 0; margin-bottom: 8px;">📋 O que precisa ser corrigido:</h4>
            <p style="margin: 0; font-size: 14px; color: #78350f; white-space: pre-wrap;">${data.rejectionReason}</p>
          </div>
          ` : ''}

          <div style="margin: 30px 0; text-align: center;">
            <a href="${data.portalUrl || 'https://lovable.dev'}" 
               style="background-color: ${statusColor}; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              ${isApproved ? '🚀 Acessar meu Portal' : '📤 Corrigir e Reenviar Documento'}
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Ascalate</strong>
          </p>
        </div>
      `,
    });

    console.log("Email de avaliação de documento enviado ao cliente:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de avaliação de documento:", error);
    throw error;
  }
}

serve(handler);
