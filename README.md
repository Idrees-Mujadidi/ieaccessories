# ie accessories

Landing page + admin panel for a phone-accessories store (power banks, chargers, phone cases).
Orders go to WhatsApp. Built with TanStack Start, React 19, Tailwind CSS 4 and Supabase.

## Run locally

```sh
npm install
npm run dev        # http://localhost:8080
```

Needs Node.js 20+ (22 recommended). Copy `.env.example` to `.env` and add your Supabase project URL and publishable key. Never commit `.env` or put a service-role key in a `VITE_` variable.

## Setup checklist

- **WhatsApp number**: edit `WHATSAPP_NUMBER` in `src/lib/products.ts` (country code + digits, no `+`).
- **Instagram link**: edit `INSTAGRAM_URL` in the same file.
- **Prices**: enter product prices in Afghan afghani (AFN); storefront and WhatsApp order messages format them with the Afghani symbol.
- **Logos**: replace the PNGs in `src/assets/` (keep the same file names).
- **Admin password**: there is no default admin password in the app. Passwords belong to Supabase Auth users, and public registration is not available on the site. In Supabase Dashboard, open **Authentication → Users** and either select your existing user and send a password recovery email, or choose **Add user** to create the account with an email and a strong password. Do not put credentials in source code.
- **Admin access**: after creating the account, assign it the `admin` role using the SQL below. For an existing project, run `supabase/disable_first_admin_trigger.sql` in the SQL editor, disable public signups in Supabase Auth settings, and remove `admin` roles from any accounts that should no longer have dashboard access.

## Using your own Supabase project

1. Create a project at supabase.com. Copy `.env.example` to `.env` and set your project URL and publishable key in both plain and `VITE_` variables. `SUPABASE_SERVICE_ROLE_KEY` is optional and must remain server-only.
2. Run `supabase/schema.sql` in the Supabase SQL editor for a new project. It creates the tables and policies; do not run it again on a project where those objects already exist.
3. In Supabase Dashboard, open **Authentication → Users → Add user**. Enter the admin email and a strong password and create the user. To change the password later, select the user and send a password recovery email.
4. Assign that exact user the `admin` role in the Supabase SQL editor:

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'your-admin@example.com'
   on conflict (user_id, role) do nothing;
   ```

5. In Supabase Auth settings, turn off public email signups. Only users with the `admin` role can manage products at `/admin`.

## Scripts

`npm run dev` · `npm run build` · `npm run preview` · `npm run lint` · `npm test`
