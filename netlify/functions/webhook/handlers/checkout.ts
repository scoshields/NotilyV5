import { supabaseAdmin } from '../supabase';
import type { Stripe } from 'stripe';

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  console.log('Session metadata:', session.metadata);
  console.log('User ID from metadata:', userId);
  
  if (!userId) {
    console.error('Missing user ID in session metadata:', session);
    throw new Error('No user ID in session metadata');
  }

  const subscription = session.subscription as string;
  if (!subscription) {
    throw new Error('No subscription in session');
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'active',
      subscription_period: session.mode === 'subscription' ? 'monthly' : 'annual',
      stripe_subscription_id: subscription,
      stripe_customer_id: session.customer as string,
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}