import webpush from 'npm:web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscription, title, body, url } = await req.json();

    if (!subscription || !title || !body) {
      throw new Error('Missing required fields');
    }

    const vapidKeys = {
      publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
      privateKey: Deno.env.get('VAPID_PRIVATE_KEY'),
    };

    webpush.setVapidDetails(
      'mailto:example@yourdomain.org',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body,
        url: url || '/',
      })
    );

    return new Response(
      JSON.stringify({ message: 'Notification sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});