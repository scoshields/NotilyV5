import { supabase } from './supabase';

export async function ensureUserRecord(userId: string, email: string) {
  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existingUser) {
      const now = new Date().toISOString();
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: email,
          trial_start_date: now,
          subscription_status: 'trialing',
          created_at: now,
          updated_at: now
        }]);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error ensuring user record:', error);
    throw error;
  }
}