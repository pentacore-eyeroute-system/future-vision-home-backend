import { Visionista } from "../models/visionistaModel.js";

export class VisionistaService {
    async createVisionista(visionistaData, transaction) {
        const visionista = await Visionista.create({
            vis_fullname : visionistaData.fullname,
            vis_age : visionistaData.age,
            vis_story : visionistaData.story,
            vis_pic_path : visionistaData.fileKey,
            vis_isArchived : false,
            vis_isTemporarilyDeleted: false,
        }, {
            transaction
        });

        return visionista;
    };

    async getAllVisionistas() {
        const visionistas = await Visionista.findAll();

        return visionistas;
    };

    async findById(visionistaId, transaction) {
        const visionista = await Visionista.findByPk(visionistaId, { transaction });

        if (!visionista) {
            throw new Error('Visionista not found')
        }        

        return visionista;
    };

    async updateVisionistaInfo(visionista, visionistaData, transaction) {
        await visionista.update({
            vis_fullname : visionistaData.fullname,
            vis_age : visionistaData.age,
            vis_story : visionistaData.story,
            vis_pic_path : visionistaData.fileKey,
        },{
            transaction
        });

        return visionista;
    };

    async updateIsTemporarilyDeletedStatus(visionistaId, isTemporarilyDeleted) {
        const visionista = await Visionista.findByPk(visionistaId);

        if (!visionista) {
            throw new Error('Visionista not found')
        }

        await visionista.update({
            vis_isTemporarilyDeleted: isTemporarilyDeleted,
        });

        return visionista;
    };

    async softDeleteVisionista(visionista, transaction) {
        await visionista.destroy({ transaction });

        return visionista;
    };
}