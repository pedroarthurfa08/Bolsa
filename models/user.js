const pool = require('../db/postgres');
const validator = require('validator');
const bcrypt = require("bcryptjs")

class User {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }
}

User.prototype.validate = function () {
    if (!this.data.nome || typeof this.data.nome !== 'string') {
        this.errors.push('Nome é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(this.data.nome, { min: 3, max: 40 })) {
            this.errors.push('Nome deve ter entre 3 e 40 caracteres.');
        }
    }
    if (!this.data.email || !validator.isEmail(this.data.email)) {
        this.errors.push('Email é obrigatório e deve ser um formato válido.');
    }
    if (!this.data.senha1 || typeof this.data.senha1 !== 'string') {
        this.errors.push('Senha é obrigatória e deve ser uma string.');
    } else {
        if (!validator.isLength(this.data.senha1, { min: 6, max: 30 })) {
            this.errors.push('Senha deve ter entre 6 e 30 caracteres.');
        }
    }
    if (!this.data.senha2 || typeof this.data.senha2 !== 'string') {
        this.errors.push('Confirmação de senha é obrigatória.');
    }
    if (this.data.senha1 !== this.data.senha2) {
        this.errors.push('As senhas não conferem.');
    }
    if (this.errors.length === 0) {
        this.data = {
            nome: this.data.nome,
            email: this.data.email,
            senha: this.data.senha1
        };
    }
}

User.prototype.validateLogin = function () {
    if (!this.data.email || !validator.isEmail(this.data.email)) {
        this.errors.push('Email é obrigatório e deve ser um formato válido.');
    }
    if (!this.data.senha || typeof this.data.senha !== 'string') {
        this.errors.push('Senha é obrigatória e deve ser uma string.');
    }
    if (this.errors.length === 0) {
        this.data = {
            email: this.data.email,
            senha: this.data.senha
        };
    }
}

User.prototype.create = function () {
    let salt = bcrypt.genSaltSync(10)
    const senhaHash = bcrypt.hashSync(this.data.senha, salt);
    const query_sql = 'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id';
    const query_values = [this.data.nome, this.data.email, senhaHash];
    return new Promise((resolve, reject) => {
        pool.query(query_sql, query_values, (error, result) => {
            if (error) {
                return reject('Erro ao criar usuario: ' + error);
            } else {
                const idDoUsuario = result.rows[0].id;
                resolve(idDoUsuario);
            }
        })
    });
}

User.prototype.readOneByEmail = function (email) {
    const query_sql = 'SELECT id, nome, email, senha FROM usuarios WHERE email = $1';
    const query_values = [email];
    return new Promise((resolve, reject) => {
        pool.query(query_sql, query_values, (error, result) => {
            if (error) {
                return reject('Erro ao recuperar usuário pelo email: ' + error);
            } else {
                if (result.rows.length > 0) {
                    const tupla = result.rows[0];
                    const user = new User({
                        id: tupla.id,
                        nome: tupla.nome,
                        email: tupla.email,
                        senha: tupla.senha
                    });
                    resolve(user);
                } else {
                    reject('Usuário não encontrado com o email: ' + email);
                }
            }
        });
    })
}

User.prototype.login = function () {
    return new Promise((resolve, reject) => {
        this.readOneByEmail(this.data.email)
            .then((user) => {
                if (bcrypt.compareSync(this.data.senha, user.data.senha)) {
                    const loginData = {
                        id: user.data.id,
                        nome: user.data.nome,
                        email: user.data.email
                    }
                    resolve(loginData);
                } else {
                    reject('Senha incorreta para o email: ' + this.data.email);
                }
            })
            .catch((error) => {
                reject(error);
            });
    })
}

module.exports = User;