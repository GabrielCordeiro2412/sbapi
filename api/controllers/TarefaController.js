const Tarefa = require('../models/TarefaModel')
const CapaTarefa = require('../models/CapaTarefaModel')

class TarefaController {
    static async createTarefa(req, res) {
        try {
            const tarefa = await Tarefa.create(req.body);
            res.status(201).json(tarefa);
        } catch (error) {
            res.status(400).json(error);
        }
    }
    static async getTarefas(req, res) {
        try {
            const tarefas = await Tarefa.find().populate("capatarefa");
            res.status(201).json(tarefas);
        } catch (error) {
            res.status(400).json(error);
        }
    }

    static async getTarefaById(req, res) {
        try {
            const tarefa = await Tarefa.findById(req.params.id);
            if (!tarefa) {
                return res.status(404).json({ success: false, error: 'Tarefa not found' });
            }
            res.status(200).json(tarefa);
        } catch (error) {
            res.status(400).json(error);
        }
    }

    static async updateTarefa(req, res) {
        try {
            const tarefa = await Tarefa.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            if (!tarefa) {
                return res.status(404).json({ success: false, error: 'Tarefa not found' });
            }
            res.status(200).json(tarefa);
        } catch (error) {
            res.status(400).json(error);
        }
    }

    static async deleteTarefa(req, res) {
        try {
            const tarefa = await Tarefa.findByIdAndDelete(req.params.id);
            if (!tarefa) {
                return res.status(404).json({ success: false, error: 'Tarefa not found' });
            }
            res.status(200).json({ success: true, data: {} });
        } catch (error) {
            res.status(400).json(error);
        }
    }

    static async getAllByCapa(req, res){
        const {capaid} = req.headers;
        try {
            const capa = await CapaTarefa.findById(capaid);
            if(!capa){
                return res.status(404).json({success: false, error: 'CapaTarefa not found'});
            }

            const tarefas = await Tarefa.find({capatarefa: capa._id});
            res.status(200).json(tarefas);
        } catch (error) {
            console.log(error)
            res.status(400).json(error);
        }
    }

}

module.exports = TarefaController;
