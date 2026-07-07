import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OAuthRequest {
  action: 'get_auth_url' | 'exchange_code' | 'sync_file' | 'check_status';
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  code?: string;
  redirectUri?: string;
  requestId?: string;
  rootFolder?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Microsoft OAuth function called');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: OAuthRequest = await req.json();
    console.log('Received request:', { ...requestBody, clientSecret: requestBody.clientSecret ? '***' : undefined });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (requestBody.action === 'get_auth_url') {
      const { clientId, tenantId = 'common', redirectUri } = requestBody;
      if (!clientId || !redirectUri) {
        throw new Error('Missing clientId or redirectUri');
      }
      
      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=offline_access%20Files.ReadWrite.All%20User.Read`;
      
      return new Response(JSON.stringify({ authUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (requestBody.action === 'exchange_code') {
      const { clientId, clientSecret, tenantId = 'common', code, redirectUri, rootFolder = 'Ascalate/Clientes' } = requestBody;
      if (!clientId || !clientSecret || !code || !redirectUri) {
        throw new Error('Missing OAuth credentials or authorization code');
      }

      console.log('Exchanging authorization code for tokens...');
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'offline_access Files.ReadWrite.All User.Read',
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) {
        console.error('Token exchange error:', tokenData);
        throw new Error(`Microsoft Token Exchange failed: ${tokenData.error_description || tokenData.error}`);
      }

      console.log('Fetching user details from Microsoft Graph...');
      const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userData = await userResponse.json();
      if (!userResponse.ok) {
        console.error('Graph API /me error:', userData);
        throw new Error('Failed to fetch user profile from Microsoft');
      }

      const email = userData.mail || userData.userPrincipalName || '';
      const name = userData.displayName || 'Usuário Microsoft';
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      console.log('Saving credentials to database...');
      // Clean existing records first to avoid duplicates
      await supabase.from('microsoft_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const { data: dbData, error: dbError } = await supabase
        .from('microsoft_tokens')
        .insert({
          client_id: clientId,
          client_secret: clientSecret,
          tenant_id: tenantId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
          user_email: email,
          user_name: name,
          root_folder: rootFolder,
          is_active: true,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return new Response(JSON.stringify({ success: true, email, name }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (requestBody.action === 'check_status') {
      const { data: tokenRecord, error: tokenError } = await supabase
        .from('microsoft_tokens')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (tokenError) throw tokenError;

      if (!tokenRecord) {
        return new Response(JSON.stringify({ connected: false }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({
        connected: true,
        email: tokenRecord.user_email,
        name: tokenRecord.user_name,
        rootFolder: tokenRecord.root_folder,
        clientId: tokenRecord.client_id,
        tenantId: tokenRecord.tenant_id,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (requestBody.action === 'sync_file') {
      const { requestId } = requestBody;
      if (!requestId) {
        throw new Error('Missing requestId');
      }

      console.log(`Starting file sync for request card ID: ${requestId}`);

      // 1. Load document request details
      const { data: request, error: reqError } = await supabase
        .from('client_document_requests' as any)
        .select(`
          *,
          client_profiles (
            name,
            company
          )
        ` as any)
        .eq('id', requestId)
        .single();

      if (reqError) throw reqError;
      if (!request || !request.file_path || !request.filename) {
        throw new Error('Request has no file submitted yet');
      }

      // 2. Load active Microsoft Token
      const { data: tokenRecord, error: tokenError } = await supabase
        .from('microsoft_tokens')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (tokenError) throw tokenError;
      if (!tokenRecord) {
        throw new Error('No active Microsoft integration configured');
      }

      let accessToken = tokenRecord.access_token;
      let expiresAt = new Date(tokenRecord.expires_at);

      // 3. Refresh token if expired (or expiring in < 5 mins)
      if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
        console.log('Microsoft access token expired or expiring soon, refreshing...');
        const refreshResponse = await fetch(`https://login.microsoftonline.com/${tokenRecord.tenant_id}/oauth2/v2.0/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: tokenRecord.client_id,
            client_secret: tokenRecord.client_secret,
            refresh_token: tokenRecord.refresh_token || '',
            grant_type: 'refresh_token',
          }),
        });

        const refreshData = await refreshResponse.json();
        if (!refreshResponse.ok) {
          console.error('Token refresh error:', refreshData);
          throw new Error('Failed to refresh Microsoft Access Token');
        }

        accessToken = refreshData.access_token;
        const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();
        
        console.log('Saving refreshed tokens to database...');
        await supabase
          .from('microsoft_tokens')
          .update({
            access_token: accessToken,
            refresh_token: refreshData.refresh_token || tokenRecord.refresh_token,
            expires_at: newExpiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tokenRecord.id);
      }

      // 4. Download file from Supabase Storage
      console.log(`Downloading file from storage bucket 'documents': ${request.file_path}`);
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from('documents')
        .download(request.file_path);

      if (downloadError) throw downloadError;
      if (!fileBlob) throw new Error('File download from storage returned empty content');

      // 5. Construct OneDrive Target Path
      const cleanCompany = (request.client_profiles?.company || request.client_profiles?.name || 'Cliente Sem Nome')
        .replace(/[\/\\:*?"<>|]/g, '-'); // replace invalid filesystem characters
      const cleanCategory = (request.category || 'Outros')
        .replace(/[\/\\:*?"<>|]/g, '-');
      const cleanFilename = request.filename.replace(/[\/\\:*?"<>|]/g, '-');
      
      const targetPath = `${tokenRecord.root_folder}/${cleanCompany}/${cleanCategory}/${cleanFilename}`;
      console.log(`Target OneDrive path: ${targetPath}`);

      // 6. Upload to Microsoft Graph API
      // Endpoint: PUT /me/drive/root:/{path}:/content
      console.log('Uploading file content to Microsoft Graph API...');
      const graphUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(targetPath)}:/content`;
      
      const arrayBuffer = await fileBlob.arrayBuffer();

      const graphResponse = await fetch(graphUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': request.content_type || 'application/octet-stream',
        },
        body: arrayBuffer,
      });

      const graphData = await graphResponse.json();
      if (!graphResponse.ok) {
        console.error('OneDrive Graph API upload error:', graphData);
        throw new Error(`OneDrive upload failed: ${graphData.error?.message || 'Unknown error'}`);
      }

      console.log('OneDrive upload successful!');
      return new Response(JSON.stringify({
        success: true,
        oneDrivePath: targetPath,
        webUrl: graphData.webUrl,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error("Error in microsoft-oauth function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro ao processar integração Microsoft'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
