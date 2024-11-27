import { supabase } from "@/integrations/supabase/client";

const publicVapidKey = 'BLBz5AjYPvp_UGqEYGlhsC8Gj6FLEbVPtDVFXz_GhQJTss3eKqJBfqeaEaJqXhNFJqEPPF8TxLGW_zGxgKo_Aic';

export async function subscribeToPushNotifications() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications are not supported');
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicVapidKey
    });

    // Convert PushSubscription to a plain object that can be stored as JSONB
    const subscriptionObject = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))) : null,
        auth: subscription.getKey ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))) : null,
      }
    };

    // Store subscription in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('settings')
      .update({ push_subscription: subscriptionObject })
      .eq('user_id', user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('settings')
        .update({ push_subscription: null })
        .eq('user_id', user.id);

      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}