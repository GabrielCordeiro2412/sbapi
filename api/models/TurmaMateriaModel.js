const mongoose = require('../database/index')
const { Schema } = require('../database/index');

const turmaMateriaSchema = new mongoose.Schema({
    turma:{
        type: Schema.Types.ObjectId,
        ref: 'Turma',
        require: true,
    },
    materia:{
        type: Schema.Types.ObjectId,
        ref: 'Materia',
        require: true,
    },
    diaSemana:{
        type: Number,
        require: true,
        min: 0,
        max: 6,
    },
    horario:{
        type: String,
        require: true,
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

const TurmaMateria = mongoose.model('TurmaMateria', turmaMateriaSchema);

module.exports = TurmaMateria;