# CLAUDE.md — контекст и правила работы над проектом MedIncident

Этот файл — системный контекст для Claude Code. Читай его перед любой задачей. Здесь зафиксированы стек, архитектура, соглашения и правила работы, специфичные для этого репозитория.

> ⚠️ Если в ходе работы обнаружишь расхождение между этим файлом и реальным кодом — доверяй коду, а CLAUDE.md предлагай обновить.

---

## 1. Что это за проект

**MedIncident** — веб/PWA-приложение для медицинских организаций:
мониторинг нежелательных событий (НС / инцидентов) и заявок на техническое обслуживание (заявки в АХО, ИТ, инженерные службы и т.д.).

- Интерфейс полностью **на русском** языке.
- Предназначено для ролей: врачи, диспетчеры, ответственные, главврачи, админы организаций и системы, гости (только аналитика).
- Устанавливается как PWA (offline-очередь + push-уведомления).

---

## 2. Технологический стек

### Frontend (корень репозитория)
- **Next.js 16** (App Router, **Webpack**, не Turbopack — `next dev --webpack`)
- **React 19** + **TypeScript 5** (strict, `moduleResolution: bundler`, `target: ES2017`)
- **Tailwind CSS v4** (`@tailwindcss/postcss`) — конфиг через CSS-переменные в [app/globals.css](app/globals.css), без `tailwind.config.*`
- **shadcn/ui** (style: `new-york`, baseColor: `slate`, rsc: true) + **Radix UI** primitives — см. [components.json](components.json)
- **lucide-react** — единственная иконотека (кроме локального [components/icons/med-incident-logo.tsx](components/icons/med-incident-logo.tsx))
- **next-themes** — dark/light/system темы
- **@ducanh2912/next-pwa** + **Workbox** — сервис-воркер из [app/sw.ts](app/sw.ts)
- **NextAuth v4** + провайдер **Zitadel** (OAuth/OIDC, роли через `urn:zitadel:iam:user:project:roles`)
- **Prisma 6** + PostgreSQL — схема минимальная: `User`, `PushSubscription` ([prisma/schema.prisma](prisma/schema.prisma)); клиент генерируется в `lib/generated/prisma` (в .gitignore)
- **axios** — транспорт для сгенерированного API-клиента
- **openapi-typescript-codegen** — генерит клиент из [openapi.yml](openapi.yml) в [lib/api-generated/](lib/api-generated/)
- **react-hook-form** + **zod** + **@hookform/resolvers** — все формы
- **zustand** — в зависимостях, но в коде пока не используется (стейт на `useState`/`useEffect`)
- **recharts** — графики/аналитика (обёртка + кастомный `ForecastChart` со ступенькой «сегодня», зоной 95% ДИ и маркерами change-points)
- **@tensorflow/tfjs** — лёгкая LSTM для прогноза нагрузки в отчётах, обучается прямо в браузере. Загружается **динамическим импортом** только на странице отчётов — чтобы не пухнуть бандл других страниц.
- **sonner** — тосты
- **web-push** + VAPID — серверные пуш-уведомления
- **class-variance-authority**, **clsx**, **tailwind-merge** — через хелпер [lib/utils.ts](lib/utils.ts) `cn()`

### Backend (директория `backend/`)
- **Python 3.13** + **Flask** + **flask-cors**, менеджер зависимостей — **uv** ([backend/pyproject.toml](backend/pyproject.toml))
- Это **mock-API**: [backend/app.py](backend/app.py) отдаёт фиксированные данные и имитирует 200/201/204 на любые мутации
- Реальный API живёт по адресу из `NEXT_PUBLIC_API_URL` (см. [.env](.env))

### Deploy
- Docker Compose: сервис `api` (Flask) и `nextjs` — см. [docker-compose.yml](docker-compose.yml)
- Dockerfiles: [deployment/site.Dockerfile](deployment/site.Dockerfile) (multi-stage, `node:20-alpine`), [deployment/api.Dockerfile](deployment/api.Dockerfile) (uv + python3.13-alpine)

---

## 3. Структура репозитория

