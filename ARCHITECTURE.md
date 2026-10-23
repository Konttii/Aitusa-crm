# Архитектура AITUSA CRM

## Обзор

Монолитное Spring Boot 3 приложение (`kz.aitusa.crm`), обслуживающее REST API (`/api/v1/*`) и статическую сборку React Telegram Mini App (`/crm/`). Хранилище данных — **PostgreSQL 17**, распределённый кэш — **Redis 7**.

## Слои Backend (`backend/src/main/java/kz/aitusa/crm`)

```text
controller (TaskController, HealthController, SpaWebController)
    ↓
service    (TaskService, AccessService, RedisCacheService)
    ↓
security   (TelegramInitDataValidator, ActorArgumentResolver, RoleHierarchy)
    ↓
repository (TaskRepository, UserRepository, ParticipantRepository, CommitteeRepository, ...)
    ↓
entity     (Task, User, Committee, Block, Participant, RoleAssignment, VicePresidentBlock)
```

## Авторизация и Роли

- **Telegram WebApp `initData`**: заголовок `Authorization: tma <initData>` проверяется по стандарту Telegram (`HMAC-SHA256` с ключом `WebAppData` от `BOT_TOKEN`) и контролируется по времени жизни `auth_date` (`INIT_DATA_TTL`).
- **Локальный демо-режим (`DEMO_MODE=true`)**: заголовок `Authorization: tma demo:<telegramId>` позволяет локально переключаться между ролями (`Президент`, `Глава комитета`, `Участник`) без обращения к серверам Telegram.
- **Пакетное разрешение ролей (`AccessService.rolesFor`)**: роли вычисляются без проблемы `N+1` за фиксированное число запросов к БД (`users`, `participants`, `role_assignments`).

## Кэширование в Redis

- `RedisCacheService` сериализует DTO в JSON (Jackson) и сохраняет ключи с префиксом `aitusa:` в Redis, дублируя их во внутреннем in-memory буфере на случай временной недоступности брокера.
- Ключи списков задач `aitusa:tasks:list:*` автоматически инвалидируются при любых мутациях (`POST /tasks`, `PATCH /tasks/{id}`, `PATCH /tasks/{id}/status`, `POST /tasks/{id}/take`, `DELETE /tasks/{id}`).
