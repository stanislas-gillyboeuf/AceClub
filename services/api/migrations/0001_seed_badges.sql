-- Seed initial badges
INSERT INTO "badge" ("id", "code", "category", "name_fr", "name_en", "description_fr", "description_en", "image_url", "required_level", "is_active", "display_order", "created_at")
VALUES
  (
    '01JK7BADGE001PREMIERSPAS',
    'premiers_pas',
    'milestone',
    'Premiers pas',
    'First Steps',
    'Bienvenue dans le club ! Tu as créé ton compte.',
    'Welcome to the club! You created your account.',
    'https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/premier_pas.PNG',
    NULL,
    true,
    1,
    NOW()
  ),
  (
    '01JK7BADGE002JOUEURREGUL',
    'joueur_regulier',
    'achievement',
    'Joueur régulier',
    'Regular Player',
    'Tu as joué 5 matchs ce mois-ci. Continue comme ça !',
    'You played 5 matches this month. Keep it up!',
    'https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/joueur_regulier.PNG',
    NULL,
    true,
    2,
    NOW()
  ),
  (
    '01JK7BADGE003ENFORME0001',
    'en_forme',
    'achievement',
    'En forme',
    'In Shape',
    'Tu as joué au moins 5 matchs par mois pendant 3 mois consécutifs. Quelle régularité !',
    'You played at least 5 matches per month for 3 consecutive months. What consistency!',
    'https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/en_forme.PNG',
    NULL,
    true,
    3,
    NOW()
  )
ON CONFLICT (code) DO UPDATE SET
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  description_fr = EXCLUDED.description_fr,
  description_en = EXCLUDED.description_en,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order;
