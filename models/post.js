const validator = require('validator');
const pool = require('../databases/postgres');

class Post {
    constructor(data, idDoUsuario) {
        this.data = data;
        this.errors = [];
        this.idDoUsario = idDoUsuario;
    }
}

Post.prototype.validate = function () {
    let titulo = this.data.titulo;
    let texto = this.data.texto;

    if (!titulo || typeof titulo !== 'string') {
        this.errors.push('Título é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(titulo, { min: 5, max: 30 })) {
            this.errors.push('Título deve ter entre 5 e 30 caracteres.');
        }
    }

    if (!texto || typeof texto !== 'string') {
        this.errors.push('Texto é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(texto, { min: 10, max: 300 })) {
            this.errors.push('Texto deve ter entre 10 e 300 caracteres.');
        }
    }

    if (this.errors.length === 0) {
        this.data = {
            titulo: titulo,
            texto: texto
        };
    }

}

Post.prototype.create = function () {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO posts (titulo, texto, likes, data_postagem, usuario_id) VALUES ($1, $2, $3, $4, $5) returning id';
        const likes = 0;
        const dataDaPostagem = new Date();
        const values = [this.data.titulo, this.data.texto, likes, dataDaPostagem, this.idDoUsario];
        pool.query(sql, values, (error, result) => {
            if (error) {
                return reject('Erro ao criar post: ' + error);
            } else {
                const idDoPost = result.rows[0].id;
                resolve(idDoPost);
            }
        });
    });
};

Post.prototype.readUserPosts = function () {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT titulo, texto, likes, data_postagem, usuario_id FROM posts WHERE usuario_id = $1 ORDER BY data_postagem DESC';
        const values = [this.idDoUsario];
        pool.query(sql, values, (error, result) => {
            if (error) {
                return reject('Erro ao ler posts do usuário: ' + error);
            } else {
                const listaDePosts = [];
                for (let i = 0; i < result.rows.length; i++) {
                    tupla = result.rows[i];
                    const post = parseTupleToPost(tupla);
                    listaDePosts.push(post.data);
                }
                resolve(listaDePosts)
            }
        });
    });
}

function parseTupleToPost(tupla) {
    postData = {
        titulo: tupla.titulo,
        texto: tupla.texto,
        likes: tupla.likes,
        dataDaPostagem: tupla.data_postagem,
        idDoUsario: tupla.usuario_id
    };
    const post = new Post(postData, tupla.usuario_id)
    return post;
}


module.exports = Post;