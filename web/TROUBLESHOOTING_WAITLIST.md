# Troubleshooting Waitlist Form

## Common Errors

### 1. Mailchimp API 500 Error

**Symptom**: `api/mailchimp:1 Failed to load resource: the server responded with a status of 500`

**Causes**:
- Missing environment variables in Vercel
- Invalid Mailchimp API key
- Invalid Mailchimp List ID
- Wrong server prefix

**Solution**:
1. Check Vercel Environment Variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify these are set:
     - `MAILCHIMP_API_KEY`
     - `MAILCHIMP_LIST_ID`
     - `MAILCHIMP_SERVER_PREFIX` (optional)
2. Check Vercel Function Logs:
   - Go to Deployments → Latest → Functions → `/api/mailchimp`
   - Look for error messages about missing config
3. Verify Mailchimp credentials:
   - API Key format: `your-key-us1` (check the last part matches server prefix)
   - List ID: Found in Mailchimp → Audience → Settings

### 2. Supabase 400 Error

**Symptom**: `supabase.co/rest/v1/waitlist_emails?columns=... Failed to load resource: the server responded with a status of 400`

**Causes**:
- Table doesn't exist
- Column names don't match
- RLS (Row Level Security) policies blocking insert
- Wrong data format

**Solution**:

1. **Check if table exists in Supabase**:
   ```sql
   SELECT * FROM waitlist_emails LIMIT 1;
   ```

2. **Verify table structure**:
   The table should have these columns:
   - `id` (uuid, primary key)
   - `email` (text, unique, not null)
   - `first_name` (text, nullable)
   - `locale` (text, nullable)
   - `created_at` (timestamptz, default now())

3. **Create table if missing**:
   ```sql
   CREATE TABLE IF NOT EXISTS public.waitlist_emails (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     first_name TEXT,
     locale TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **Check RLS policies**:
   ```sql
   -- Enable RLS
   ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;
   
   -- Allow inserts for everyone (or authenticated users)
   CREATE POLICY "Allow public inserts" ON public.waitlist_emails
     FOR INSERT
     WITH CHECK (true);
   
   -- Or if you want authenticated only:
   CREATE POLICY "Allow authenticated inserts" ON public.waitlist_emails
     FOR INSERT
     TO authenticated
     WITH CHECK (true);
   ```

5. **Verify environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing

### Test Mailchimp API directly:
```bash
curl -X POST https://your-domain.vercel.app/api/mailchimp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","locale":"sv"}'
```

### Test Supabase connection:
Check browser console for Supabase client initialization errors.

## Debug Steps

1. **Check browser console** for client-side errors
2. **Check Vercel Function Logs** for server-side errors
3. **Verify all environment variables** are set in Vercel
4. **Test with a simple email** to isolate the issue
5. **Check Supabase dashboard** to see if data is being inserted

## Quick Fixes

### If Mailchimp fails but Supabase works:
- The form will still show success (Supabase is backup)
- Fix Mailchimp config separately

### If both fail:
- Check environment variables first
- Check Supabase table structure
- Check RLS policies

