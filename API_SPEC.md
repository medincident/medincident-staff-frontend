# Спецификация API для системы «МедИнцидент»

Список API, которые требуется реализовать на бэкенде для покрытия клиентской части. Не дублирует методы, уже сгенерированные в основном `openapi.yml` (UsersService, OrganizationsService, ClinicsService, DepartmentsService, EventsService — последний покрывает только классификатор НС).

**База URL**: `${NEXT_PUBLIC_API_URL}` (ожидается `…/api/v1`)
**Аутентификация**: `Authorization: Bearer <JWT>` (Zitadel) для всех эндпоинтов кроме `GET /health` и `GET /push/vapid-key`.
**Формат**: JSON. Даты — ISO-8601 (UTC).
**Пагинация списков**: `?limit=<N>&cursor=<opaque>` → ответ `{ items, nextCursor?, total? }`.

---

## Содержание

1. [Инциденты (НС)](#1-инциденты-нс)
2. [Заявки](#2-заявки)
3. [Связи НС ↔ Заявок](#3-связи-нс--заявок)
4. [Чат по сущности](#4-чат-по-сущности)
5. [Уведомления](#5-уведомления)
6. [Объявления](#6-объявления)
7. [Настройки пользователя](#7-настройки-пользователя)
8. [Спец. возможности (a11y)](#8-спец-возможности-a11y)
9. [Справка / FAQ](#9-справка--faq)
10. [Web-Push](#10-web-push)
11. [Аналитика (данные для клиентской обработки)](#11-аналитика-данные-для-клиентской-обработки)
12. [Системные](#12-системные)
13. [Доменные типы](#13-доменные-типы)
14. [Перечисления (enum)](#14-перечисления-enum)
15. [Замечания для бэкенда](#15-замечания-для-бэкенда)

> **Аналитика**: все расчёты (прогноз Holt / LSTM на TensorFlow.js, детекция точек смены режима, поиск аномалий) выполняются **на клиенте** в `lib/analytics/*.ts`. От бэка нужен один лёгкий endpoint, отдающий **только те поля, что используются в аналитике** — без описаний, авторов, локаций и т. п.

---

## 1. Инциденты (НС)

### `GET /incidents` — список инцидентов

**Query**:

| Параметр | Тип | Описание |
|----------|-----|----------|
| `q` | string | Полнотекстовый поиск по коду / описанию |
| `status` | [`IncidentStatus`](#incidentstatus) | Фильтр по статусу |
| `categoryId` | string | Фильтр по категории |
| `typeId` | string | Фильтр по типу |
| `clinicId` | string | Фильтр по клинике |
| `departmentId` | string | Фильтр по отделению |
| `from`, `to` | date-time | Период по `createdAt` |
| `limit`, `cursor` | int / string | Пагинация |

**Ответ `200`**:
```json
{
  "items": [/* IncidentEvent[] */],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### `POST /incidents` — создать инцидент

**Body**:
```json
{
  "categoryId": "string",
  "typeId": "string",
  "description": "string?",
  "location": "string?",
  "severity": "string?"
}
```

**Ответ `201`**: [`IncidentEvent`](#incidentevent) (бэк генерирует `code` вида `INC-XXXX`, ставит `status: "created"`, `createdAt`, проставляет `authorId` из JWT).

---

### `GET /incidents/{id}` — получить инцидент

**Ответ `200`**: [`IncidentEvent`](#incidentevent)

---

### `PATCH /incidents/{id}` — обновить инцидент

**Body** (все поля опциональны):
```json
{
  "categoryId": "string?",
  "typeId": "string?",
  "description": "string?",
  "location": "string?",
  "severity": "string?"
}
```

**Ответ `200`**: [`IncidentEvent`](#incidentevent)

---

### `PATCH /incidents/{id}/status` — сменить статус

**Body**:
```json
{ "status": "created | in_work | investigation | measures | completed | closed" }
```

**Ответ `200`**: [`IncidentEvent`](#incidentevent)

---

### `DELETE /incidents/{id}` — удалить (или архивировать)

**Ответ `204`** — без тела.

---

### `GET /incidents/{id}/linked-requests` — заявки, привязанные к этому инциденту

**Ответ `200`**:
```json
{ "items": [/* ServiceRequest[] */] }
```

---

## 2. Заявки

### `GET /requests` — список заявок

**Query**:

| Параметр | Тип | Описание |
|----------|-----|----------|
| `q` | string | Поиск по описанию / номеру |
| `status` | [`RequestStatus`](#requeststatus) | |
| `priority` | [`RequestPriority`](#requestpriority) | |
| `type` | string | Код службы |
| `linkedEventId` | string | Только привязанные к этому НС |
| `responsibleDept` | string | Фильтр по отделу-исполнителю |
| `from`, `to` | date-time | Период по `createdAt` |
| `limit`, `cursor` | int / string | Пагинация |

**Ответ `200`**:
```json
{
  "items": [/* ServiceRequest[] */],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### `POST /requests` — создать заявку

**Body**:
```json
{
  "type": "string",
  "priority": "normal | high | critical",
  "description": "string",
  "location": "string",
  "linkedEventId": "string?"
}
```

**Ответ `201`**: [`ServiceRequest`](#servicerequest) (бэк генерирует `number`, ставит `createdAt`, `status: "created"`, проставляет `responsibleDept` исходя из `type`).

---

### `GET /requests/{id}` — получить заявку

**Ответ `200`**: [`ServiceRequest`](#servicerequest)

---

### `PATCH /requests/{id}` — обновить заявку

**Body** (все поля опциональны):
```json
{
  "type": "string?",
  "priority": "RequestPriority?",
  "description": "string?",
  "location": "string?",
  "linkedEventId": "string | null",
  "executorId": "string?"
}
```

> `linkedEventId: null` означает «снять привязку».

**Ответ `200`**: [`ServiceRequest`](#servicerequest)

---

### `PATCH /requests/{id}/status` — сменить статус

**Body**:
```json
{ "status": "created | in_work | purchase | completed | refused | cancelled" }
```

При переходе в `completed` бэк ставит `completedAt`.

**Ответ `200`**: [`ServiceRequest`](#servicerequest)

---

### `PATCH /requests/{id}/assign` — назначить исполнителя

**Body**:
```json
{ "executorId": "string" }
```

**Ответ `200`**: [`ServiceRequest`](#servicerequest)

---

### `DELETE /requests/{id}` — удалить заявку

**Ответ `204`** — без тела.

---

## 3. Связи НС ↔ Заявок

### `POST /incidents/{id}/links` — привязать существующую заявку

Перезаписывает прежний `linkedEventId` у заявки (то есть позволяет «перепривязать» с одного НС на другое).

**Body**:
```json
{ "requestId": "string" }
```

**Ответ `200`**: [`ServiceRequest`](#servicerequest) (с обновлённым `linkedEventId`).

---

### `DELETE /incidents/{id}/links/{requestId}` — отвязать

**Ответ `204`** (`linkedEventId` у заявки становится `null`).

---

## 4. Чат по сущности

`{entity}` ∈ `incidents | requests`.

### `GET /{entity}/{id}/messages` — история сообщений

**Query**:

| Параметр | Тип | Описание |
|----------|-----|----------|
| `before` | date-time | Курсор: получить сообщения, отправленные до указанного момента |
| `limit` | int | По умолчанию 50 |

**Ответ `200`**:
```json
{
  "items": [/* ChatMessage[] */],
  "nextCursor": "string | null"
}
```

---

### `POST /{entity}/{id}/messages` — отправить сообщение

**Body**:
```json
{ "text": "string" }
```

`senderId` бэк подставляет из JWT — фронт не передаёт.

**Ответ `201`**: [`ChatMessage`](#chatmessage)

---

### Опционально: `WebSocket /ws/messages?entity=…&id=…`

Push-доставка новых сообщений в реальном времени. На первом этапе можно обойтись polling-ом по `GET /{entity}/{id}/messages`.

---

## 5. Уведомления

### `GET /notifications` — список уведомлений текущего пользователя

**Query**: `unreadOnly?: boolean`, `limit?: int`, `cursor?: string`.

**Ответ `200`**:
```json
{
  "items": [/* Notification[] */],
  "unreadCount": 0,
  "nextCursor": "string | null"
}
```

---

### `POST /notifications/{id}/read` — пометить прочитанным

**Ответ `204`**.

---

### `POST /notifications/read-all` — пометить все прочитанными

**Ответ `200`**:
```json
{ "markedCount": 0 }
```

---

### `DELETE /notifications/{id}` — удалить уведомление

**Ответ `204`**.

---

## 6. Объявления

Глобальные объявления (видны всем сотрудникам клиники).

### `GET /announcements` — список

**Ответ `200`**:
```json
{ "items": [/* Announcement[] */] }
```

---

### `POST /announcements` — создать (только админ)

**Body**:
```json
{
  "title": "string",
  "content": "string",
  "priority": "high | normal"
}
```

**Ответ `201`**: [`Announcement`](#announcement)

---

### `PATCH /announcements/{id}` — изменить

**Body**: те же поля, что в `POST`.
**Ответ `200`**: [`Announcement`](#announcement)

---

### `DELETE /announcements/{id}` — удалить

**Ответ `204`**.

---

## 7. Настройки пользователя

### `GET /users/me/settings` — текущие настройки

**Ответ `200`**: [`UserSettings`](#usersettings)

---

### `PUT /users/me/settings` — обновить

**Body**: [`UserSettings`](#usersettings)
**Ответ `200`**: [`UserSettings`](#usersettings)

---

## 8. Спец. возможности (a11y)

> Опционально — сейчас хранится только в `localStorage`. Если нужно синхронизировать между устройствами одного пользователя — добавьте.

### `GET /users/me/accessibility`
**Ответ `200`**: [`A11ySettings`](#a11ysettings)

### `PUT /users/me/accessibility`
**Body**: [`A11ySettings`](#a11ysettings)
**Ответ `200`**: [`A11ySettings`](#a11ysettings)

---

## 9. Справка / FAQ

### `GET /help/faq` — часто задаваемые вопросы

**Ответ `200`**:
```json
{ "items": [/* FaqItem[] */] }
```

---

### `GET /help/documents` — список инструкций / приказов (PDF и т. п.)

**Ответ `200`**:
```json
{ "items": [/* HelpDocument[] */] }
```

---

## 10. Web-Push

### `GET /push/vapid-key` — публичный VAPID-ключ

> Без авторизации — нужен сервис-воркеру до подписки.

**Ответ `200`**:
```json
{ "key": "BL4Q…<base64url>" }
```

---

### `POST /push/subscribe` — сохранить подписку

**Body**:
```json
{
  "endpoint": "https://…",
  "keys": {
    "p256dh": "string",
    "auth": "string"
  },
  "userAgent": "string?"
}
```

**Ответ `201`**:
```json
{ "id": "string" }
```

---

### `DELETE /push/subscribe` — отписаться

**Body**:
```json
{ "endpoint": "https://…" }
```

**Ответ `204`**.

---

### `POST /push/test` — тестовая отправка (админ / QA)

**Body**:
```json
{
  "userId": "string?",
  "title": "string",
  "body": "string"
}
```

**Ответ `200`**:
```json
{ "delivered": 1, "failed": 0 }
```

---

## 11. Аналитика (данные для клиентской обработки)

> Все вычисления (прогноз нагрузки Holt / LSTM, детекция точек смены режима, поиск аномалий) выполняются **в браузере**. Бэк отдаёт минимально необходимый "сырой" набор полей — без описаний, авторов, ID, мест и т. п.

### `GET /analytics/snapshot` — данные за период (НС + заявки одним запросом)

**Query**:

| Параметр | Обязат. | Тип | Описание |
|----------|---------|-----|----------|
| `from` | да | date-time | Начало периода (включительно) |
| `to` | да | date-time | Конец периода (включительно) |
| `clinicId` | нет | string | Ограничить выборкой одной клиники |
| `departmentId` | нет | string | Ограничить выборкой одного отделения |

> Совет: чтобы за один вызов покрыть и текущий, и предыдущий период (для расчёта дельт), фронт передаёт `from = prevStart`, `to = currentEnd` и сам разбивает данные в памяти.

**Ответ `200`**:
```json
{
  "events": [
    {
      "createdAt": "2026-04-12T10:24:00Z",
      "status": "in_work",
      "categoryId": "cat_falls",
      "categoryName": "Падения пациентов"
    }
  ],
  "requests": [
    {
      "createdAt": "2026-04-12T11:08:00Z",
      "completedAt": "2026-04-12T15:30:00Z",
      "status": "completed",
      "priority": "high",
      "type": "electric",
      "responsibleDept": "ЭТО (электрики)"
    }
  ]
}
```

**Замечания**:

- Без описаний, локаций, кодов, авторов, исполнителей — только то, что реально используется в `app/(main)/reports/view.tsx` и `lib/analytics/*.ts`.
- `categoryName` и `responsibleDept` — для подписей графиков (распределения по категориям и отделам). Если бэку дешевле отдавать только ID — можно так, тогда фронт подтянет имена из справочника.
- Ответ может быть большим (год = ~365 точек × ~30 заявок/день = ~11 тыс. записей), но каждая запись — несколько байт, так что суммарно укладывается в десятки KB.
- Если в будущем данных станет много — добавить параметр `granularity=day|week` и возвращать **уже агрегированные** корзины с количествами вместо сырого списка событий.

---

## 12. Системные

### `GET /health` — проверка живости

> Без авторизации.

**Ответ `200`**:
```json
{ "status": "ok", "version": "1.4.2", "build": "2026-04-21T10:30:00Z" }
```

---

### `GET /me/permissions` — скоупы текущего пользователя

> Нужен только если скоупы не зашиты в JWT-токен.

**Ответ `200`**:
```json
{ "scopes": ["requests:read:all", "events:write:own"] }
```

---

## 13. Доменные типы

### `IncidentEvent`

```ts
{
  id: string;
  code: string;                  // INC-1234, генерируется бэком
  categoryId: string;
  categoryName?: string;
  typeId: string;
  typeName?: string;
  description?: string;
  location?: string;
  severity?: string;
  status: IncidentStatus;
  authorId?: string;
  author: string;                // Имя автора для отображения
  clinicId?: string;
  departmentId?: string;
  createdAt: string;             // ISO-8601
}
```

---

### `ServiceRequest`

```ts
{
  id: string;
  number: number;                // Генерируется бэком
  type: string;                  // Код службы (electric / sanitary / it_support / …)
  typeName?: string;
  priority: RequestPriority;
  status: RequestStatus;
  description: string;
  location: string;
  authorId?: string;
  authorName: string;
  responsibleDept: string;       // Название отдела
  executorId?: string;
  linkedEventId?: string | null; // null — связь снята
  createdAt: string;
  completedAt?: string;          // Заполняется при переходе в "completed"
}
```

---

### `ChatMessage`

```ts
{
  id: string;
  entityType: "incidents" | "requests";
  entityId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  edited?: boolean;
}
```

---

### `Notification`

```ts
{
  id: string;
  title: string;
  desc: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;                 // Внутренний путь SPA, например /events/INC-12
  entityType?: "incidents" | "requests" | null;
  entityId?: string | null;
}
```

---

### `Announcement`

```ts
{
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  createdAt: string;
  authorId: string;
}
```

---

### `UserSettings`

```ts
{
  emailNotification: boolean;
  quietMode: {
    enabled: boolean;
    from: string;                // "HH:MM"
    to:   string;                // "HH:MM"
    days: number[];              // 0=Пн, 6=Вс
  };
}
```

---

### `A11ySettings`

```ts
{
  grayscale: boolean;
  fontScale: 0.9 | 1 | 1.125 | 1.25;
}
```

---

### `FaqItem`

```ts
{
  id: string;
  question: string;
  answer: string;
  order?: number;
}
```

---

### `HelpDocument`

```ts
{
  id: string;
  title: string;
  url: string;                   // Прямая ссылка на PDF/файл
  size?: string;                 // "2.4 MB"
  updatedAt?: string;
}
```

---

### `PushSubscriptionInput`

```ts
{
  endpoint: string;              // URL push-сервиса браузера
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}
```

---

### `Error`

```ts
{
  code: string;
  message: string;
  details?: object;
}
```

---

## 14. Перечисления (enum)

### `IncidentStatus`
```
created | in_work | investigation | measures | completed | closed
```

### `RequestStatus`
```
created | in_work | purchase | completed | refused | cancelled
```

### `RequestPriority`
```
normal | high | critical
```

### `NotificationType`
```
info | success | warning | error
```

### `AnnouncementPriority`
```
high | normal
```

---

## 15. Замечания для бэкенда

- **Идентификаторы кодов** (`IncidentEvent.code` вида `INC-1234`, `ServiceRequest.number` целое число) **генерирует бэк** — фронт никогда не пытается их подставить.
- **Авторство** (`authorId`, `authorName`, `senderId`, `senderName`) бэк проставляет из JWT-токена — клиент эти поля в запросах не передаёт.
- **Авторизация**: все эндпоинты под Bearer JWT (Zitadel), кроме `GET /health` и `GET /push/vapid-key`. Скоупы — те же, что в `lib/auth/scopes.ts` (`requests:read:all`, `events:write:own`, `admin:system` и т. д.).
- **`linkedEventId: null`** в `PATCH /requests/{id}` — это команда «снять привязку». Не путать с отсутствием поля (которое означает «не менять»).
- **`POST /incidents/{id}/links`** перезаписывает существующий `linkedEventId` у заявки — фронт ожидает именно такое поведение, чтобы можно было перепривязать заявку с одного НС на другое одним кликом.
- **`UserSettings.quietMode.days`**: `0=Пн`, `1=Вт`, …, `6=Вс`. Не путать с привычным в JS `Date.getDay()`, где `0=Вс`.
- **Уведомления должны создаваться бэком автоматически** при доменных событиях: новая заявка → ответственному; смена статуса → автору; новое сообщение в чате → второй стороне. Это серверная бизнес-логика, отдельных API для «отправить уведомление» от фронта не требуется.
- **Идемпотентность**: `POST /push/subscribe` с тем же `endpoint` не должен создавать дубликат — обновляйте существующую запись.
- **Soft-delete vs hard-delete** для инцидентов и заявок — на усмотрение бэка, но возвращайте `204` в обоих случаях.
- **Размер ответов**: `GET /incidents` и `GET /requests` могут возвращать сотни записей — обязательно реализуйте `limit`/`cursor`-пагинацию, чтобы фронт мог подгружать списки порциями.
