const express = require('express');
const router = express.Router();
const operacaoController = require('../controllers/operacao-controller');

// Middleware para proteger rotas privadas
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/usuarios/login');
    }
    next();
}

// Listar todas as operações do usuário
router.get('/', requireAuth, operacaoController.listarOperacoes);

// Buscar operações por ativo
router.get('/buscar', requireAuth, operacaoController.buscarPorAtivo);

// Formulário de nova operação
router.get('/nova', requireAuth, (req, res) => {
    res.render('pages/operacao/form', { operacao: {}, erro: null });
});

// Criar nova operação
router.post('/nova', requireAuth, operacaoController.criarOperacao);

// Formulário de edição
router.get('/:id/editar', requireAuth, operacaoController.editarOperacaoForm);

// Atualizar operação
router.post('/:id/editar', requireAuth, operacaoController.atualizarOperacao);

// Deletar operação
router.post('/:id/deletar', requireAuth, operacaoController.deletarOperacao);

module.exports = router; 