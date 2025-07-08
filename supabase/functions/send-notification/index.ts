import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  notificationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { notificationId }: NotificationRequest = await req.json();

    // Buscar a notificação no banco
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .is('sent_at', null)
      .single();

    if (fetchError || !notification) {
      console.error("Notificação não encontrada:", fetchError);
      return new Response(
        JSON.stringify({ error: "Notificação não encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Enviar email
    const emailResponse = await resend.emails.send({
      from: "Ascalate <noreply@ascalate.com.br>",
      to: [notification.recipient_email],
      subject: notification.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ascalate</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p style="color: #555; line-height: 1.6;">${notification.message}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            Esta é uma mensagem automática do sistema Ascalate.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Erro ao enviar email:", emailResponse.error);
      
      // Atualizar notificação com erro
      await supabase
        .from('notifications')
        .update({ 
          error_message: emailResponse.error.message,
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      return new Response(
        JSON.stringify({ error: "Erro ao enviar email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Marcar notificação como enviada
    await supabase
      .from('notifications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', notificationId);

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);