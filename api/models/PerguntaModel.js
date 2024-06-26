const mongoose = require('../database/index');
const { Schema } = require('../database/index');

const perguntaSchema = new mongoose.Schema({
    texto: {
        type: String,
        require: true,
    },
    instituicao: {
        type: Schema.Types.ObjectId,
        ref: 'Instituicao',
        require: true,
    },
    materia: {
        type: Schema.Types.ObjectId,
        ref: 'Materia',
        require: false,
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
});

const Pergunta = mongoose.model('Pergunta', perguntaSchema);

module.exports = Pergunta;