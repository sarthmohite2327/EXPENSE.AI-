/*
  # Create expenses table

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key) - Unique identifier for each expense
      - `amount` (numeric) - Amount spent
      - `category` (text) - Category of expense (food, travel, shopping, etc.)
      - `description` (text) - Description of the expense
      - `date` (date) - Date of the expense
      - `created_at` (timestamptz) - Timestamp when record was created
  
  2. Security
    - Enable RLS on `expenses` table
    - Add policy for public access (for demo purposes, allows anyone to read/write)
    
  3. Notes
    - This is a demo app without authentication, so we use permissive policies
    - In production, you would add user_id column and restrict access per user
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL CHECK (amount > 0),
  category text NOT NULL,
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON expenses
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access"
  ON expenses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON expenses
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON expenses
  FOR DELETE
  TO anon
  USING (true);