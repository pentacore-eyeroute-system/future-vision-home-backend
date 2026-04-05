import { Visionista } from "../models/visionistaModel.js";

export class VisionistaService {
    async createVisionista(visionistaData) {
        const visionista = await Visionista.create({
            vis_fullname : visionistaData.fullname,
            vis_age : visionistaData.age,
            vis_story : visionistaData.story,
            vis_pic_path : visionistaData.fileKey,
            vis_isArchived : false,
            vis_isTemporarilyDeleted: false,
        });

        return visionista;
    };

    async getAllVisionistas() {
        const visionistas = await Visionista.findAll();

        return visionistas;
    };

    async updateVisionistaInfo(visionistaId, visionistaData) {
        const visionista = await Visionista.findByPk(visionistaId);

        if (!visionista) {
            throw new Error('Visionista not found')
        }

        await visionista.update({
            vis_fullname : visionistaData.fullname,
            vis_age : visionistaData.age,
            vis_story : visionistaData.story,
            vis_pic_path : visionistaData.fileKey,
        });

        return visionista;
    };

    async updateIsArchivedStatus(visionistaId, isArchived) {
        const visionista = await Visionista.findByPk(visionistaId);

        if (!visionista) {
            throw new Error('Visionista not found')
        }

        await visionista.update({
            vis_isArchived : isArchived,
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

    async softDeleteVisionista(visionistaId) {
        const visionista = await Visionista.findByPk(visionistaId);

        if (!visionista) {
            throw new Error('Visionista not found')
        }

        await visionista.destroy();

        return visionista;
    };
}