```
app/                    # Next.js App Router
  (main)/               # Route-группа защищённого приложения (общий layout)
    layout.tsx          # Sidebar + Header + BottomNav
    dashboard/          # Главная
    events/             # События (НС)  — page.tsx | view.tsx | [id]/ | new/
    requests/           # Заявки        — page.tsx | view.tsx | [id]/ | new/
    notifications/
    reports/
    profile/            # Профиль + /settings + /help
    admin/              # Админка (organizations, structure, department, classifier, users)
  actions/push.ts       # Server Actions для web-push (subscribe/unsubscribe/send)
  api/auth/[...nextauth]/route.ts   # Обработчик NextAuth
  login/page.tsx        # Auto-redirect на Zitadel signIn
  offline/              # PWA offline-страница
  layout.tsx            # Корневой layout (провайдеры, шрифт Geist, Toaster)
  manifest.ts           # PWA-манифест
  sw.ts                 # Service Worker (Workbox + push + offline-queue)
  globals.css           # Tailwind v4 + CSS-переменные темы

components/
  ui/                   # shadcn/ui компоненты (не трогай без необходимости)
  layout/               # header.tsx, sidebar.tsx, bottom-nav.tsx
  providers/            # ThemeProvider, SessionProvider, ApiProvider, ThemeColorManager, MiniAppInit
  auth/role-gate.tsx    # Серверный guard по scope
  pwa/                  # service-worker-register, install-prompt, push-manager, offline-view
  events/, requests/    # Формы сущностей (react-hook-form + zod)
  charts/               # DynamicChart (shadcn-обёртка recharts) + ForecastChart (кастом с прогнозом + change-points)
  chat/                 # Чат-контейнер на сущности
  icons/                # Локальные SVG-иконки

lib/
  api/index.ts          # Единственный канонический ре-экспорт сгенеренного клиента + установка OpenAPI.BASE
  api-generated/        # АВТОГЕНЕРАЦИЯ — не редактировать руками
    core/               # OpenAPI config, request, ApiError, CancelablePromise
    models/             # DTO
    services/           # *Service.ts: ClinicsService, DepartmentsService, EventsService, OrganizationsService, UsersService
  analytics/            # Аналитические модули для отчётов (чистый TS, независимы от UI)
    forecast.ts         # Holt (двойное экспоненциальное сглаживание) + 95% ДИ
    lstm-forecast.ts    # Async LSTM через @tensorflow/tfjs — та же сигнатура, что у forecastHolt
    change-points.ts    # Бинарная сегментация с t-тестом Уэлча (детекция сдвига уровня)
  auth/
    auth-options.ts     # authOptions NextAuth + refreshAccessToken
    scopes.ts           # SCOPES константа + Scope type
    session.ts          # getSession() серверный хелпер
  a11y.ts               # Спец. возможности: grayscale + масштаб шрифта, сохраняются в localStorage
  miniapp.ts            # Детект Telegram.WebApp / MAX UA + useMiniApp() хук
  constants.ts          # APP_CONFIG, THEME_COLORS, *_MAP локализация
  types.ts              # Доменные типы (User, ServiceRequest, IncidentEvent, и т.д.)
  mock-db.ts            # Большой in-memory mock + getAnalyticsSeed() для отчётов
  status-helper.ts      # getBadgeColor, getCardBorderColor, CHART_COLORS, enrichChartData
  utils.ts              # cn()
  db.ts                 # Синглтон Prisma

backend/app.py          # Flask mock-API
deployment/             # Dockerfile-ы
prisma/schema.prisma    # User + PushSubscription
middleware.ts           # Заглушка: пропускает всё, кроме статики/auth
next.config.ts          # withPWA + security headers + dev-хак алиаса `@/lib/services/events`
openapi.yml             # Исходник для codegen
eslint.config.mjs       # next/core-web-vitals + next/typescript
tsconfig.json           # paths: "@/*": ["./*"]
```

---

## 4. Архитектурные соглашения

### 4.1 Паттерн страниц: `page.tsx` + `view.tsx`
Почти каждый маршрут в `app/(main)/**/` состоит из двух файлов:

