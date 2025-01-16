/*
  # Add address fields to profiles table

  1. Changes
    - Add address fields to profiles table:
      - street_address
      - city
      - state
      - postal_code
      - country
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'street_address'
  ) THEN
    ALTER TABLE profiles 
      ADD COLUMN street_address text,
      ADD COLUMN city text,
      ADD COLUMN state text,
      ADD COLUMN postal_code text,
      ADD COLUMN country text;
  END IF;
END $$;