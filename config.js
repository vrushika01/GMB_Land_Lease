import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://lseutvqcfshzryanmblu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZXV0dnFjZnNoenJ5YW5tYmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MjU5MTksImV4cCI6MjA1NjQwMTkxOX0.EH64pyy3rERJIyZLBSAq0b2PhtZFkJyW0FXJ2i4hcow";
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the supabase object
export { supabase };