- **`page.tsx`** — серверный компонент. Экспортирует `metadata` (title через шаблон `%s | MedIncident`), рендерит `<XxxView />`.
- **`view.tsx`** — клиентский компонент с `"use client"`. Держит стейт, загрузку данных, UI.

**Следуй этому паттерну**, когда добавляешь новые страницы. Пример: [app/(main)/dashboard/page.tsx](app/(main)/dashboard/page.tsx) + [app/(main)/dashboard/view.tsx](app/(main)/dashboard/view.tsx).

### 4.2 API-клиент
- Никогда не делай fetch напрямую к бэкенду из компонентов. Используй сервисы из `@/lib/api`:
  ```ts
  import { UsersService, ClinicsService, DepartmentsService, EventsService, OrganizationsService } from "@/lib/api";
  ```
- Файлы в [lib/api-generated/](lib/api-generated/) **автогенерируются**. Не правь вручную — изменения затрутся при следующем codegen.
- Базовый URL берётся из `NEXT_PUBLIC_API_URL` (с фоллбеком `http://localhost:8080/api/v1`) и выставляется в двух местах: [lib/api/index.ts](lib/api/index.ts) и [components/providers/api-provider.tsx](components/providers/api-provider.tsx).
- Bearer-токен прокидывается в `OpenAPI.TOKEN` из NextAuth-сессии в [ApiProvider](components/providers/api-provider.tsx). На 401 — автоматический `signOut()`.

### 4.3 Аутентификация и авторизация
- Логин: [app/login/page.tsx](app/login/page.tsx) сразу вызывает `signIn("zitadel")`.
- Обработчик NextAuth: [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts).
- Scopes берутся из Zitadel-клейма `urn:zitadel:iam:user:project:roles` и кладутся в JWT. Смотри [lib/auth/auth-options.ts](lib/auth/auth-options.ts).
- Access-токен рефрешится автоматически за 60 секунд до истечения.
- Проверка прав на сервере: компонент [RoleGate](components/auth/role-gate.tsx) (поддерживает `requireAll` и fallback; `admin:system` — суперюзер).
- Клиентский хук — `useSession()` из `next-auth/react` (через [NextAuthSessionProvider](components/providers/session-provider.tsx)).
- Константы scope — в [lib/auth/scopes.ts](lib/auth/scopes.ts). **Не** изобретай свои строки — используй `SCOPES.REQUESTS_READ_ALL` и т.д.

### 4.4 Роли и домен
- Каталог ролей: `UserRole` в [lib/types.ts](lib/types.ts). Локализация ролей: `ROLE_NAMES` в [lib/constants.ts](lib/constants.ts).
- Домен имеет две ключевые сущности: `ServiceRequest` (заявка) и `IncidentEvent` (НС). У обоих — свои статусы, приоритеты, исполнители. Мэппинги статусов — `STATUS_MAP`, `EVENT_STATUS_MAP`, `PRIORITY_MAP` в [lib/constants.ts](lib/constants.ts).

### 4.5 Цвета и статусы
- Единая палитра «намерений» (intents: info/warning/purple/success/destructive/muted) описана в [lib/status-helper.ts](lib/status-helper.ts).
- Для бейджей статусов — `getBadgeColor("in_work")`, для левой полосы карточки — `getCardBorderColor`, для иконок — `getIconColor`, для графиков — `CHART_COLORS` + `enrichChartData`.
- **Не захардкоживай** `bg-green-500`/`text-red-400` и т.п. Используй семантические токены Tailwind (`bg-primary`, `text-warning`, `border-destructive/20`) и хелперы выше.

### 4.6 Темизация
- Тема управляется `next-themes` через [ThemeProvider](components/providers/theme-provider.tsx) (attribute="class", defaultTheme="system", enableSystem).
- Цвета — HSL-переменные в [app/globals.css](app/globals.css) под `:root` и `.dark`.
- Для мета-тега `theme-color` есть [ThemeColorManager](components/providers/theme-color-manager.tsx) + `THEME_COLORS` в [lib/constants.ts](lib/constants.ts).

