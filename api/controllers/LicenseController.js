const License = require('../models/LicenseModel')
const Instituicao = require('../models/InstituicaoModel')

class LicenseController {

    static async checkLicense(req, res){
        const {instid} = req.headers;
        try {
            const inst = await Instituicao.findById(instid)
            if(!inst) return res.status(404).send({message: "Instituição não encontrada"})
            const license = await License.findOne({ instituicao: instid }).populate("plano instituicao");
            if(!license){
                return res.status(200).send({message: "Licença não encontrada ou expirada"})
            }
            return res.status(200).send(license)
        } catch (error) {
            return res.send(error)
        }
    }

    static async renewLicense(req, res){
        const {instid} = req.headers;
        try {
            const inst = await Instituicao.findById(instid)
            if(!inst) return res.status(404).send({message: "Instituição não encontrada"})
            const license = await License.findOne({ instituicao: instid }).populate("plano instituicao");
            if(!license){
                return res.status(200).send({message: "Licença não encontrada ou expirada"})
            }

            // Calcula a nova data de expiração (1 mês a partir de hoje)
            const newExpirationDate = new Date();
            newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);

            // Atualiza a data de expiração
            license.expirationDate = newExpirationDate;
            license.active = true;

            // Salva a licença atualizada no banco de dados
            await license.save();

            return res.status(200).send(license)
        } catch (error) {
            return res.send(error)
        }
    }
}

module.exports = LicenseController;
