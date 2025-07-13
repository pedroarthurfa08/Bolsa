const User = require('../models/user');

exports.save = function (req, res) {
    const user = new User(req.body)
    user.validate()
    if (user.errors.length > 0) {
        return res.render('pages/user/signup', { title: 'Novo Usuário', erros: user.errors, form: req.body })
    } else {
        user.create()
            .then((result) => {
                res.redirect('/user/entrar')
            })
            .catch((error) => {
                res.status(500).render('pages/user/signup', { title: 'Novo Usuário', erros: [error], form: req.body })
            })
    }
}

exports.login = function (req, res) {
    const user = new User(req.body)
    user.validateLogin()
    if (user.errors.length > 0) {
        return res.render('pages/user/signin', { title: 'Entrar', erros: user.errors, form: req.body })
    } else {
        user.login()
            .then((result) => {
                req.session.usuario = {
                    nome: result.nome,
                    email: result.email,
                    id: result.id
                }
                req.session.save(function () {
                    res.redirect("/operacoes")
                })
            })
            .catch((error) => {
                res.status(500).render('pages/user/signin', { title: 'Entrar', erros: [error], form: req.body })
            })
    }
}

exports.logout = function (req, res) {
    req.session.destroy(function () {
        res.redirect("/")
    })
}

exports.mustBeAuthenticated = function (req, res, next) {
    if (req.session.usuario) {
        return next()
    } else {
        return res.redirect('/user/entrar')
    }
}