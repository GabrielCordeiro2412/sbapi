const { Router } = require('express');
const PostController = require('../controllers/PostController');

const router = Router();

router.post('/post', PostController.criarPost)
    .get('/post', PostController.listarTodosPosts)
    .get('/post/:postId', PostController.obterPostPorId)
    .put('/post/:postId', PostController.atualizarPost)
    .delete('/post/:postId', PostController.deletarPost)

module.exports = router;