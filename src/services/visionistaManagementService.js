import { VisionistaService } from "./visionistaService.js";
import { AwsService } from "./awsService.js";
import { sequelize } from "../config/db.js";

const visionistaService = new VisionistaService();
const awsService = new AwsService();

export class VisionistaManagementService {
    async addVisionista(visionistaData) {
        let fileKey = null;
        
        const transaction = await sequelize.transaction();

        try { 
            fileKey = await awsService.uploadVisionistaPic(visionistaData.file);

            visionistaData = {
                ...visionistaData,
                fileKey : fileKey
            }

            const visionista = await visionistaService.createVisionista(visionistaData, transaction);

            await transaction.commit();

            return visionista;
        } catch (err) {
            await transaction.rollback();

            if (fileKey) {
                await awsService.hardDeleteVisionistaPic(fileKey);
            }

            throw err;
        }        
    };

    async getAllVisionistas() {
        const visionistas = await visionistaService.getAllVisionistas();

        // Retrieves visionista's image url from s3
        const completeVisionistasInfo = await Promise.all(
            visionistas.map(async (visionista) => {
                const preSignedUrl = await awsService.getVisionistaPic(visionista.vis_pic_path);

                return {
                    ...visionista.toJSON(),
                    vis_pic_url : preSignedUrl,
                }
            })
        );

        return completeVisionistasInfo;
    };

    async getAllTemporarilyDeletedVisionistas() {
        const temporarilyDeletedVisionistas = await visionistaService.getAllTemporarilyDeletedVisionistas();

        return temporarilyDeletedVisionistas.map(visionista => ({
            ...visionista.toJSON(),
            type: 'visionista'
        }));
    };

    async updateVisionistaInfo(visionistaId, visionistaData) {
        let newFileKey = null;
        let oldFileKey = null;

        const transaction = await sequelize.transaction();

        try {
            const visionista = await visionistaService.findById(visionistaId, transaction);

            // Retrieves existing file key in table
            oldFileKey = visionista.vis_pic_path;

            // Checks if new file was sent
            if (visionistaData.file) {
                // Uploads the new picture
                newFileKey = await awsService.uploadVisionistaPic(visionistaData.file);

                visionistaData.fileKey = newFileKey;
            } else {
                // If no new file, keep the OLD path so it doesn't get overwritten with null
                visionistaData.fileKey = oldFileKey;
            }

            // Updates visionista info in table
            const updatedVisionista = await visionistaService.updateVisionistaInfo(visionista, visionistaData, transaction);

            await transaction.commit();

            // Deletes picture in aws s3 if new picture was sent and there is an existing picture to delete
            if (visionistaData.file && oldFileKey) {
                await awsService.hardDeleteVisionistaPic(oldFileKey);
            }

            return updatedVisionista;
        } catch (err) {
            await transaction.rollback();

            // Cleanups newly uploaded image
            if (newFileKey) {
                await awsService.hardDeleteVisionistaPic(newFileKey);
            }

            throw err;
        }    
    };

    async updateIsTemporarilyDeletedStatus(visionistaId, isTemporarilyDeleted) {
        const visionista = await visionistaService.updateIsTemporarilyDeletedStatus(visionistaId, isTemporarilyDeleted);

        return visionista;
    };

    async softDeleteVisionista(visionistaId) {
        const transaction = await sequelize.transaction();

        try {
            const visionista = await visionistaService.findById(visionistaId, transaction);

            // Soft deletes visionista in table
            await visionistaService.softDeleteVisionista(visionista, transaction);

            await transaction.commit();

            // Hard deletes visionista pic in aws s3
            await awsService.hardDeleteVisionistaPic(visionista.vis_pic_path);
        } catch (err) {
            await transaction.rollback();

            throw err;
        }
    };
}