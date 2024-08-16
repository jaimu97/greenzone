// Supabase documentation here: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/getting-started/tutorials/with-ionic-react.mdx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://epicminecraft.xyz:8000';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzIyOTAyNDAwLAogICJleHAiOiAxODgwNjY4ODAwCn0.YHzK3KDDnx1nbJTAivA67mznMTulhtNdssJ2a37Uzyk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);