-- להריץ פעם אחת ב-Neon > SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','parent')),
  parent_name text NOT NULL,
  baby_name text,
  phone text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workshop_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS card_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entries int NOT NULL CHECK (entries > 0),
  price int NOT NULL DEFAULT 0 CHECK (price >= 0),
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES card_templates(id) ON DELETE SET NULL,
  name text NOT NULL,
  entries int NOT NULL CHECK (entries > 0),
  price int NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  paid_by uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
CREATE INDEX IF NOT EXISTS cards_user_open ON cards(user_id) WHERE closed_at IS NULL;

CREATE TABLE IF NOT EXISTS workshop_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_type_id uuid NOT NULL REFERENCES workshop_types(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  location text
);
CREATE INDEX IF NOT EXISTS sessions_starts ON workshop_sessions(starts_at);

CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workshop_type_id uuid REFERENCES workshop_types(id) ON DELETE SET NULL,
  visited_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id),
  voided_at timestamptz,
  voided_by uuid REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS visits_card ON visits(card_id) WHERE voided_at IS NULL;
CREATE INDEX IF NOT EXISTS visits_user ON visits(user_id, visited_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name text NOT NULL DEFAULT 'הסדנה',
  bit_phone text,
  bit_url text,
  whatsapp_phone text,
  call_phone text,
  logo_data_url text,
  theme jsonb
);
INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  detail jsonb,
  at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  email text PRIMARY KEY,
  count int NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);
