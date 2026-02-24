-- pgcrypto extension для шифрования в БД (основа для будущего).
-- Текущее шифрование — application-level (lib/encryption.ts).
CREATE EXTENSION IF NOT EXISTS pgcrypto;
