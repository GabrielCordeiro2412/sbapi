const CapaTarefa = require('../models/CapaTarefaModel');
const Instituicao = require('../models/InstituicaoModel');

class CapaTarefaController {
    static async createCapaTarefa(req, res) {
        try {
            const capatarefa = await CapaTarefa.create(req.body);
            res.status(201).json(capatarefa);
        } catch (err) {
            res.status(400).json(err);
        }
    }
    static async getCapaTarefas(req, res) {
        try {
            const capatarefa = await CapaTarefa.find().populate("materia instituicao");
            res.status(201).json(capatarefa);
        } catch (err) {
            res.status(400).json(err);
        }
    }

    static async getCapaTarefaById(req, res) {
        try {
            const capatarefa = await CapaTarefa.findById(req.params.id);
            if (!capatarefa) {
                return res.status(404).json({ success: false, error: 'CapaTarefa not found' });
            }
            res.status(200).json(capatarefa);
        } catch (err) {
            res.status(400).json(err);
        }
    }

    static async getCapaTarefaByMateria(req, res) {
        const { materiaid } = req.params;
        try {
            const capatarefa = await CapaTarefa.find({ materia: materiaid }).populate("materia");
            if (!capatarefa) {
                return res.status(404).json({ success: false, error: 'CapaTarefa not found' });
            }
            res.status(200).json(capatarefa);
        } catch (err) {
            res.status(400).json(err);
        }
    }

    static async updateCapaTarefa(req, res) {
        try {
            const capatarefa = await CapaTarefa.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            if (!capatarefa) {
                return res.status(404).json({ success: false, error: 'CapaTarefa not found' });
            }
            res.status(200).json(capatarefa);
        } catch (err) {
            res.status(400).json(err);
        }
    }

    static async deleteCapaTarefa(req, res) {
        try {
            const capatarefa = await CapaTarefa.findByIdAndDelete(req.params.id);
            if (!capatarefa) {
                return res.status(404).json({ success: false, error: 'CapaTarefa not found' });
            }
            res.status(200).json({ success: true, data: {} });
        } catch (err) {
            res.status(400).json(err);
        }
    }

    static async updateUserComplete(req, res) {
        try {
            const capatarefa = await CapaTarefa.findById(req.params.id);
            if (!capatarefa) {
                return res.status(404).json({ success: false, error: 'CapaTarefa not found' });
            }
            const userConcluido = capatarefa.usersConcluidos.find(user => user.aluno.toString() === req.body.aluno.toString());
            if (userConcluido) {
                return res.status(400).json({ success: false, message: 'User already completed this tarefa' });
            }

            // Adiciona o aluno à lista de usuários que concluíram a tarefa
            capatarefa.usersConcluidos.push({ aluno: req.body.userid, nota: req.body.nota });

            res.status(200).json(capatarefa)
            await capatarefa.save();
        } catch (error) {
            res.status(400).json(error)
        }
    }
}

module.exports = CapaTarefaController;
