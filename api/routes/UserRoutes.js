const { Router } = require('express');
const UserController = require('../controllers/UserController');
const jwtMiddleware = require('../middlewares/auth')

const router = Router();

router.post('/usuario', UserController.criarUsuario)
    .post('/login', UserController.login)
    .post('/usuario/forgotpassword', UserController.forgotPassword)
    .post('/usuario/resetpassword', UserController.resetPassword)
    .post('/usuario/validateCode', UserController.validatePassCode)
    .get('/usuario', UserController.listarTodosUsuarios)
    .get('/usuario/:usuarioId', jwtMiddleware, UserController.obterUsuarioPorId)
    .put('/usuario/:usuarioId', jwtMiddleware, UserController.atualizarUsuario)
    .delete('/usuario/:usuarioId', jwtMiddleware, UserController.deletarUsuario)
    .get('/usuario/pontos/:userId', jwtMiddleware, UserController.getPontosUsuario)
    .get('/usuario/inst/:inst', jwtMiddleware, UserController.getUserByInstituicao)

module.exports = router;
