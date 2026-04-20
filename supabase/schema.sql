CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  request_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name TEXT,
  phone TEXT,
  bank_choice TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE bank_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  personal_multiplier NUMERIC DEFAULT 18,
  deduction_rate NUMERIC DEFAULT 0.33,
  annual_rate NUMERIC DEFAULT 2.5,
  max_period_months INT DEFAULT 60,
  sakani_low_threshold NUMERIC DEFAULT 10000,
  sakani_low_support NUMERIC DEFAULT 150000,
  sakani_high_support NUMERIC DEFAULT 100000,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  bank_key TEXT NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO bank_settings (bank_key, name, personal_multiplier, annual_rate) VALUES
('ahli',   'البنك الأهلي',    18, 2.5),
('rajhi',  'مصرف الراجحي',    18, 2.5),
('inma',   'بنك الإنماء',     18, 2.5),
('bilad',  'بنك البلاد',      18, 2.5),
('riyadh', 'بنك الرياض',      18, 2.5),
('jazira', 'بنك الجزيرة',     18, 2.5),
('fransi', 'بنك الفرنسي',     17, 2.5),
('samba',  'سامبا فايننشال',  17, 2.5);

-- Admin user (password will be set via /api/admin/init)
-- Run this after deploying: POST /api/admin/init with { secret: YOUR_INIT_SECRET }
