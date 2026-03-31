FROM ghcr.io/astral-sh/uv:python3.13-alpine
WORKDIR /backend

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Копируем манифесты зависимостей
COPY pyproject.toml uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# ИСПРАВЛЕНИЕ: Копируем всё содержимое папки backend (контекста) в /backend
COPY . /backend/

ENV PATH="/backend/.venv/bin:$PATH"

# ИСПРАВЛЕНИЕ: Так как WORKDIR у нас /backend, и мы скопировали всё прямо в неё, 
# app.py лежит в корне рабочей директории.
ENTRYPOINT ["python3", "app.py"]