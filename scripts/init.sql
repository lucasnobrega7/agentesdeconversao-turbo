-- Inicialização do banco MASTER
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuário para desenvolvimento
ALTER USER postgres CREATEDB;
