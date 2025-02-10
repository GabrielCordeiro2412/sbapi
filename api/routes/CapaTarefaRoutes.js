const { Router } = require('express');
const CapaTarefaController = require('../controllers/CapaTarefaController');

const router = Router();

router.post('/capatarefa', CapaTarefaController.createCapaTarefa)
    .get('/capatarefa', CapaTarefaController.getCapaTarefas)
    .get('/capatarefa/:id', CapaTarefaController.getCapaTarefaById)
    .get('/capatarefa/materia/:materiaid', CapaTarefaController.getCapaTarefaByMateria)
    .put('/capatarefa/:id', CapaTarefaController.updateCapaTarefa)
    .delete('/capatarefa/:id', CapaTarefaController.deleteCapaTarefa)
    .put('/capatarefa/concluido/:id', CapaTarefaController.updateUserComplete)

module.exports = router;
