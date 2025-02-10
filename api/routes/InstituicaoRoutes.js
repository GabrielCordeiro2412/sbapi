const { Router } = require('express')
const InstituicaoController = require('../controllers/InstituicaoController')
const licenseMiddleware = require('../middlewares/licenseMiddleware')
const jwtMiddleware = require('../middlewares/auth')

const router = Router()
router
    .post('/instituicao', InstituicaoController.criarInstituicao)
    .post('/instituicao/login', InstituicaoController.loginInstituicao)
    .post('/instituicao/create-intent', InstituicaoController.createIntent)
    .get('/instituicao', InstituicaoController.todasInsituicoes)
    .delete('/instituicao/remover', jwtMiddleware, licenseMiddleware, InstituicaoController.removerInstituicao)
    .get('/instituicao/exibe', jwtMiddleware, InstituicaoController.exibirInstituicao)
    .put('/instituicao', jwtMiddleware, licenseMiddleware, InstituicaoController.atualizarInstituicao)
    .put('/instituicao/upgrade-plano', jwtMiddleware, licenseMiddleware, InstituicaoController.atualizarPlano)
    .get('/instituicao/bycod', InstituicaoController.getInstByCodigo)
    .post('/instituicao/aprovar', jwtMiddleware, licenseMiddleware, InstituicaoController.aprovarUsuario)
    .get('/instituicao/aprovar/usuarios', jwtMiddleware, licenseMiddleware, InstituicaoController.usuariosPendentes)
module.exports = router