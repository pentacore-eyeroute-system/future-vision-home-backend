import pkg from "sequelize";
const { Op } = pkg;
import { Visionista } from "../models/visionistaModel.js";

export class VisionistaService {
    async createVisionista(visionistaData, transaction) {
        const visionista = await Visionista.create({
            vis_fullname : visionistaData.fullname,
            vis_age : visionistaData.age,
            vis_story : visionistaData.story,
            vis_pic_path : visionistaData.fileKey,
            vis_is_temporarily_deleted: false,
        }, {
            transaction
        });

        return visionista;
    };

    async getAllVisionistas() {
        const visionistas = await Visionista.findAll({ where: { vis_is_temporarily_deleted: false } });

        return visionistas;
    };

    async findById(visionistaId, transaction) {
        const visionista = await Visionista.findByPk(visionistaId, { transaction });

        if (!visionista) {
            const error = new Error('Visionista not found.');
            error.statusCode = 404;
            
            throw error;
        }        

        return visionista;
    };

    async getAllTemporarilyDeletedVisionistas() {
        const temporarilyDeletedVisionistas = await Visionista.findAll({ 
            where : {
                vis_is_temporarily_deleted: true,
                deletedAt: null,
            }, 
        });

        return temporarilyDeletedVisionistas;
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
            const error = new Error('Visionista not found.');
            error.statusCode = 404;
            
            throw error;
        }

        await visionista.update({
            vis_is_temporarily_deleted: isTemporarilyDeleted,
        });

        return visionista;
    };

    async softDeleteVisionista(visionista, transaction) {
        await visionista.destroy({ transaction });

        return visionista;
    };
}