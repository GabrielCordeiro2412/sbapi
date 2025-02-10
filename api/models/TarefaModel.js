// models/Question.js
const mongoose = require('../database/index');
const { Schema } = require('../database/index');

const optionSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

const tarefaSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    capatarefa: {
        type: Schema.Types.ObjectId,
        ref: 'CapaTarefa',
        require: true,
    },
    options: {
        type: [optionSchema], // Agora referenciando o schema das opções
        required: true,
        validate: [arrayLimit, '{PATH} must be between 2 and 4']
    },
    correctAnswer: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

function arrayLimit(val) {
    return val.length >= 2 && val.length <= 4;
}

const Tarefa = mongoose.model('Tarefa', tarefaSchema);

module.exports = Tarefa;
