# Dockerfile otimizado para produção enterprise
FROM python:3.12-slim

# Configurar variáveis de ambiente para produção
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV ENVIRONMENT=production
ENV WORKERS=4

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar diretório de trabalho
WORKDIR /app

# Copiar requirements seguros primeiro (cache Docker)
COPY requirements-secure.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Criar usuário não-root para segurança
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expor porta
EXPOSE 8000

# Health check para monitoramento
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando otimizado para produção
CMD ["uvicorn", "main_simple:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--access-log"]
