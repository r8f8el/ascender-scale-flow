// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://klcfzhpttcsjuynumzgi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2Z6aHB0dGNzanV5bnVtemdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTc4NTcsImV4cCI6MjA2NDQ3Mzg1N30.bCqDXdJdf0_ddGch2hkCEWBPKyKq9CyX6QILu9KSIqk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);