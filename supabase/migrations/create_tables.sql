/*
  # Initial Database Setup

  1. New Tables
    - `riddles`
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `created_at` (timestamp)
    - `leaderboard`
      - `username` (text, primary key)
      - `score` (integer)
      - `updated_at` (timestamp)
*/

CREATE TABLE IF NOT EXISTS riddles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leaderboard (
  username text PRIMARY KEY,
  score integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
