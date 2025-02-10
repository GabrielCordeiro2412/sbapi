// models/Question.js
const mongoose = require('../database/index');
const { Schema } = require('../database/index');


const usersCompleteSchema = new mongoose.Schema({
    aluno: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    nota: {
        type: Number,
        required: true
    }
});


const capaTarefaSchema = new mongoose.Schema({
    turma: {
        type: Schema.Types.ObjectId,
        ref: 'Turma',
        require: false,
    },
    materia: {
        type: Schema.Types.ObjectId,
        ref: 'Materia',
        require: true,
    },
    datafinal: {
        type: Date,
        required: true
    },
    ativo: {
        type: Boolean,
        required: true,
        default: true
    },
    usersConcluidos: {
        type: [usersCompleteSchema],
        required: true
    },
    instituicao:{
        type: Schema.Types.ObjectId,
        ref: 'Instituicao',
        require: true,
    },
}, {
    timestamps: true
});


const CapaTarefa = mongoose.model('CapaTarefa', capaTarefaSchema);

module.exports = CapaTarefa;
