# Environment Variables Checklist

## Required for Production (Vercel)

Make sure these environment variables are set in your Vercel project settings:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Mailchimp
- `MAILCHIMP_API_KEY` - Your Mailchimp API key (format: `your-api-key-us1`)
- `MAILCHIMP_LIST_ID` - Your Mailchimp audience/list ID
- `MAILCHIMP_SERVER_PREFIX` - Optional, your Mailchimp server prefix (e.g., "us1", "us2")

## How to Set in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the correct name and value
4. Make sure to select the correct **Environment** (Production, Preview, Development)
5. **Redeploy** your application after adding variables

## Testing

After setting environment variables, test the waitlist form:
1. Try submitting a new email
2. Check Vercel function logs for any errors
3. Verify the email appears in Mailchimp
4. Verify the email appears in Supabase `waitlist_emails` table

## Troubleshooting

If the waitlist form doesn't work:

1. **Check Vercel logs**: Go to your Vercel project → **Deployments** → Click on latest deployment → **Functions** tab
2. **Check browser console**: Open browser DevTools → Console tab → Look for errors
3. **Verify environment variables**: Make sure all required variables are set in Vercel
4. **Check API route**: Visit `/api/mailchimp` directly (should return an error about missing POST data, not about missing config)

## Common Issues

- **"Mailchimp not configured"**: Environment variables are missing or not set correctly
- **CORS errors**: Should not happen with Next.js API routes, but check if you're calling from wrong domain
- **Network errors**: Check if Mailchimp API is accessible from Vercel's servers

