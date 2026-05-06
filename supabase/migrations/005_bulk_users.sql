-- ══════════════════════════════════════════════
--  CAREER Platform — Bulk User Insert
--  يتجاهل الإيميلات الموجودة مسبقاً
-- ══════════════════════════════════════════════

WITH new_users (email, password, full_name) AS (
  VALUES
    ('ghcini@cmc.org.qa',             'GgG@02',        'Ghassen ezzedine hcini'),
    ('mbalharith@cmc.org.qa',         'Mnm2026',       'Maryam'),
    ('kalrewaili@cmc.org.qa',         '230881',        'Kafi'),
    ('alusain@cmc.org.qa',            'Hsal@2001',     'عبدالهادي سعيد عبدالهادي سعد لوذين'),
    ('arahman@cmc.org.qa',            'Aa@123456',     'ANSAB RAHMAN VV'),
    ('malhajaji@cmc.org.qa',          'O@123456',      'Maha Ali Alhajjaji'),
    ('malobaidli86@hotmail.com',       'Love4Everm',    'Mashael Alobaidli'),
    ('moza-2020@hotmail.com',          'Mm@123456',     'Moza'),
    ('nralmarri@cmc.org.qa',          'Qatar@1234',    'نوره راشد النهاب'),
    ('danaalmansoori@gmail.com',       'Doha@123',      'Dana almansoori'),
    ('waadenazi2003@gmail.com',        'Waad@1408',     'waad ali alenazi'),
    ('malsada@cmc.org.qa',            'Ma@33234949',   'Moudi Ali Al Sada'),
    ('salzaabi@cmc.org.qa',           'Saranasser_91', 'Sara nasser alzaabi'),
    ('faisal0almarri@gmail.com',       'Faisal-0990*',  'فيصل راشد المري'),
    ('nalmuhaizaa@cmc.org.qa',        'Nn#5678900',    'ناصر عبدالله المهيزع'),
    ('balhashemi07@outlook.com',       'Bb@1234567',    'Bushra Husam Alhashemi'),
    ('halmarri2@cmc.rog.qa',          'Hh@123456',     'Hussain alsafran'),
    ('rowda.i.almansoori@gmail.com',   'Qatar@123',     'Rawdha Ibrahim Almansoori'),
    ('mradwani@cmc.org.qa',           'Mohmad999',     'Mohammed Jawad Radwani'),
    ('ssaad@cmc.org.qa',              'Ss@123456',     'سلمى'),
    ('salwa-almutawah95@hotmail.com',  'soso@12345',    'Salwa Abdulla Al-Mutawah'),
    ('dlebdah@cmc.org.qa',            'Dd@1234567',    'Dalal Lebdah'),
    ('bnoota1902@gmail.com',           'Dd@12341234',   'دانه يوسف احمد حسن الصديقي'),
    ('fatma.25.1@icloud.com',          '1Alyafeii',     'Fatma Ali alyafei'),
    ('mtaha@cmc.org.qa',              'T@123456',      'Muhammad Abdalla Taha'),
    ('ahisham@cmc.org.qa',            'Alaa@12345',    'Alaa'),
    ('malmaraghi@cmc.org.qa',         'Max@2026',      'Maryam Almaraghi'),
    ('aysha_89@hotmail.com',           'aysha@786',     'Aysha'),
    ('a.aljilany@outlook.com',         'Aa@123789',     'Abdulqader Al-jilani'),
    ('koody24@gmail.com',              'Kk@123456',     'خضراء مبارك ظافر القحطاني'),
    ('alaqahtani@cmc.org.qa',         'Aa55647555A',   'Amal'),
    ('salathba@cmc.org.qa',           'Qar@1981000',   'Seeta Almaree'),
    ('zalraeisi@cmc.org.qa',          'Zeezoo@20266',  'Zubaida Haasan Alraeisi'),
    ('aaaburashid1985@gmail.com',      'Rashid@8585',   'ADIL AHMAD AL-HAZAA'),
    ('nhassan@cmc.org.qa',            'NM@123456m',    'نوف حسن أحمد الصائغ'),
    ('halghrenaiq@cmc.org.qa',        'Qatar24680@',   'Hamad Almarri')
),
inserted_users AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    n.email,
    crypt(n.password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', n.full_name),
    now(),
    now()
  FROM new_users n
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.email = n.email
  )
  RETURNING id, email
)
INSERT INTO auth.identities (
  id, user_id, identity_data,
  provider, last_sign_in_at,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  id,
  json_build_object('sub', id::text, 'email', email),
  'email',
  now(), now(), now()
FROM inserted_users;
