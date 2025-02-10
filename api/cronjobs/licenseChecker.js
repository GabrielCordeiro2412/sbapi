const { checkLicenseValidity } = require('../utils/licenseUtils');
const License = require('../models/LicenseModel');
const cron = require('node-cron');
const enviarEmail = require('../functions/sendMail');

async function checkLicensesValidityAndUpdate() {
    try {
        const licenses = await License.find().populate('instituicao');

        const expiredLicenseIds = [];

        for (const license of licenses) {
            if(license.active && license.instituicao){
                const instid = license.instituicao._id.toString();
                const isLicenseValid = await checkLicenseValidity(instid);
                if (!isLicenseValid) {
                    console.log(`A licença para a instituição ${license.instituicao.sigla} expirou!`);
                    expiredLicenseIds.push(license._id);
                    await enviarEmail(license.instituicao.email, "Sua licença expirou :( Renove agora com desconto!", '<p>Sua Licensa expirou, renove<p>')
                }
            }
        }

        if (expiredLicenseIds.length > 0) {
            await License.updateMany({ _id: { $in: expiredLicenseIds } }, { $set: { active: false } });
            console.log('Licenças expiradas atualizadas com sucesso.');
        }

        console.log('Verificação e atualização das licenças concluídas.');
    } catch (error) {
        console.error('Erro ao verificar a validade das licenças e atualizar:', error);
    }
}

cron.schedule('00 00 * * *', () => {
    console.log('Verificando e atualizando licenças...');
    checkLicensesValidityAndUpdate();
}, {
    scheduled: true,
});