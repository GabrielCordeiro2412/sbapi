const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cpf } = require('cpf-cnpj-validator');
const crypto = require('crypto');

const authConfig = require('../config/auth.json');
const enviarEmail = require('../functions/sendMail')
const User = require('../models/UserModel');

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret)
}
class UserController {

    // Cria um novo usuário
    static async criarUsuario(req, res) {
        const { nome, email, password, userCpf, parentsControl, passwordParents, pushToken } = req.body;
        const { instituicaoid, turmaid } = req.headers;

        try {
            const usuarioEmailExistente = await User.findOne({ email });
            if (usuarioEmailExistente) {
                return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
            }

            if (!cpf.isValid(userCpf)) {
                return res.status(400).json({ error: 'CPF inválido' });
            }

            const novoUsuario = await User.create({
                nome,
                email,
                password,
                cpf: userCpf,
                parentsControl,
                passwordParents,
                instituicao: instituicaoid,
                turma: turmaid,
                pushToken: pushToken ? pushToken : ""
            });

            return res.status(201).json(novoUsuario);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar o usuário' });
        }
    }

    //Login do usuario
    static async login(req, res) {
        const { email, password } = req.body;
        try {
            const usuarioEmailExistente = await User.findOne({ email }).populate('turma instituicao');
            if (!usuarioEmailExistente) {
                return res.status(404).json({ error: 'E-mail ou senha inválidos' });
            }
            const senhaCorreta = await bcrypt.compare(password, usuarioEmailExistente.password);
            if (!senhaCorreta) {
                return res.status(404).json({ error: 'E-mail ou senha inválidos' });
            }

            if (!usuarioEmailExistente.active) {
                return res.status(404).json({ error: 'Cadastro pendente de aprovação!' });
            }

            usuarioEmailExistente.password = undefined;

            return res.status(200).json({ usuario: usuarioEmailExistente, token: generateToken({ id: usuarioEmailExistente.id }) });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Erro ao fazer login' });
        }
    }

    // Lista todos os usuários
    static async listarTodosUsuarios(req, res) {
        try {
            const usuarios = await User.find().populate('instituicao turma');

            return res.status(200).json(usuarios);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar os usuários' });
        }
    }

    // Obtém um usuário pelo ID
    static async obterUsuarioPorId(req, res) {
        const { usuarioId } = req.params;

        try {
            const usuario = await User.findById(usuarioId).populate('instituicao turma');

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.status(200).json({ usuario: usuario, token: generateToken({ id: usuario.id }) });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao obter o usuário' });
        }
    }

    // Atualiza um usuário pelo ID
    static async atualizarUsuario(req, res) {
        const { usuarioId } = req.params;
        const { nome, email, cpf, dtNascimento, parentsControl, passwordParents, avatar, pushToken, apelido } = req.body;
        const { instituicaoid, turmaid } = req.headers;

        try {

            const usuario = await User.findById(usuarioId);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const updates = {};
            if (nome) updates.nome = nome;
            if (email) updates.email = email;
            if (cpf) updates.cpf = cpf;
            if (dtNascimento) updates.dtNascimento = dtNascimento;
            if (parentsControl !== undefined) updates.parentsControl = parentsControl;
            if (passwordParents) updates.passwordParents = passwordParents;
            if (instituicaoid) updates.instituicao = instituicaoid;
            if (turmaid) updates.turma = turmaid;
            if (avatar) updates.avatar = avatar;
            if (pushToken) updates.pushToken = pushToken;
            if (apelido) updates.apelido = apelido;

            const usuarioAtualizado = await User.findByIdAndUpdate(usuarioId, { $set: updates }, { new: true }).populate('instituicao turma');

            return res.status(200).json(usuarioAtualizado);
        } catch (error) {
            console.log(error)
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Token inválido' });
            }
            return res.status(500).json({ error: 'Erro ao atualizar o usuário' });
        }
    }

    // Exclui um usuário pelo ID
    static async deletarUsuario(req, res) {
        const { usuarioId } = req.params;

        try {
            const usuario = await User.findByIdAndDelete(usuarioId).populate('instituicao turma');

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.status(200).json({ message: 'Usuário excluído com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir o usuário' });
        }
    }

    static async getPontosUsuario(req, res) {
        const { userId } = req.params;

        try {
            const usuario = await User.findById(userId);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.status(200).json({ spoints: usuario.spoints, bpoints: usuario.bpoints });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao obter os pontos do usuário' });
        }
    }

    static async forgotPassword(req, res) {
        const { email } = req.body;

        try {
            const user = await User.findOne({ email })

            if (!user)
                return res.status(400).send({ error: 'Usuario invalido!' })

            const token = crypto.randomBytes(3).toString('hex');
            console.log(token)
            const now = new Date();
            now.setHours(now.getHours() + 1);

            await User.findByIdAndUpdate(user.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now
                }
            });

            const assunto = "Recuperação de Senha"
            const conteudo = `Olá ${user.nome}, tudo bem?Aparentemente você esqueceu/perdeu sua senha né? :( Não tem problema! Utilize este código no seu aplicativo para criar uma nova senha! Seu código é: ${token} e ele expira daqui uma hora!`

            await enviarEmail(email, assunto, conteudo).then(() => {
                console.log("Funcionou, email enviado com sucesso!")
            }).catch(err => console.log(err))

            return res.send({ message: "Código enviado com sucesso! Cheque seu email!" })

        } catch (err) {
            return res.status(400).send({ error: 'Erro ao Alterar senha!' })
        }
    }

    static async validatePassCode(req, res) {
        const { email, token } = req.body;
        try {
            const user = await User.findOne({ email })
                .select('+passwordResetToken passwordResetExpires');

            if (token !== user.passwordResetToken)
                return res.status(400).send({ error: 'Código inválido' })
            console.log(user.passwordResetToken, token)
            const now = new Date();

            if (now > user.passwordResetExpires)
                return res.status(400).send({ error: 'Código expirado, gere outro!' })

            return res.status(200).send({ token: user.passwordResetToken, status: true });
        } catch (err) {
            return res.send({ error: "Erro ao alterar a senha!" })
        }
    }

    static async resetPassword(req, res) {
        const { email, token, password } = req.body;

        try {
            const user = await User.findOne({ email })
                .select('+passwordResetToken passwordResetExpires');

            if (token !== user.passwordResetToken)
                return res.status(400).send({ error: 'Código inválido' })

            const now = new Date();

            if (now > user.passwordResetExpires)
                return res.status(400).send({ error: 'Código expirado, gere outro!' })

            user.password = password;

            await user.save();

            return res.send({ message: 'Senha alterada com sucesso!' });


        } catch (err) {
            return res.send({ error: "Erro ao alterar a senha!" })
        }
    }

    static async getUserByInstituicao(req, res) {
        const { inst } = req.params;
        try {
            const usuarios = await User.find({ instituicao: inst }).populate('instituicao turma');

            return res.status(200).json(usuarios);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar os usuários' });
            //console.log(error)
        }
    }

}

module.exports = UserController;
