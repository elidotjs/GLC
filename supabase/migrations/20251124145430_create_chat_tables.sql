/*
  # Create Chat System Tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `theme` (text)
      - `api_key` (text, encrypted)
      - `system_instruction` (text)
      - `created_at` (timestamp)
      - `last_active` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `text` (text)
      - `sender` (enum: 'user' | 'ai' | 'system')
      - `username` (text)
      - `user_id` (uuid, foreign key to users, nullable for system messages)
      - `timestamp` (timestamp)
      - `is_streaming` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users table: authenticated users can read all, write own
    - Messages table: authenticated users can read all, write own messages
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  theme text DEFAULT 'emerald',
  api_key text,
  system_instruction text DEFAULT 'You are a helpful AI assistant.',
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'ai', 'system')),
  username text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  timestamp bigint NOT NULL,
  is_streaming boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR sender = 'system');

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
