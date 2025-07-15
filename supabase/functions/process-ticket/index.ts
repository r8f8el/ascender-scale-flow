
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketRequest {
  user_name: string;
  user_email: string;
  user_phone: string;
  title: string;
  description: string;
  category_id: string;
  priority_id: string;
}

const handler = async (req: Request): Promise<Response> => {
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
    console.log("Iniciando processamento do chamado...");

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verificar se é FormData (com arquivos) ou JSON
    let ticketData: TicketRequest;
    let attachments: File[] = [];

    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      console.log("Processando FormData com arquivos...");
      const formData = await req.formData();
      
      // Extrair dados do ticket
      ticketData = {
        user_name: formData.get("user_name") as string,
        user_email: formData.get("user_email") as string,
        user_phone: formData.get("user_phone") as string,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category_id: formData.get("category_id") as string,
        priority_id: formData.get("priority_id") as string,
      };
      
      // Extrair arquivos
      const fileCount = parseInt(formData.get("file_count") as string || "0");
      for (let i = 0; i < fileCount; i++) {
        const file = formData.get(`file_${i}`) as File;
        if (file) {
          attachments.push(file);
        }
      }
      
      console.log(`Encontrados ${attachments.length} arquivos anexos`);
    } else {
      console.log("Processando dados JSON...");
      ticketData = await req.json();
    }
    
    console.log("Dados recebidos:", ticketData);

    // Validação básica
    if (!ticketData.user_name || !ticketData.user_email || !ticketData.user_phone || 
        !ticketData.title || !ticketData.description || !ticketData.category_id || 
        !ticketData.priority_id) {
      throw new Error("Todos os campos obrigatórios devem ser preenchidos");
    }

    // Buscar o status "Aberto" para definir como padrão
    const { data: statusData, error: statusError } = await supabase
      .from('ticket_statuses')
      .select('id')
      .eq('name', 'Aberto')
      .single();

    if (statusError || !statusData) {
      console.error('Erro ao buscar status:', statusError);
      throw new Error('Status padrão não encontrado');
    }

    // Buscar dados da categoria e prioridade para os emails
    const [categoryRes, priorityRes] = await Promise.all([
      supabase.from('ticket_categories').select('name').eq('id', ticketData.category_id).single(),
      supabase.from('ticket_priorities').select('name').eq('id', ticketData.priority_id).single()
    ]);

    const categoryName = categoryRes.data?.name || 'N/A';
    const priorityName = priorityRes.data?.name || 'N/A';

    // Preparar dados para inserção com metadados gerados automaticamente
    const newTicket = {
      user_name: ticketData.user_name.trim(),
      user_email: ticketData.user_email.trim().toLowerCase(),
      user_phone: ticketData.user_phone.trim(),
      title: ticketData.title.trim(),
      description: ticketData.description.trim(),
      category_id: ticketData.category_id,
      priority_id: ticketData.priority_id,
      status_id: statusData.id,
      ticket_number: '', // Será gerado automaticamente pelo trigger
      user_id: null // Usuário não autenticado
    };

    console.log('Dados preparados para inserção:', newTicket);

    // Salvar no banco de dados
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert(newTicket)
      .select()
      .single();

    if (ticketError) {
      console.error('Erro ao criar ticket:', ticketError);
      throw ticketError;
    }

    console.log('Ticket criado com sucesso:', ticket);

    // Upload de arquivos anexos se existirem
    const uploadedAttachments: any[] = [];
    if (attachments.length > 0) {
      console.log(`Fazendo upload de ${attachments.length} arquivos...`);
      
      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i];
        const fileExtension = file.name.split('.').pop() || 'bin';
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${ticket.id}/${fileName}`;
        
        try {
          // Converter File para ArrayBuffer
          const fileBuffer = await file.arrayBuffer();
          
          // Upload para Storage
          const { error: uploadError } = await supabase.storage
            .from('ticket-attachments')
            .upload(filePath, fileBuffer, {
              contentType: file.type || 'application/octet-stream',
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error(`Erro ao fazer upload do arquivo ${file.name}:`, uploadError);
            continue;
          }

          // Salvar metadados na tabela ticket_attachments
          const { data: attachmentData, error: attachmentError } = await supabase
            .from('ticket_attachments')
            .insert({
              ticket_id: ticket.id,
              filename: file.name,
              file_path: filePath,
              file_size: file.size,
              content_type: file.type || 'application/octet-stream',
              uploaded_by: null
            })
            .select()
            .single();

          if (attachmentError) {
            console.error(`Erro ao salvar metadados do arquivo ${file.name}:`, attachmentError);
          } else {
            uploadedAttachments.push(attachmentData);
            console.log(`Arquivo ${file.name} enviado com sucesso`);
          }
        } catch (error) {
          console.error(`Erro ao processar arquivo ${file.name}:`, error);
        }
      }
      
      console.log(`Upload concluído. ${uploadedAttachments.length} arquivos enviados com sucesso.`);
    }

    // SISTEMA DE NOTIFICAÇÕES POR EMAIL

    // 1. Notificação para o Cliente
    try {
      console.log('Enviando email de confirmação para o cliente...');
      
      const clientEmailResponse = await resend.emails.send({
        from: "Suporte Ascalate <suporte@ascalate.com.br>",
        to: [ticketData.user_email],
        subject: `Confirmação: Seu chamado #${ticket.ticket_number} foi aberto com sucesso!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #003366;">Chamado Aberto com Sucesso!</h2>
            
            <p>Olá, <strong>${ticketData.user_name}</strong>,</p>
            
            <p>Recebemos o seu chamado e nossa equipe já foi notificada.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #f07c00; margin: 20px 0;">
              <h3 style="color: #003366; margin-top: 0;">Resumo do seu chamado:</h3>
              <p><strong>Nº do Ticket:</strong> ${ticket.ticket_number}</p>
              <p><strong>Título:</strong> ${ticketData.title}</p>
              <p><strong>Categoria:</strong> ${categoryName}</p>
              <p><strong>Prioridade:</strong> ${priorityName}</p>
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
    } catch (emailError) {
      console.error("Erro ao enviar email para cliente:", emailError);
      // Não falha o processo se o email não for enviado
    }

    // 2. Notificação para os Administradores
    try {
      console.log('Enviando notificação para administradores...');
      
      const adminEmails = [
        "daniel@ascalate.com.br",
        "rafael.gontijo@ascalate.com.br"
      ];

      const adminEmailResponse = await resend.emails.send({
        from: "Sistema Ascalate <sistema@ascalate.com.br>",
        to: adminEmails,
        subject: `Novo Chamado Recebido: #${ticket.ticket_number} - Prioridade ${priorityName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Novo Chamado Recebido</h2>
            
            <p>Um novo chamado foi aberto na plataforma.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Detalhes:</h3>
              <p><strong>Nº do Ticket:</strong> ${ticket.ticket_number}</p>
              <p><strong>Cliente:</strong> ${ticketData.user_name} (${ticketData.user_email})</p>
              <p><strong>Telefone:</strong> ${ticketData.user_phone}</p>
              <p><strong>Prioridade:</strong> ${priorityName}</p>
              <p><strong>Categoria:</strong> ${categoryName}</p>
              <p><strong>Título:</strong> ${ticketData.title}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
              <h4 style="color: #003366; margin-top: 0;">Descrição:</h4>
              <p style="white-space: pre-wrap;">${ticketData.description}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://klcfzhpttcsjuynumzgi.supabase.co" 
                 style="background-color: #f07c00; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Acessar Painel de Administração
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Sistema Automatizado de Chamados - Ascalate
            </p>
          </div>
        `,
      });

      console.log("Email dos admins enviado:", adminEmailResponse);
    } catch (emailError) {
      console.error("Erro ao enviar email para admins:", emailError);
      // Não falha o processo se o email não for enviado
    }

    // Resposta de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          status: 'Aberto',
          created_at: ticket.created_at
        },
        message: `Chamado #${ticket.ticket_number} criado com sucesso!`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Erro completo ao processar chamado:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        details: error.details || null
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
