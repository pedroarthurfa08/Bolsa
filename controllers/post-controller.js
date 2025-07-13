const Post = require('../models/post');

exports.save = function (req, res) {
    const post = new Post(req.body, req.session.usuario.id);
    post.validate();
    
    if (post.errors.length > 0) {
        return res.status(400).send(post.errors);
    } else {
        post.create()
            .then((result) => {
                res.status(201).send('Post criado com sucesso com o id: ' + result);
            })
            .catch((error) => {
                res.status(500).send(error);
            });
    }
}

exports.getUserPosts = function(req, res) {
    const post = new Post({}, req.session.usuario.id)
    post.readUserPosts()
        .then((result) => {
            res.render('pages/post/myposts',
                {
                    title: 'Meus Posts',
                    posts: result,
                });
        })
        .catch((error) => {
            res.status(500).send(error);
        });
}