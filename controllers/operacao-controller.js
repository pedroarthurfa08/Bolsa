const Operacao = require('../models/operacao');

const operacaoController = {
    async criarOperacao(req, res) {
        try {
            const usuario_id = req.session.userId;
            const { data_operacao, tipo, codigo_ativo, quantidade, preco_unitario } = req.body;
            const operacao = await Operacao.create({
                data_operacao,
                tipo,
                codigo_ativo,
                quantidade: Number(quantidade),
                preco_unitario: Number(preco_unitario),
                usuario_id
            });
            res.redirect('/operacoes');
        } catch (err) {
            res.status(400).render('pages/operacao/form', { erro: err.message, operacao: req.body });
        }
    },

    async listarOperacoes(req, res) {
        try {
            const usuario_id = req.session.userId;
            const operacoes = await Operacao.findAllByUser(usuario_id);
            res.render('pages/operacao/list', { operacoes });
        } catch (err) {
            res.status(500).send('Erro ao buscar operações.');
        }
    },

    async buscarPorAtivo(req, res) {
        try {
            const usuario_id = req.session.userId;
            const { codigo_ativo } = req.query;
            const operacoes = await Operacao.findByAtivo(codigo_ativo, usuario_id);
            res.render('pages/operacao/list', { operacoes });
        } catch (err) {
            res.status(500).send('Erro ao buscar operações por ativo.');
        }
    },

    async editarOperacaoForm(req, res) {
        try {
            const usuario_id = req.session.userId;
            const { id } = req.params;
            const operacao = await Operacao.findById(id, usuario_id);
            if (!operacao) return res.status(404).send('Operação não encontrada.');
            res.render('pages/operacao/form', { operacao });
        } catch (err) {
            res.status(500).send('Erro ao buscar operação.');
        }
    },

    async atualizarOperacao(req, res) {
        try {
            const usuario_id = req.session.userId;
            const { id } = req.params;
            const { data_operacao, tipo, codigo_ativo, quantidade, preco_unitario } = req.body;
            const operacao = await Operacao.update(id, usuario_id, {
                data_operacao,
                tipo,
                codigo_ativo,
                quantidade: Number(quantidade),
                preco_unitario: Number(preco_unitario)
            });
            if (!operacao) return res.status(404).send('Operação não encontrada.');
            res.redirect('/operacoes');
        } catch (err) {
            res.status(400).render('pages/operacao/form', { erro: err.message, operacao: req.body });
        }
    },

    async deletarOperacao(req, res) {
        try {
            const usuario_id = req.session.userId;
            const { id } = req.params;
            await Operacao.delete(id, usuario_id);
            res.redirect('/operacoes');
        } catch (err) {
            res.status(500).send('Erro ao deletar operação.');
        }
    }
};

module.exports = operacaoController; 