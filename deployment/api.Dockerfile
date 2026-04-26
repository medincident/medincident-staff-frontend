FROM ghcr.io/astral-sh/uv:python3.13-alpine
WORKDIR /backend

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

COPY . /backend/

ENV PATH="/backend/.venv/bin:$PATH"

ENTRYPOINT ["python3", "app.py"]