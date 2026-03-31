from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
import time

app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    origins=["https://patient-medincident.ulbwa.bombomeow.ru"],
)

# --- МОКОВЫЕ ДАННЫЕ ---

MOCK_USERS = [
    {
        "id": "user_1",
        "name": "Иванов Иван Иванович",
        "givenName": "Иван",
        "familyName": "Иванов",
        "email": "admin@med.ru",
        "isActive": True,
        "isAdmin": True,
        "role": "admin_system",
        "employment": None,
    },
    {
        "id": "user_2",
        "name": "Петров Петр",
        "givenName": "Петр",
        "familyName": "Петров",
        "email": "doctor@med.ru",
        "isActive": True,
        "isAdmin": False,
        "role": "doctor",
        "employment": {
            "organization": {"id": "org_1", "name": "Сеть клиник Здоровье"},
            "clinic": {"id": "clinic_1", "name": "Главный филиал"},
            "department": {"id": "dept_1", "name": "Кардиология"},
            "position": "Врач-кардиолог",
        },
    },
    {
        "id": "user_3",
        "name": "Смирнова Анна",
        "givenName": "Анна",
        "familyName": "Смирнова",
        "email": "nurse@med.ru",
        "isActive": False,
        "isAdmin": False,
        "role": "nurse",
        "employment": {
            "organization": {"id": "org_1", "name": "Сеть клиник Здоровье"},
            "clinic": {"id": "clinic_1", "name": "Главный филиал"},
            "department": {"id": "dept_2", "name": "Хирургия"},
            "position": "Медсестра",
        },
    },
]

MOCK_ORGS = [
    {
        "id": "org_1",
        "name": "Сеть клиник Здоровье",
        "isActive": True,
        "description": "Федеральная сеть многопрофильных центров",
        "legalAddress": {"value": "г. Москва, ул. Ленина, д. 1"},
    },
    {
        "id": "org_2",
        "name": "Медицинский Центр 'Эталон'",
        "isActive": True,
        "description": "Частная клиника премиум-сегмента",
        "legalAddress": {"value": "г. Санкт-Петербург, Невский пр., д. 25"},
    },
    {
        "id": "org_3",
        "name": "Детская клиника 'Радуга'",
        "isActive": False,  # Для проверки отображения деактивированных организаций
        "description": "Архивная запись организации",
        "legalAddress": {"value": "г. Казань, ул. Мира, д. 10"},
    },
]

MOCK_CLINICS = [
    # Клиники первой организации
    {
        "id": "clinic_1",
        "organizationId": "org_1",
        "name": "Главный филиал (Центр)",
        "isActive": True,
        "physicalAddress": {"value": "г. Москва, ул. Пушкина, д. 2"},
        "description": "Центральный офис и стационар",
    },
    {
        "id": "clinic_2",
        "organizationId": "org_1",
        "name": "Филиал Северный",
        "isActive": True,
        "physicalAddress": {"value": "г. Москва, ул. Северная, д. 45"},
        "description": "Амбулаторное отделение",
    },
    # Клиника второй организации
    {
        "id": "clinic_3",
        "organizationId": "org_2",
        "name": "Эталон СПб",
        "isActive": True,
        "physicalAddress": {"value": "г. Санкт-Петербург, ул. Марата, д. 12"},
        "description": "Основной корпус",
    },
]

MOCK_DEPTS = [
    # Отделения clinic_1
    {
        "id": "dept_1",
        "clinicId": "clinic_1",
        "name": "Кардиология",
        "isActive": True,
        "description": "Отделение интенсивной терапии и диагностики",
    },
    {
        "id": "dept_2",
        "clinicId": "clinic_1",
        "name": "Хирургия",
        "isActive": True,
        "description": "Общая хирургия и травматология",
    },
    {
        "id": "dept_3",
        "clinicId": "clinic_1",
        "name": "Приемный покой",
        "isActive": True,
        "description": "Регистрация и первичный осмотр",
    },
    # Отделения clinic_2
    {
        "id": "dept_4",
        "clinicId": "clinic_2",
        "name": "Терапия",
        "isActive": True,
        "description": "Участковые врачи и диагностика",
    },
    # Отделения clinic_3
    {
        "id": "dept_5",
        "clinicId": "clinic_3",
        "name": "Стоматология",
        "isActive": True,
        "description": "Челюстно-лицевая хирургия",
    },
    {
        "id": "dept_6",
        "clinicId": "clinic_3",
        "name": "МРТ и КТ",
        "isActive": False,  # Для проверки статуса "откл"
        "description": "Лучевая диагностика",
    },
]

MOCK_CATEGORIES = [
    {
        "id": "cat_1",
        "code": "safety",
        "name": "Безопасность",
        "isActive": True,
        "parentId": None,  # Корневая категория
        "description": "Физическая безопасность",
    },
    {
        "id": "cat_1_1",
        "code": "falls",
        "name": "Падения",
        "isActive": True,
        "parentId": "cat_1",  # Вложенная категория (ссылается на cat_1)
        "description": "Все виды падений",
    },
    {
        "id": "cat_2",
        "code": "medication",
        "name": "Медикаменты",
        "isActive": True,
        "parentId": None,
        "description": "Ошибки при выдаче",
    },
]

MOCK_TYPES = [
    {
        "id": "type_1",
        "categoryId": "cat_1_1",  # Тип лежит во вложенной категории "Падения"
        "code": "fall_from_bed",
        "name": "Падение с кровати",
        "patientCanReport": True,
        "isActive": True,
    },
    {
        "id": "type_2",
        "categoryId": "cat_1_1",  # Тип лежит во вложенной категории "Падения"
        "code": "fall_in_bathroom",
        "name": "Падение в ванной",
        "patientCanReport": True,
        "isActive": True,
    },
    {
        "id": "type_3",
        "categoryId": "cat_2",  # Тип лежит в корневой категории "Медикаменты"
        "code": "wrong_pill",
        "name": "Перепутаны лекарства",
        "patientCanReport": False,
        "isActive": True,
    },
]


