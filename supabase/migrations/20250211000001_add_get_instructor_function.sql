/*
  # Add function to get instructor names
  
  This function will allow reading instructor profiles for course displays
  by creating a SECURITY DEFINER function that bypasses RLS.
*/

-- Create function to get instructor name by ID
CREATE OR REPLACE FUNCTION get_instructor_name(instructor_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  instructor_name TEXT;
BEGIN
  SELECT name INTO instructor_name 
  FROM profiles 
  WHERE id = instructor_uuid;
  
  RETURN instructor_name;
END;
$$;

-- Create function to get instructor details by ID  
CREATE OR REPLACE FUNCTION get_instructor_details(instructor_uuid UUID)
RETURNS TABLE(id UUID, name TEXT, avatar_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT profiles.id, profiles.name, profiles.avatar_url
  FROM profiles 
  WHERE profiles.id = instructor_uuid;
END;
$$;
