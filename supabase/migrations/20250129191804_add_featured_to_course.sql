-- Add a new column 'featured' to the 'course' table
ALTER TABLE courses
ADD COLUMN featured BOOLEAN DEFAULT FALSE;