# CMA3

## Database migrations

This project uses Supabase for the database. The SQL files in the `scripts` directory define the schema. To apply migrations locally or to your Supabase project, install the Supabase CLI and run:

\`\`\`bash
supabase db push
\`\`\`

If `supabase` is not available, install the CLI with `npm install -g supabase` (or `yarn global add supabase`). After installing, rerun the `supabase db push` command to create missing tables and columns such as `realtor_photo_url`.
