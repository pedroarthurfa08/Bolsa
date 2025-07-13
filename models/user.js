const pool = require('../databases/postgres');
validator = require('validator');
const bcrypt = require("bcryptjs")

class User {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }
}

User.prototype.validate = function () {

    this.validateUsername(this.data.username);
    this.validatePassword(this.data.password1);
    this.validatePassword(this.data.password2);

    if (this.data.password1 !== this.data.password2) {
        this.errors.push('Os passwords não conferem.');
    }

    if (!this.data.email || !validator.isEmail(this.data.email)) {
        this.errors.push('Email é obrigatório e deve ser um formato válido.');
    }

    if (!this.data.nome || typeof this.data.nome !== 'string') {
        this.errors.push('Nome é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(this.data.nome, { min: 3, max: 20 })) {
            this.errors.push('Nome deve ter entre 3 e 20 caracteres.');
        }
    }

    if (!this.data.sobrenome || typeof this.data.nome !== 'string') {
        this.errors.push('Sobrenome é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(this.data.nome, { min: 3, max: 40 })) {
            this.errors.push('Nome deve ter entre 3 e 40 caracteres.');
        }
    }

    if (this.errors.length === 0) {
        validatedData = {
            username: this.data.username,
            password: this.data.password1,
            email: this.data.email,
            nome: this.data.nome,
            sobrenome: this.data.sobrenome,
        };
        this.data = validatedData;
    }
}

User.prototype.validateUsername = function (username) {
    if (!username || typeof username !== 'string') {
        this.errors.push('username é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(username, { min: 5, max: 15 })) {
            this.errors.push('Nome de usuário deve ter no mínimo 5 digítos e no máximo 15.');
        }
        if (!validator.isAlpha(username.charAt(0))) {
            this.errors.push('O nome de usuário deve começar com uma letra.');
        }
        if (!validator.isAlphanumeric(username)) {
            this.errors.push('Username must contain only letters and numbers.');
        }
    }
}

User.prototype.validatePassword = function (password) {
    if (!password || typeof password !== 'string') {
        this.errors.push('Password é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isAlphanumeric(password)) {
            this.errors.push('Password deve conter apenas letras e números.');
        }
        if (!validator.isLength(password, { min: 6, max: 30 })) {
            this.errors.push('Password deve ter entre 6 and 30 characters.');
        }
    }
}

User.prototype.validateLogin = function () {
    this.validateUsername(this.data.username);
    this.validatePassword(this.data.password);

    if (this.errors.length === 0) {
        validatedData = {
            username: this.data.username,
            password: this.data.password,
        };
        this.data = validatedData;
    }
}

User.prototype.create = function () {
    // const bcrypt = require("bcryptjs")
    let salt = bcrypt.genSaltSync(10)
    this.data.password = bcrypt.hashSync(this.data.password, salt);
    const query_sql = 'INSERT INTO usuarios (username, password, email, nome, sobrenome) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const query_values = [this.data.username, this.data.password, this.data.email, this.data.nome, this.data.sobrenome];
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


User.prototype.readOneByUsername = function (username) {
    const query_sql = 'SELECT id, username, password, email, nome, sobrenome FROM usuarios WHERE username = $1';
    const query_values = [username];
    return new Promise((resolve, reject) => {
        pool.query(query_sql, query_values, (error, result) => {
            if (error) {
                return reject('Erro ao recuperar um usuario pelo username: ' + error);
            } else {
                if (result.rows.length > 0) {
                    tupla = result.rows[0];
                    user = parseTupleToUser(tupla);
                    resolve(user);
                } else {
                    reject('Usuário não encontrado com o username: ' + username);
                }
            }
        });
    })
}

function parseTupleToUser(tupla) {
    const user = new User({
        id: tupla.id,
        username: tupla.username,
        password: tupla.password,
        email: tupla.email,
        nome: tupla.nome,
        sobrenome: tupla.sobrenome
    });
    return user;
}

User.prototype.login = function () {
    return new Promise((resolve, reject) => {
        this.readOneByUsername(this.data.username)
            .then((user) => {
                if (bcrypt.compareSync(this.data.password, user.data.password)) {
                    loginData = {
                        id: user.data.id,
                        username: user.data.username
                    }
                    resolve(loginData);
                } else {
                    reject('Senha incorreta para o usuário: ' + this.data.username);
                }
            })
            .catch((error) => {
                reject(error);
            });
    })
}

module.exports = User;