### 4.7 Формы
- Шаблон: `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: ... })`.
- UI-обёртки — `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>` из [components/ui/form.tsx](components/ui/form.tsx).
- Для селектов с поиском — [SearchableSelect](components/ui/searchable-select.tsx) (поверх cmdk/popover).
- Тосты об успехе/ошибке — `toast.success(...)` / `toast.error(...)` из `sonner`.
- Примеры: [components/requests/request-form.tsx](components/requests/request-form.tsx), [components/events/event-form.tsx](components/events/event-form.tsx).

### 4.8 PWA
- Сервис-воркер собирается из [app/sw.ts](app/sw.ts) в `public/sw.js` при билде. В `public/sw.js*` и `public/workbox-*.js*` — gitignore.
- Стратегия: precache всего манифеста, **все мутации (POST/PUT/DELETE/PATCH) идут через `NetworkOnly` + `BackgroundSyncPlugin`** (очередь `medincident-offline-queue`, 24 ч retention).
- Push: обработчик `push` показывает уведомление, `notificationclick` открывает/фокусит окно с `data.url`.
- VAPID-ключи: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`. Server Action — [app/actions/push.ts](app/actions/push.ts) (**внимание**: сейчас использует in-memory `MOCK_SUBSCRIPTIONS` и фейкового пользователя; при переходе на реальное хранилище пиши через `db` + модель `PushSubscription`).
- PWA отключён в dev: `disable: process.env.NODE_ENV === "development"` в [next.config.ts](next.config.ts).

### 4.9 Моки vs реальный API
- В репозитории одновременно живут:
  - реальный API-клиент (`UsersService.getMe()` и т.д.),
  - большой [lib/mock-db.ts](lib/mock-db.ts) (статические массивы `eventsDb`, `requestsDb`, `CLASSIFIER_DB`, `MOCK_NOTIFICATIONS`, `MOCK_ANNOUNCEMENTS` и т.д.),
  - Flask-моки в [backend/app.py](backend/app.py).
- Многие `view.tsx` **одновременно** зовут `UsersService.getMe()` и читают моки. Когда переводишь страницу на реальный API — **удаляй** импорты из `mock-db`.
- В [next.config.ts](next.config.ts) есть dev-хак: `@/lib/services/events` в dev резолвится в пустой объект. Не удаляй его, пока не убедишься, что реальный `lib/services/events` не подключается.

### 4.10 Аналитика и ML (страница отчётов)
Все расчёты — **клиентские**, данные берём как есть из реального API; Python-бэк для аналитики не нужен.

- **Прогноз нагрузки** ([lib/analytics/forecast.ts](lib/analytics/forecast.ts), [lib/analytics/lstm-forecast.ts](lib/analytics/lstm-forecast.ts)):
  - Дефолт — Holt (синхронный, моментальный).
  - При выборе LSTM в переключателе карточки «Прогноз нагрузки» подключается модель из tfjs через `await import(...)` (dynamic import) — **никогда** не импортируй `@tensorflow/tfjs` статически в отчётах, это вздует бандл всего раздела.
  - Обе функции возвращают одну и ту же структуру `ForecastResult` с `points[]` и 95% доверительным интервалом — взаимозаменяемы.
  - Результат LSTM кэшируется по `forecastSeriesKey` (хеш исторической серии), чтобы не переобучаться на каждый ререндер.
- **Change points** ([lib/analytics/change-points.ts](lib/analytics/change-points.ts)): бинарная сегментация + Welch t-test, рисуются вертикальными маркерами на `ForecastChart` и списком в карточке «Точки смены режима».
- **Визуализация** ([components/charts/forecast-chart.tsx](components/charts/forecast-chart.tsx)): `ComposedChart` с `Area` (история + 95% ДИ) + `Line` (пунктирный прогноз) + `ReferenceLine` «сегодня» и для каждой change-point. **Не** переиспользуй для других графиков — специфичен под прогноз.
- **Аномалии**: σ-based по корзинам, считаются в самом [app/(main)/reports/view.tsx](app/(main)/reports/view.tsx) (в `useMemo`) — не выносим в отдельный модуль, пока алгоритм простой.
- **Цветовая конвенция на графике отчётов**: линии `Заявки` — синие (`#3b82f6`), `Инциденты` — оранжевые (`#f59e0b`). Но **маркеры change-points**: для `Заявки` — оранжевые, для `Инциденты` — синие (инверсия по пользовательскому запросу, чтобы подпись контрастировала с линией).

