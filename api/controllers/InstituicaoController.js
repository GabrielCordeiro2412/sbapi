const Instituicao = require('../models/InstituicaoModel')
const Plano = require('../models/PlanoModel')
const { cnpj } = require('cpf-cnpj-validator');
const User = require('../models/UserModel');
const stripe = require('stripe')(process.env.SECRET_STRIPE_CODE);
const enviarEmail = require('../functions/sendMail')
const { generateLicense } = require('../utils/licenseUtils')
const authConfig = require('../config/auth.json');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret)
}

class InstituicaoController {
    static async createIntent(req, res) {
        const { idplano } = req.headers;
        try {

            const plano = await Plano.findById(idplano)

            if (!plano) {
                return res.status(404).json({ Mensagem: "Plano não Encontrado" })
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: plano.valor * 100,
                currency: 'brl',
            });
            const clientSecret = paymentIntent.client_secret
            return res.send({ clientSecret })
        } catch (error) {
            return res.json(error)
        }
    }

    static async criarInstituicao(req, res) {
        const { nome, endereco, sigla, email, instCnpj, password } = req.body
        const { idplano } = req.headers;
        try {

            const cnpjFormatted = cnpj.format(instCnpj);

            const plano = await Plano.findById(idplano)

            if (!plano) {
                return res.status(404).json({ Mensagem: "Plano não Encontrado" })
            }

            if (!cnpj.isValid(cnpjFormatted)) {
                return res.status(400).json({ error: 'CNPJ inválido' });
            }

            const inst = await Instituicao.create({
                nome,
                endereco,
                email,
                password,
                sigla,
                cnpj: instCnpj,
                plano: idplano,
            })

            await generateLicense(inst._id, idplano)

            return res.status(200).json(inst)
        } catch (error) {
            return res.json(error)
        }
    }

    static async loginInstituicao(req, res) {
        const { email, password } = req.body;
        try {
            const instituicaoExistente = await Instituicao.findOne({ email: email });

            if (!instituicaoExistente) {
                return res.status(401).json({ error: 'E-mail inválido' });
            }

            const senhaCorreta = await bcrypt.compare(password, instituicaoExistente.password);
            if (!senhaCorreta) {
                return res.status(401).json({ error: 'Senha inválida' });
            }

            instituicaoExistente.password = undefined;

            return res.status(200).json({ instituicao: instituicaoExistente, token: generateToken({ id: instituicaoExistente.id }) });

        } catch (error) {
            return res.json(error)
        }
    }

    static async todasInsituicoes(req, res) {
        try {
            const inst = await Instituicao.find()
            return res.status(200).json(inst)
        } catch (error) {
            return res.json(error)
        }
    }

    static async removerInstituicao(req, res) {
        const { instid } = req.headers;
        try {
            const inst = await Instituicao.findById(instid)

            if (!inst)
                return res.status(404).json({ Mensagem: "Instituição não encontrad" })

            await Instituicao.findByIdAndDelete({ _id: instid })
            return res.json("Instituição deleteda com sucesso!")
        } catch (error) {
            return res.json(error)
        }
    }

    static async exibirInstituicao(req, res) {
        const { instid } = req.headers;

        try {
            const inst = await Instituicao.findById(instid).populate('plano');

            if (!inst) {
                return res.status(404).json({ error: 'Instituição não encontrada' });
            }

            return res.status(200).json(inst);
        } catch (error) {
            return res.json(error);
        }
    }

    static async atualizarInstituicao(req, res) {
        const { instid } = req.headers;
        const { nome, endereco, sigla, email } = req.body;

        try {
            const instituicao = await Instituicao.findById(instid);
            if (!instituicao) {
                return res.status(404).json({ error: 'Instituição não encontrada' });
            }

            if (nome) {
                instituicao.nome = nome;
            }
            if (endereco) {
                instituicao.endereco = endereco;
            }
            if (sigla) {
                instituicao.sigla = sigla;
            }
            if (email) {
                instituicao.email = email;
            }

            const instituicaoAtualizada = await instituicao.save();

            return res.status(200).json(instituicaoAtualizada);
        } catch (error) {
            return res.json(error);
        }
    }

    static async atualizarPlano(req, res) {
        const { instid, planoId } = req.headers;

        try {
            const instituicao = await Instituicao.findById(instid);
            if (!instituicao) {
                return res.status(404).json({ error: 'Instituição não encontrada' });
            }

            const novoPlano = await Plano.findById(planoId);
            if (!novoPlano) {
                return res.status(404).json({ error: 'Plano não encontrado' });
            }

            instituicao.plano = novoPlano;

            const instituicaoAtualizada = await instituicao.save();

            return res.status(200).json(instituicaoAtualizada);
        } catch (error) {
            return res.json(error);
        }
    }

    static async getInstByCodigo(req, res) {
        const { instid } = req.headers;
        console.log(instid)

        try {
            const instituicao = await Instituicao.findOne({ codigo: instid });

            if (!instituicao) {
                return res.status(404).json({ error: 'Instituição não encontrada' });
            }

            return res.status(200).json(instituicao);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao obter a instituição' });
        }
    }

    static async aprovarUsuario(req, res) {
        const { userid, instid } = req.headers;
        const { aprovado } = req.body;

        try {
            const user = await User.findById(userid).populate('instituicao');
            const inst = await Instituicao.findById(instid);

            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }

            if (!inst) {
                return res.status(404).json({ error: "Instituição não encontrada" });
            }

            if (aprovado) {
                if (user.active) {
                    return res.status(401).json({ error: "Usuário já aprovado" });
                }

                if(user.instituicao._id.toString() != inst._id.toString()){

                    return res.status(401).json({ error: "Você não pode aprovar usuários de outra instituição" });
                }

                await User.updateOne({ _id: userid }, { $set: { active: true } });

                const destinatario = user.email;
                const assunto = 'Schoob - Cadastro aprovado!';
                const conteudo = `Parabéns, ${user.nome}! Seu cadastro foi aprovado pela sua instituição de ensino. \nAgora você pode usufruir de nossos serviços!\n\nAtenciosamente,\nEquipe Schoob.`;

                await enviarEmail(destinatario, assunto, conteudo);

                return res.status(200).send({ message: "Cadastro liberado!" });
            } else {
                const destinatario = user.email;
                const assunto = 'Schoob - Conta não aprovada!';
                const conteudo = `Poxa, ${user.nome}, infelizmente sua instituição de ensino reprovou seu cadastro! Tente novamente ou entre em contato com a sua instituição para saber o motivo da reprovação!\n\nAtenciosamente,\nEquipe Schoob.`;

                await enviarEmail(destinatario, assunto, conteudo);

                await User.findByIdAndDelete(userid);

                return res.status(200).send({ message: "Usuário deletado!" });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Não foi possível aprovar o cadastro' });
        }
    }

    static async usuariosPendentes(req, res) {
        const { instid } = req.headers;
        try {
            const inst = await Instituicao.findById(instid);
            if (!inst) {
                return res.status(404).json({ error: "Instituição não encontrada" });
            }

            const usersToApprove = await User.find({active: false, instituicao: instid})

            return res.status(200).json(usersToApprove);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Não foi possível buscar os usuários pendentes de aprovação' });

        }
    }

}

module.exports = InstituicaoController