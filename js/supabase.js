import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://hwltkusgffozsxujogoq.supabase.co'
const supabaseKey = 'sb_publishable_Cc2F1bYRIb3Bji7FnelBIQ_Y9l43TJ3'

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)