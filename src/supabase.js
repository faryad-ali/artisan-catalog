import { createClient } from '@supabase/supabase-js'

// REPLACE THESE WITH YOUR KEYS FROM SUPABASE SETTINGS > API
const supabaseUrl = 'https://vczavrpdmkbakanhbthf.supabase.co'
const supabaseKey = 'sb_publishable_hxJ2FNofaZax8glu1w59cQ_BMNwaeTb'

export const supabase = createClient(supabaseUrl, supabaseKey)