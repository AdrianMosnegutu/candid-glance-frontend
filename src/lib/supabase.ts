import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hngngjbcjuvrfnztzbpx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZ25namJjanV2cmZuenR6YnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTkxNTIsImV4cCI6MjA2NjA3NTE1Mn0.ykiixUnK59z1ac9xQpbNjX1Rxgk5d5-KmEw48nkVWYc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 