
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
  console.log("Function called with method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting to process request...");
    
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    const { nome, email, telefone, empresa, cargo }: ParticipantDataRequest = JSON.parse(requestBody);
    
    console.log("Parsed data:", { nome, email, telefone, empresa, cargo });
    
    // Validar dados recebidos
    if (!nome || !email || !telefone || !empresa || !cargo) {
      console.error("Missing required fields");
      throw new Error("Todos os campos são obrigatórios");
    }
    
    // Verificar se a chave API está configurada
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Serviço de email não configurado. Entre em contato com o suporte.");
    }
    
    console.log("API Key configured, creating Resend instance...");
    const resend = new Resend(apiKey);
    
    console.log("Sending admin email...");

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

    console.log("Admin email response:", JSON.stringify(adminEmailResponse));
    
    if (adminEmailResponse.error) {
      console.error("Error sending admin email:", adminEmailResponse.error);
      throw new Error(`Falha ao enviar email: ${adminEmailResponse.error.message}`);
    }

    console.log("Email sent successfully to admin");

    return new Response(JSON.stringify({ 
      success: true,
      message: "Dados recebidos com sucesso! Os arquivos serão enviados em breve.",
      emailId: adminEmailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Detailed error in send-participant-data function:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno do servidor",
        details: "Verifique os logs da função para mais informações"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
