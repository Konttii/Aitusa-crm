# AITUSA CRM — Telegram Mini App для управления задачами

Полнофункциональная CRM-система и трекер задач студенческого самоуправления **AITUSA**, разработанная в формате **Telegram Mini App**. Бэкенд реализован на **Java 21** и **Spring Boot 3**, данные хранятся в **PostgreSQL 17**, горячие выборки и профили кэшируются в **Redis 7**, а клиентская часть написана на **React 18 (Vite)** с поддержкой работы как поверх локального Docker-окружения, так и автономно на **GitHub Pages**.

---

## Стек технологий

### Backend
- **Java 21**, **Spring Boot 3.3** (`Spring Web`, `Spring Data JPA`, `Spring Data Redis`, `Bean Validation`, `Actuator`)
- **PostgreSQL 17** + **Flyway** (версионирование схемы БД и предзаполнение демо-данными)
- **Redis 7** (кэширование списков задач, профилей и структуры подчинения с автоматической инвалидацией и in-memory фоллбэком)
- **Telegram WebApp Auth** (криптографическая проверка подписи `initData` по алгоритму `HMAC-SHA256` + локальный демо-режим)
- **Springdoc OpenAPI / Swagger UI** (`/swagger-ui.html`)
- **JUnit 5** + **H2** (интеграционные и модульные тесты)

### Frontend
- **React 18**, **React Router 6**, **Vite 5**
- **Telegram Mini App SDK** (нативные цвета темы, `HapticFeedback`, сохранение `tgWebAppData` в `hash`)
- **GitHub Pages Demo Mode** (автоматический fallback на локальное хранилище `localStorage`, позволяющий протестировать все сценарии в браузере или Telegram без поднятия внешнего сервера)

---

## Ключевые возможности

1. **Ролевая модель и разграничение доступа (RBAC)**:
   - **Президент / Администратор (`FULL_ACCESS`)**: полный доступ ко всем 7 комитетам AITUSA, создание, переназначение и удаление задач.
   - **Вице-президент (`VICE_PRESIDENT`)**: курирование комитетов своего направления (Академический или Социальный блок).
   - **Глава комитета (`HEAD`)**: создание и назначение задач внутри своего комитета, поиск исполнителей.
   - **Участник / Стажёр (`MEMBER` / `TRAINEE`)**: просмотр пула свободных задач своего комитета, атомарный захват задачи («Забрать себе») и перевод её по этапам выполнения.
2. **Жизненный цикл задачи**:
   - Статусы: `CREATED` → `PUBLISHED` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED`.
   - Атомарный `UPDATE` при взятии свободной задачи (`POST /api/v1/tasks/{id}/take`), защищающий от состояния гонки (race condition) при одновременном отклике нескольких участников.
   - Визуальный прогресс-бар этапов и динамический таймлайн дедлайна (конвертация локального времени `UTC+5` ↔ `UTC`).
3. **Многоуровневое кэширование в Redis**:
   - Кэширование `/api/v1/auth/me`, `/api/v1/tasks`, `/api/v1/task-committees` и `/api/v1/users/subordinates` с TTL 5 минут.
   - Селективный сброс ключей `aitusa:tasks:list:*` при создании, редактировании, смене статуса или удалении задачи.

---

## Быстрый старт (Docker Compose)

Проект полностью контейнеризирован и поднимается одной командой вместе с **PostgreSQL 17** и **Redis 7**:

```bash
docker compose up --build
```

После запуска доступны:
- **CRM Telegram Mini App UI**: [http://localhost:8080/crm/](http://localhost:8080/crm/)
- **Swagger UI (OpenAPI документация)**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Healthcheck**: [http://localhost:8080/health](http://localhost:8080/health)

На экране входа доступны **3 преднастроенных демо-профиля** (Президент AITUSA, Глава комитета Digitalization и Участник), между которыми можно переключаться в один клик (кнопка роли в правом верхнем углу шапки).

---

## Запуск через GitHub Pages и локальный Telegram Mini App

1. При пуше в ветку `main` GitHub Actions (`.github/workflows/deploy-pages.yml`) автоматически собирает фронтенд и публикует его на **GitHub Pages**:
   `https://konttii.github.io/Aitusa-crm/`
2. Эту ссылку можно указать в `@BotFather` (`/newapp` или Menu Button вашего локального Telegram-бота) — Mini App откроется прямо внутри Telegram без необходимости арендовать VPS-сервер.

---

## Структура репозитория

```text
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/kz/aitusa/crm/
│       │   ├── config/       # Настройки приложения, WebMvc, CORS и OpenAPI
│       │   ├── controller/   # REST API (/api/v1/*), Healthcheck и SPA роутинг
│       │   ├── dto/          # Request/Response модели и парсер UTC+5 дедлайнов
│       │   ├── entity/       # JPA сущности (Task, User, Committee, Participant, RoleAssignment)
│       │   ├── exception/    # Глобальный обработчик ошибок (GlobalExceptionHandler)
│       │   ├── repository/   # Spring Data JPA репозитории и атомарные запросы
│       │   ├── security/     # Валидатор Telegram initData (HMAC-SHA256) и иерархия ролей
│       │   └── service/      # Бизнес-логика задач, прав доступа и Redis-кэширования
│       ├── main/resources/
│       │   ├── application.yml
│       │   └── db/migration/ # Миграции Flyway (схема и демо-данные)
│       └── test/             # Модульные и интеграционные тесты Spring Boot
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/                  # React-приложение CRM Mini App
│   └── test/                 # Тесты фронтенда (node --test)
└── compose.yaml              # Оркестрация PostgreSQL 17, Redis 7 и Spring Boot
```