### 4.11 Связь «НС ↔ Заявка»
- В `ServiceRequest.linkedEventId` хранится id события (ссылка "много к одному"). Событие просто фильтрует `requestsDb` по этому полю.
- В форме заявки ([components/requests/request-form.tsx](components/requests/request-form.tsx)) есть видимый `SearchableSelect` для привязки + pre-fill через query-параметр `?linkedEventId=...`.
- В детали события ([app/(main)/events/[id]/view.tsx](app/(main)/events/[id]/view.tsx)) — карточка «Связанные заявки» с кнопками «Создать связанную» (переход в форму с pre-fill) и «Привязать существующую» (диалог с `SearchableSelect`). На списке — иконка «Отвязать» (видна всегда на мобильной, по hover на десктопе).
- Мутации `requestsDb` не триггерят ререндер сами — поднимай `requestsVersion` state и добавляй его в deps `useMemo`.

### 4.12 Специальные возможности и мини-аппа
- **A11y** ([lib/a11y.ts](lib/a11y.ts)): `grayscale` флаг (через класс `a11y-grayscale` на `<html>`) + `fontScale` множитель (применяется как `font-size: Npct%` на `<html>`, все rem-утилиты Tailwind масштабируются). Сохраняется в `localStorage` под ключом `medincident_a11y`. UI — [app/(main)/profile/accessibility/view.tsx](app/(main)/profile/accessibility/view.tsx).
- При больших `fontScale` на мобильной могут ломать вёрстку flex-дети без `min-w-0` — у нас это уже заложено в заголовках шапок (`min-w-0 flex-1` на текстовом блоке) и в `<main>` в [app/(main)/layout.tsx](app/(main)/layout.tsx) (`min-w-0 overflow-x-hidden`). Не убирай эти классы.
- **Mini-app** ([lib/miniapp.ts](lib/miniapp.ts), [components/providers/miniapp-init.tsx](components/providers/miniapp-init.tsx)): детект Telegram.WebApp и MAX UA → ставит `data-miniapp="1"` на `<html>`, синкает CSS-переменную `--dvh` с `window.innerHeight` (и на `visualViewport.resize` — для клавиатуры). Сайдбар, нижнее меню и install-prompt сами ховаются в мини-аппе через `useMiniApp()`.

### 4.13 Паттерн детальных страниц (events/[id], requests/[id])
- `DetailsSection` — это **отдельно именованный компонент в том же файле**, а не inline внутри рендера родителя. Инлайн-паттерн приводит к unmount/remount на каждый ререндер (теряется состояние, гаснет фокус). Если добавляешь подобный раздел — делай так же.
- Заголовок карточки деталей: `line-clamp-2 break-words` для `<h1>`, badge статуса в отдельной flex-строке с `flex-wrap` — иначе при длинных номерах/кодах + scaled-шрифте ломает мобильную вёрстку.
- Breakpoint «мобильная карточка ↔ таблица» на списках заявок и НС — `2xl` (1536px). На `xl` и меньше — карточная вёрстка (по пользовательскому решению).

---

## 5. Стиль написания кода

### 5.1 Общее
- **Язык**: комментарии и пользовательские строки — на **русском**. Не переводи существующие русские комментарии на английский.
- Импорты абсолютные через алиас `@/` (корень репозитория). `paths` уже настроены в [tsconfig.json](tsconfig.json).
- Серверные компоненты по умолчанию. Клиентские — только с явным `"use client"` на первой строке.
- `export default function PageName()` для страниц; именованные экспорты (`export function XxxView`) для view и компонентов.

