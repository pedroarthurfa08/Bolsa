-- Criação da tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Criação da tabela de Operações de Investimento
CREATE TABLE operacoes (
    id SERIAL PRIMARY KEY,
    data_operacao DATE NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('compra', 'venda')),
    codigo_ativo VARCHAR(7) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(15,2) NOT NULL CHECK (preco_unitario > 0),
    valor_bruto NUMERIC(15,2) NOT NULL,
    taxa_b3 NUMERIC(15,2) NOT NULL,
    valor_liquido NUMERIC(15,2) NOT NULL,
    usuario_id INTEGER NOT NULL,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índice para busca rápida por código de ativo
CREATE INDEX idx_operacoes_codigo_ativo ON operacoes(codigo_ativo);