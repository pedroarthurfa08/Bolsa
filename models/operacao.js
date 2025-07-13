const db = require('../db/postgres');

// Expressão regular para validar código de ativo (ex: ITSA4, BBSE3, BCFF11, GOGL34)
const regexCodigoAtivo = /^[A-Z]{4}\d{1,2}$/;

function calcularValores(tipo, quantidade, preco_unitario) {
    const valor_bruto = quantidade * preco_unitario;
    const taxa_b3 = +(valor_bruto * 0.0003).toFixed(2);
    let valor_liquido;
    if (tipo === 'compra') {
        valor_liquido = +(valor_bruto + taxa_b3).toFixed(2);
    } else {
        valor_liquido = +(valor_bruto - taxa_b3).toFixed(2);
    }
    return { valor_bruto, taxa_b3, valor_liquido };
}

const Operacao = {
    async create({ data_operacao, tipo, codigo_ativo, quantidade, preco_unitario, usuario_id }) {
        if (!regexCodigoAtivo.test(codigo_ativo)) {
            throw new Error('Código do ativo inválido. Use 4 letras maiúsculas seguidas de 1 ou 2 números.');
        }
        if (!['compra', 'venda'].includes(tipo)) {
            throw new Error('Tipo de operação inválido. Use "compra" ou "venda".');
        }
        if (quantidade <= 0 || preco_unitario <= 0) {
            throw new Error('Quantidade e preço unitário devem ser positivos.');
        }
        const { valor_bruto, taxa_b3, valor_liquido } = calcularValores(tipo, quantidade, preco_unitario);
        const result = await db.query(
            `INSERT INTO operacoes (data_operacao, tipo, codigo_ativo, quantidade, preco_unitario, valor_bruto, taxa_b3, valor_liquido, usuario_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [data_operacao, tipo, codigo_ativo, quantidade, preco_unitario, valor_bruto, taxa_b3, valor_liquido, usuario_id]
        );
        return result.rows[0];
    },

    async findAllByUser(usuario_id) {
        const result = await db.query(
            'SELECT * FROM operacoes WHERE usuario_id = $1 ORDER BY data_operacao DESC',
            [usuario_id]
        );
        return result.rows;
    },

    async findById(id, usuario_id) {
        const result = await db.query(
            'SELECT * FROM operacoes WHERE id = $1 AND usuario_id = $2',
            [id, usuario_id]
        );
        return result.rows[0];
    },

    async findByAtivo(codigo_ativo, usuario_id) {
        const result = await db.query(
            'SELECT * FROM operacoes WHERE codigo_ativo = $1 AND usuario_id = $2 ORDER BY data_operacao DESC',
            [codigo_ativo, usuario_id]
        );
        return result.rows;
    },

    async update(id, usuario_id, { data_operacao, tipo, codigo_ativo, quantidade, preco_unitario }) {
        if (!regexCodigoAtivo.test(codigo_ativo)) {
            throw new Error('Código do ativo inválido.');
        }
        if (!['compra', 'venda'].includes(tipo)) {
            throw new Error('Tipo de operação inválido.');
        }
        if (quantidade <= 0 || preco_unitario <= 0) {
            throw new Error('Quantidade e preço unitário devem ser positivos.');
        }
        const { valor_bruto, taxa_b3, valor_liquido } = calcularValores(tipo, quantidade, preco_unitario);
        const result = await db.query(
            `UPDATE operacoes SET data_operacao=$1, tipo=$2, codigo_ativo=$3, quantidade=$4, preco_unitario=$5, valor_bruto=$6, taxa_b3=$7, valor_liquido=$8
             WHERE id=$9 AND usuario_id=$10 RETURNING *`,
            [data_operacao, tipo, codigo_ativo, quantidade, preco_unitario, valor_bruto, taxa_b3, valor_liquido, id, usuario_id]
        );
        return result.rows[0];
    },

    async delete(id, usuario_id) {
        await db.query('DELETE FROM operacoes WHERE id = $1 AND usuario_id = $2', [id, usuario_id]);
    }
};

module.exports = Operacao; 