### 5.2 TypeScript
- `strict: true` — соблюдай. Не пихай `any`, если можно уточнить тип. Исключение — пока устаканивается форма DTO (в коде уже есть `useState<any>(null)` для `user` — это временно, не копируй паттерн в новые места без причины).
- Для session часто используются `(session as any).accessToken` / `(session as any).scopes` — это связано с тем, что кастомные поля не тайпизированы в `next-auth`. Если будешь расширять — сделай нормальный `declare module "next-auth"`.
- DTO и ответы API — всегда из `@/lib/api` (сгенерированные типы). Не дублируй типы руками.

### 5.3 Стили
- Tailwind v4 с кастомными токенами. Приоритет: **семантические классы** (`bg-card`, `text-muted-foreground`, `border-destructive/20`) > утилиты.
- Для условных классов — `cn(...)` из `@/lib/utils`.
- В shadcn-компонентах используются варианты через `class-variance-authority`. При кастомизации компонентов `components/ui/*` учитывай существующие варианты, не ломай API.
- `.pb-safe` для `env(safe-area-inset-bottom)` (iOS).

### 5.4 shadcn/ui
- Добавление новых компонентов — через shadcn CLI с настройками из [components.json](components.json) (`style: new-york`, `baseColor: slate`, `rsc: true`, `iconLibrary: lucide`).
- Алиасы: `components` → `@/components`, `ui` → `@/components/ui`, `lib` → `@/lib`, `utils` → `@/lib/utils`, `hooks` → `@/hooks`.

### 5.5 Навигация
- Используй `<Link>` из `next/link` и `useRouter()` из `next/navigation`.
- Структура навигации задана в [components/layout/sidebar.tsx](components/layout/sidebar.tsx) (desktop) и [components/layout/bottom-nav.tsx](components/layout/bottom-nav.tsx) (mobile). `isAdmin = true` там пока **захардкожено** — при внедрении настоящих прав читать через `useSession()` + scope check.

---

## 6. Команды

```bash
npm run dev      # next dev --webpack (PWA отключён в dev)
npm run build    # next build --debug-prerender --webpack
npm run start    # next start (production)
npm run lint     # eslint (next/core-web-vitals + next/typescript)
```

Для codegen API-клиента (когда меняется [openapi.yml](openapi.yml)):
```bash
npx openapi-typescript-codegen --input openapi.yml --output lib/api-generated --client axios
```
(точный флаг смотри в истории CI/README — в `package.json` скрипт не зафиксирован).

Prisma:
```bash
npx prisma generate    # сгенерирует клиент в lib/generated/prisma
npx prisma migrate dev # миграции (директория prisma/migrations ещё не создана)
```

Backend (mock):
```bash
cd backend && uv sync && uv run python app.py   # слушает :3232
```

Docker:
```bash
docker compose up --build
```

---

## 7. Переменные окружения

Обязательные (см. [.env](.env)):
- `NEXT_PUBLIC_API_URL` — URL реального API (виден клиенту)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `ZITADEL_ISSUER`, `ZITADEL_CLIENT_ID`, `ZITADEL_CLIENT_SECRET`

Опциональные:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — включают реальные push-и (иначе — только моковый `console.log`)
- `DATABASE_URL` — для Prisma (PostgreSQL)

`.env*` в `.gitignore` — **не коммить секреты**.

---

## 8. Безопасность

- Security-заголовки выставлены в [next.config.ts](next.config.ts): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Для `/sw.js` отдельный CSP: `connect-src 'self' https://id-medincident.ulbwa.bombomeow.ru` — если меняешь хост API, **обнови CSP**.
- [middleware.ts](middleware.ts) сейчас — no-op. Матчер исключает `api/auth`, статику и PWA-ресурсы. При добавлении серверных редиректов/guard-ов правь здесь.
- Токен в `Authorization: Bearer` ставится генератором через `OpenAPI.TOKEN`. Не логируй токены.

---

## 9. Правила взаимодействия со мной (Claude)

