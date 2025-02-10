const bodyParser = require('body-parser')
const instituicao = require('../routes/InstituicaoRoutes')
const plano = require('../routes/PlanoRoutes')
const materia = require('../routes/MateriaRoutes')
const turma = require('../routes/TurmaRoutes')
const rewards = require('../routes/RewardsRoutes')
const usuario = require('../routes/UserRoutes')
const userRewards = require('../routes/UserRewardsRoutes')
const turmaMateria = require('../routes/TurmaMateriaRoutes')
const pergunta = require('../routes/PerguntaRoutes')
const feedback = require('../routes/FeedbackRoutes')
const chat = require('../routes/ChatRoutes')
const message = require('../routes/MessageRoutes')
const transacao = require('../routes/TransacaoRoutes')
const local = require('../routes/LocalRoutes')
const categoria = require('../routes/CategoriaRoutes')
const categorialocal = require('../routes/CategoriaLocalRoutes')
const avatar = require('../routes/AvatarRoutes')
const post = require('../routes/PostRoutes')
const anotacao = require('../routes/AnotacaoRoutes')
const capatarefa = require('../routes/CapaTarefaRoutes')
const tarefa = require('../routes/TarefaRoutes')
const license = require('../routes/LicenseRoutes')

module.exports = app => {
    app.use(bodyParser.json(),
    bodyParser.urlencoded({extended: false}),
    instituicao,
    plano,
    materia,
    turma,
    rewards,
    usuario,
    userRewards,
    turmaMateria,
    pergunta,
    feedback,
    chat,
    message,
    transacao,
    local,
    categoria,
    categorialocal,
    avatar,
    post,
    anotacao,
    capatarefa,
    tarefa,
    license
    );
}