-- Seed Academic and Social blocks
INSERT INTO blocks (id, code, name) VALUES
    (1, 'ACADEMIC', 'Академический блок'),
    (2, 'SOCIAL', 'Социальный блок')
ON CONFLICT (code) DO NOTHING;

-- Seed 7 AITUSA committees
INSERT INTO committees (id, code, name, active, block_id) VALUES
    (1, 'DIGITALIZATION', 'Digitalization', TRUE, 1),
    (2, 'ACADEMIC', 'Academic', TRUE, 1),
    (3, 'CSIA', 'CSIA', TRUE, 1),
    (4, 'SOCIAL', 'Social', TRUE, 2),
    (5, 'MEDIA', 'Mass Media', TRUE, 2),
    (6, 'CULTURAL', 'Cultural and Mass Activities', TRUE, 2),
    (7, 'EXTERNAL_RELATIONS', 'External Relations', TRUE, 2)
ON CONFLICT (code) DO NOTHING;

SELECT setval('blocks_id_seq', (SELECT COALESCE(MAX(id), 1) FROM blocks));
SELECT setval('committees_id_seq', (SELECT COALESCE(MAX(id), 1) FROM committees));

-- Seed demo users for local development & pet-project showcase
INSERT INTO users (id, telegram_id, first_name, last_name, email, academic_group, is_active, created_at) VALUES
    ('11111111-1111-1111-1111-111111111101', 100000001, 'Куандык', 'Ахметов', 'kuandyk.akhmetov@astanait.edu.kz', 'SE-2301', TRUE, NOW() - INTERVAL '14 days'),
    ('11111111-1111-1111-1111-111111111102', 100000002, 'Алихан', 'Нурланов', 'alikhan.nurlanov@astanait.edu.kz', 'CS-2304', TRUE, NOW() - INTERVAL '12 days'),
    ('11111111-1111-1111-1111-111111111103', 100000003, 'Аружан', 'Садыкова', 'aruzhan.sadykova@astanait.edu.kz', 'IT-2402', TRUE, NOW() - INTERVAL '10 days'),
    ('11111111-1111-1111-1111-111111111104', 100000004, 'Дамир', 'Касымов', 'damir.kassymov@astanait.edu.kz', 'SE-2405', TRUE, NOW() - INTERVAL '9 days'),
    ('11111111-1111-1111-1111-111111111105', 100000005, 'Мадина', 'Оспанова', 'madina.ospanova@astanait.edu.kz', 'MT-2302', TRUE, NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;

-- Seed committee memberships
INSERT INTO participants (user_id, committee_id, status, created_at) VALUES
    ('11111111-1111-1111-1111-111111111101', 1, 'Head', NOW() - INTERVAL '14 days'),
    ('11111111-1111-1111-1111-111111111102', 1, 'Head', NOW() - INTERVAL '12 days'),
    ('11111111-1111-1111-1111-111111111103', 1, 'Member', NOW() - INTERVAL '10 days'),
    ('11111111-1111-1111-1111-111111111104', 4, 'Head', NOW() - INTERVAL '9 days'),
    ('11111111-1111-1111-1111-111111111105', 5, 'Member', NOW() - INTERVAL '8 days')
ON CONFLICT (user_id) DO NOTHING;

-- Seed role assignments
INSERT INTO role_assignments (telegram_id, role, enabled) VALUES
    (100000001, 'president', TRUE),
    (100000001, 'admin', TRUE),
    (100000002, 'head', TRUE),
    (100000003, 'member', TRUE),
    (100000004, 'head', TRUE),
    (100000005, 'member', TRUE)
ON CONFLICT (telegram_id, role) DO NOTHING;

-- Seed initial CRM tasks
INSERT INTO tasks (id, name, description, status, committee_id, created_by, assigned_to, completed_by, deadline, created_at, updated_at) VALUES
    (
        '22222222-2222-2222-2222-222222222201',
        'Миграция CRM бэкенда на Java 21 и Spring Boot 3',
        'Перенести модуль управления задачами на Spring Boot 3.3, настроить Spring Data JPA, Flyway миграции и кэширование в Redis.',
        'IN_PROGRESS',
        1,
        '11111111-1111-1111-1111-111111111101',
        '11111111-1111-1111-1111-111111111103',
        NULL,
        NOW() + INTERVAL '3 days',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '1 day'
    ),
    (
        '22222222-2222-2222-2222-222222222202',
        'Интеграция кэширования списков задач в Redis',
        'Настроить TTL 5 минут для списков задач и иерархии подчиненных с автоматическим сбросом кэша при изменении статуса или исполнителя.',
        'ASSIGNED',
        1,
        '11111111-1111-1111-1111-111111111102',
        '11111111-1111-1111-1111-111111111102',
        NULL,
        NOW() + INTERVAL '5 days',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        '22222222-2222-2222-2222-222222222203',
        'Разработка Telegram Mini App деплоя на GitHub Pages',
        'Подготовить пайплайн автоматической сборки фронтенда и публикации статического Mini App на GitHub Pages с демо-режимом.',
        'PUBLISHED',
        1,
        '11111111-1111-1111-1111-111111111101',
        NULL,
        NULL,
        NOW() + INTERVAL '4 days',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '12 hours'
    ),
    (
        '22222222-2222-2222-2222-222222222204',
        'Анонс набора стажёров в комитеты AITUSA',
        'Подготовить афиши, пост для Telegram-канала и расписание собеседований для осеннего набора стажёров.',
        'CREATED',
        5,
        '11111111-1111-1111-1111-111111111101',
        NULL,
        NULL,
        NOW() + INTERVAL '6 days',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '6 hours'
    ),
    (
        '22222222-2222-2222-2222-222222222205',
        'Организация благотворительной ярмарки AITU Charity',
        'Согласовать дату проведения в атриуме университета, распределить точки комитетов и подготовить форму волонтёров.',
        'COMPLETED',
        4,
        '11111111-1111-1111-1111-111111111104',
        '11111111-1111-1111-1111-111111111104',
        '11111111-1111-1111-1111-111111111104',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;
