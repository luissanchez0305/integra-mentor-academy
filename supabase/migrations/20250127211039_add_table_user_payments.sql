-- Create a new table to store payment details made by users
CREATE TABLE user_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    taxed NUMERIC(10, 2) NOT NULL,
    course_details JSONB NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
); 