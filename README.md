## Database Migration

To add a `CHECK` constraint to the `status` field of the `order_matches` table, follow these steps:

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase** (if not already initialized):
   ```bash
   supabase init
   ```

3. **Create a new migration**:
   ```bash
   supabase migration new add_status_check_to_order_matches
   ```

4. **Edit the migration file**: Open the newly created migration file in the `supabase/migrations` directory and add the following SQL:

   ```sql
   -- Add a CHECK constraint to the status field of order_matches
   ALTER TABLE order_matches
   ADD CONSTRAINT status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'counteroffer'));
   ```

5. **Run the migration**:
   ```bash
   supabase db push
   ```

This will ensure that the `status` field in the `order_matches` table only accepts the specified values, including 'counteroffer'.
