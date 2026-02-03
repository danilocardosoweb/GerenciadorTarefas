
import { createClient } from '@supabase/supabase-js';

// Extraído do seu token ref: jmiajqfqllopfpmknpek
const SUPABASE_URL = 'https://jmiajqfqllopfpmknpek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaWFqcWZxbGxvcGZwbmtucGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MTgxNTYsImV4cCI6MjA3NzI5NDE1Nn0.Xm8EE8lkQanL4Nfh6VtNxTbwopNQ5lR6qdiL_OnjeYc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