1. **Русский интерфейс**: все новые пользовательские строки — на русском. Не «модернизируй» на английский существующие.
2. **Не правь сгенерированный код** в [lib/api-generated/](lib/api-generated/). Если нужен новый эндпоинт — сначала проверь, нет ли его уже; если его нет в [openapi.yml](openapi.yml), скажи об этом и не выдумывай сервис.
3. **Паттерн `page.tsx` + `view.tsx`** — соблюдай для новых страниц внутри `app/(main)/`.
4. **Цвета и статусы** — только через семантические токены и [lib/status-helper.ts](lib/status-helper.ts). Никаких захардкоженных цветов в компонентах.
5. **Моки** — при переводе экрана на реальный API убирай импорты из [lib/mock-db.ts](lib/mock-db.ts). Не добавляй новые вызовы к мокам в новые фичи, если есть соответствующий сервис.
6. **Формы** — только react-hook-form + zod + shadcn `<Form>`.
7. **Авторизация в UI** — используй `useSession()`, скоупы из [lib/auth/scopes.ts](lib/auth/scopes.ts). Для server-компонентов — `<RoleGate>`.
8. **Prisma-клиент** импортируй только через [lib/db.ts](lib/db.ts) (синглтон), не создавай `new PrismaClient()` в других файлах.
9. **Не коммить .env** и не класть секреты в код.
10. **Next.js 16 / React 19**: не используй устаревшие API (`getServerSideProps`, pages router, `ReactDOM.render`). Всё — App Router, Server Components по умолчанию, Server Actions для мутаций (пример — [app/actions/push.ts](app/actions/push.ts)).
11. **Формат файлов**: 2 пробела, TypeScript, двойные кавычки в JSX-атрибутах. ESLint на `next/core-web-vitals` + `next/typescript`.
12. **Перед «готово»** прогоняй `npm run lint` для изменённых файлов и — если задача про UI — запускай `npm run dev` и проверяй экран в браузере.

---

## 10. Известные особенности и ловушки

- В [components/layout/sidebar.tsx](components/layout/sidebar.tsx) и [components/layout/bottom-nav.tsx](components/layout/bottom-nav.tsx) флаг `isAdmin = true` **захардкожен** — это временная заглушка.
- В [components/providers/api-provider.tsx](components/providers/api-provider.tsx) `OpenAPI.BASE` выставляется повторно в useEffect — это дублирует [lib/api/index.ts](lib/api/index.ts). Не удивляйся.
- [app/actions/push.ts](app/actions/push.ts) держит подписки в памяти процесса (`let MOCK_SUBSCRIPTIONS`) и использует `getCurrentUser()` с фейковым юзером. В проде эту логику надо переписать на Prisma + реальную сессию.
- В [lib/mock-db.ts](lib/mock-db.ts) некоторые массивы экспортируются как `let` — их мутируют из view. При миграции на API аккуратно с этой семантикой.
- [backend/app.py](backend/app.py) ловит **любой** POST/PUT/DELETE на `/api/v1/<path:path>` и возвращает 200/201/204 — при отладке можешь увидеть «успех» там, где на реальном бэке будет 4xx.
- Webpack (не Turbopack) — намеренный выбор (см. флаги в `package.json`). Перед переключением — уточни у пользователя.
- **tfjs статически не импортировать** — только через `await import("@/lib/analytics/lstm-forecast")` в useEffect. Иначе бандл раздутся.
- **Bar-vertical в [components/charts/dynamic-chart.tsx](components/charts/dynamic-chart.tsx)** настроен с `interval={0}`, `angle={-25}`, `height={60}` и `tickFormatter`-обрезкой — чтобы подписи столбцов показывались все и не налезали. Если понадобится другое поведение — делай новый тип, не правь этот.
- **Мутабельные моки** в [lib/mock-db.ts](lib/mock-db.ts) (особенно `requestsDb`): view-компоненты их мутируют и ломают, используй локальный `versionCounter` в state + зависимость в `useMemo`, чтобы триггерить пересчёт производных данных (пример — «Связанные заявки» в событиях).

---

*Поддерживай этот файл актуальным. Если в ходе работы рождается новое устойчивое правило или принимается архитектурное решение — добавляй раздел сюда.*