# --- УТИЛИТЫ ---
def paginated(items):
    """Оборачивает массив в объект с пагинацией согласно OpenAPI"""
    return jsonify(
        {
            "items": items,
            "pagination": {
                "limit": 100,
                "hasMore": False,
                "cursor": None,
                "nextCursor": None,
            },
        }
    )


# ==========================================
# РОУТЫ: ПОЛЬЗОВАТЕЛИ
# ==========================================
@app.route("/api/v1/users/me", methods=["GET"])
def get_me():
    return jsonify(MOCK_USERS[0])


@app.route("/api/v1/users", methods=["GET"])
def list_users():
    return paginated(MOCK_USERS)


@app.route("/api/v1/users/<user_id>", methods=["GET"])
def get_user(user_id):
    user = next((u for u in MOCK_USERS if u["id"] == user_id), MOCK_USERS[1])
    return jsonify(user)


# ==========================================
# РОУТЫ: ОРГАНИЗАЦИИ, КЛИНИКИ, ОТДЕЛЕНИЯ
# ==========================================
@app.route("/api/v1/organizations", methods=["GET"])
def list_orgs():
    return paginated(MOCK_ORGS)


@app.route("/api/v1/organizations/<org_id>", methods=["GET"])
def get_org(org_id):
    return jsonify(MOCK_ORGS[0])


@app.route("/api/v1/organizations/<org_id>/clinics", methods=["GET"])
def list_org_clinics(org_id):
    return paginated(MOCK_CLINICS)


@app.route("/api/v1/clinics/<clinic_id>/departments", methods=["GET"])
def list_clinic_depts(clinic_id):
    return paginated(MOCK_DEPTS)


@app.route("/api/v1/departments/<dept_id>", methods=["GET"])
def get_dept(dept_id):
    return jsonify(MOCK_DEPTS[0])


# ==========================================
# РОУТЫ: ОТВЕТСТВЕННЫЕ И СОТРУДНИКИ
# ==========================================
@app.route("/api/v1/organizations/<org_id>/responsibles", methods=["GET"])
@app.route("/api/v1/clinics/<clinic_id>/responsibles", methods=["GET"])
@app.route("/api/v1/departments/<dept_id>/responsibles", methods=["GET"])
def list_responsibles(**kwargs):
    # Возвращаем одного мокового ответственного
    return paginated(
        [
            {
                "user": {
                    "id": "user_1",
                    "name": "Иванов Иван Иванович",
                    "shortName": "Иванов И.И.",
                },
                "isDirectlyAssigned": True,
                "inheritedFrom": None,
            }
        ]
    )


@app.route("/api/v1/organizations/<org_id>/responsible-candidates", methods=["GET"])
@app.route("/api/v1/clinics/<clinic_id>/responsible-candidates", methods=["GET"])
@app.route("/api/v1/departments/<dept_id>/responsible-candidates", methods=["GET"])
def list_candidates(**kwargs):
    # Возвращаем кандидатов
    return paginated(
        [
            {"user": MOCK_USERS[1], "eligible": True, "ineligibilityReasons": []},
            {
                "user": MOCK_USERS[2],
                "eligible": False,
                "ineligibilityReasons": [
                    {"code": "not_an_employee", "message": "Не работает здесь"}
                ],
            },
        ]
    )


@app.route("/api/v1/departments/<dept_id>/employees", methods=["GET"])
def list_dept_employees(dept_id):
    return paginated(
        [
            {
                "user": MOCK_USERS[1],
                "position": "Врач",
                "assignedAt": "2026-01-01T10:00:00Z",
            },
            {
                "user": MOCK_USERS[2],
                "position": "Медсестра",
                "assignedAt": "2026-01-02T10:00:00Z",
            },
        ]
    )


# ==========================================
# РОУТЫ: КЛАССИФИКАТОР
# ==========================================
@app.route("/api/v1/events/categories", methods=["GET"])
def list_categories():
    return paginated(MOCK_CATEGORIES)


@app.route("/api/v1/events/categories/<cat_id>/types", methods=["GET"])
def list_types(cat_id):
    types = [t for t in MOCK_TYPES if t["categoryId"] == cat_id]
    return paginated(types)


# ==========================================
# ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК МУТАЦИЙ (POST, PUT, DELETE)
# ==========================================
@app.route("/api/v1/<path:path>", methods=["POST", "PUT", "DELETE"])
def catch_all_mutations(path):
    """
    Универсальный обработчик для всех мутаций (создание, обновление, удаление, смена статуса).
    Возвращает 200 или 204 статус, имитируя успешное выполнение запроса на сервере,
    чтобы React-клиент мог корректно отобразить Toast-уведомления.
    """
    time.sleep(0.5)  # Имитация задержки сети

    # Если это запрос на создание (POST, но не деактивация/реактивация), возвращаем моковый ID
    if request.method == "POST" and not path.endswith(
        ("deactivate", "reactivate", "responsibles", "employees")
    ):
        body = request.json or {}
        body["id"] = f"new_mock_id_{uuid.uuid4().hex[:6]}"
        body["isActive"] = True
        return jsonify(body), 201

    # В остальных случаях (обновление, удаление, смена статуса) просто говорим "OK"
    return "", 204


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3232, debug=True)
