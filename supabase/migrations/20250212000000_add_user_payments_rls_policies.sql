/*
  # Add RLS policies for user_payments table
  
  The user_payments table was created without RLS policies, causing
  insert operations to fail with row-level security violations.
  
  This migration enables RLS and adds policies to allow users to:
  - Insert their own payment records
  - Read their own payment records
*/

-- Enable RLS on user_payments table
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own payment records
CREATE POLICY "Users can insert their own payments"
  ON user_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to read their own payment records
CREATE POLICY "Users can read their own payments"
  ON user_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to update their own payment records (if needed)
CREATE POLICY "Users can update their own payments"
  ON user_payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
