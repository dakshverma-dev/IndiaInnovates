-- SANKALP AI — PostgreSQL Schema
-- Run: psql $DATABASE_URL -f src/db/migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS wards (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  health_score  INTEGER NOT NULL DEFAULT 70,
  complaint_count INTEGER NOT NULL DEFAULT 0,
  resolved_count  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS officers (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT UNIQUE NOT NULL,
  gps_lat     NUMERIC(10,7),
  gps_lng     NUMERIC(10,7),
  ward_id     INTEGER REFERENCES wards(id),
  karma_score INTEGER NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS complaints (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone               TEXT NOT NULL,
  message             TEXT NOT NULL,
  category            TEXT NOT NULL,
  priority            TEXT NOT NULL CHECK (priority IN ('P1','P2','P3','P4')),
  ward_id             INTEGER REFERENCES wards(id),
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','assigned','in_progress','resolved','closed')),
  assigned_officer_id INTEGER REFERENCES officers(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ,
  duplicate_of        UUID REFERENCES complaints(id),
  gps_lat             NUMERIC(10,7),
  gps_lng             NUMERIC(10,7),
  photo_path          TEXT,
  ai_summary          TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  ticket_id   UUID NOT NULL REFERENCES complaints(id),
  action      TEXT NOT NULL,
  officer_id  INTEGER REFERENCES officers(id),
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prev_hash   TEXT,
  curr_hash   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS predictions (
  id             SERIAL PRIMARY KEY,
  ward_id        INTEGER REFERENCES wards(id),
  category       TEXT NOT NULL,
  predicted_date DATE NOT NULL,
  confidence     NUMERIC(5,2),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for deduplication query (same ward+category in last 24h)
CREATE INDEX IF NOT EXISTS idx_complaints_ward_created
  ON complaints(ward_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_complaints_status
  ON complaints(status);

CREATE INDEX IF NOT EXISTS idx_audit_ticket
  ON audit_log(ticket_id, timestamp ASC);
