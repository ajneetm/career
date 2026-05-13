CREATE TABLE IF NOT EXISTS user_approvals (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL,
  user_name   text,
  user_email  text NOT NULL,
  status      text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_approvals_status ON user_approvals(status);
