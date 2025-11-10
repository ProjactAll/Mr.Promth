import { createClient } from '@supabase/supabase-js'

const url = 'https://liywmjxhllpexzrnuhlu.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpeXdtanhobGxwZXh6cm51aGx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY2Mjk5NCwiZXhwIjoyMDc4MjM4OTk0fQ.Ic0Oyh3NsfhqyIelCrVclSWhYDhlCK0ZU8nD-uzEX6I'

const supabase = createClient(url, key)

async function check() {
  const { data, error } = await supabase.from('workflows').select('id').limit(1)
  if (error) {
    console.log('❌ Workflows table does not exist:', error.message)
    process.exit(1)
  } else {
    console.log('✅ Workflows table exists')
    process.exit(0)
  }
}

check()
