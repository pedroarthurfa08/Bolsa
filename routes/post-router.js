const express = require('express')
const router = express.Router()
const postController = require('../controllers/post-controller');
const userController = require('../controllers/user-controller');


router.get('/novo',
    userController.mustBeAuthenticated,
    (req, res) => {
        res.render('pages/post/new', {
            title: 'Novo Post',
        });
    })

router.post('/salvar',
    userController.mustBeAuthenticated,
    postController.save)


router.get('/meusposts',
    userController.mustBeAuthenticated,
    postController.getUserPosts
)

module.exports = router