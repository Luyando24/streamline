
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('No user found')
    return
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  console.log('User ID:', user.id)
  console.log('Profile:', profile)
  console.log('Error:', error)
}

debug()
