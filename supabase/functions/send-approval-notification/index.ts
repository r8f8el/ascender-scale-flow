import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalNotificationRequest {
  requestId: string;
  recipientEmail: string;
  type: 'new_request' | 'status_update' | 'next_approver';
  comments?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { requestId, recipientEmail, type, comments }: ApprovalNotificationRequest = await req.json();

    console.log('Processing approval notification:', { requestId, recipientEmail, type });

    // Get request details
    const { data: request, error: requestError } = await supabase
      .from('approval_requests')
      .select(`
        *,
        approval_flow_types (name)
      `)
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      console.error('Error fetching request:', requestError);
      throw new Error('Request not found');
    }

    let subject: string;
    let htmlContent: string;

    switch (type) {
      case 'new_request':
        subject = `Nova solicitação de aprovação: ${request.title}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nova Solicitação de Aprovação</h2>
            <p>Uma nova solicitação aguarda sua aprovação:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">${request.title}</h3>
              <p><strong>Tipo:</strong> ${request.approval_flow_types?.name}</p>
              <p><strong>Solicitante:</strong> ${request.requested_by_name}</p>
              <p><strong>Prioridade:</strong> ${request.priority === 'high' ? 'Alta' : request.priority === 'medium' ? 'Média' : 'Baixa'}</p>
              ${request.amount ? `<p><strong>Valor:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(request.amount))}</p>` : ''}
            </div>
            
            <p>Acesse o sistema para revisar e aprovar a solicitação.</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #64748b;">
              <p>Esta é uma mensagem automática do sistema de aprovações.</p>
            </div>
          </div>
        `;
        break;

      case 'status_update':
        const statusLabels = {
          approved: 'aprovada',
          rejected: 'rejeitada',
          requires_adjustment: 'devolvida para ajuste'
        };
        
        subject = `Atualização na solicitação: ${request.title}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Atualização da Solicitação</h2>
            <p>Sua solicitação foi ${statusLabels[request.status as keyof typeof statusLabels] || 'atualizada'}:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">${request.title}</h3>
              <p><strong>Status:</strong> ${request.status === 'approved' ? 'Aprovada' : 
                                           request.status === 'rejected' ? 'Rejeitada' : 
                                           'Requer Ajuste'}</p>
              ${comments ? `<p><strong>Comentários:</strong> ${comments}</p>` : ''}
            </div>
            
            <p>Acesse o sistema para visualizar todos os detalhes.</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #64748b;">
              <p>Esta é uma mensagem automática do sistema de aprovações.</p>
            </div>
          </div>
        `;
        break;

      case 'next_approver':
        subject = `Solicitação aguardando sua aprovação: ${request.title}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Solicitação Aguardando Aprovação</h2>
            <p>Uma solicitação foi aprovada na etapa anterior e agora aguarda sua aprovação:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">${request.title}</h3>
              <p><strong>Tipo:</strong> ${request.approval_flow_types?.name}</p>
              <p><strong>Solicitante:</strong> ${request.requested_by_name}</p>
              <p><strong>Etapa:</strong> ${request.current_step} de ${request.total_steps}</p>
            </div>
            
            <p>Acesse o sistema para revisar e aprovar a solicitação.</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #64748b;">
              <p>Esta é uma mensagem automática do sistema de aprovações.</p>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    const emailResponse = await resend.emails.send({
      from: "Sistema de Aprovações <sistema@ascalate.com.br>",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-approval-notification function:", error);
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