import { VisionistaService } from "./visionistaService.js";
import { AwsService } from "./awsService.js";

const visionistaService = new VisionistaService();
const awsService = new AwsService();

export class VisionistaManagementService {
    async addVisionista(visionistaData) {
        const fileKey = await awsService.uploadVisionistaPic(visionistaData.file);

        visionistaData = {
            ...visionistaData,
            fileKey : fileKey
        }

        const visionista = await visionistaService.createVisionista(visionistaData);

        return visionista;
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

    async updateVisionistaInfo(visionistaId, visionistaData) {
        const fileKey = await awsService.uploadVisionistaPic(visionistaData.file);

        visionistaData = {
            ...visionistaData,
            fileKey : fileKey
        }

        const visionista = await visionistaService.updateVisionistaInfo(visionistaId, visionistaData);

        return visionista;
    };

    async updateIsArchivedStatus(visionistaId, isArchived) {
        const visionista = await visionistaService.updateIsArchivedStatus(visionistaId, isArchived);

        return visionista;
    };

    async updateIsTemporarilyDeletedStatus(visionistaId, isTemporarilyDeleted) {
        const visionista = await visionistaService.updateIsTemporarilyDeletedStatus(visionistaId, isTemporarilyDeleted);

        return visionista;
    };

    async softDeleteVisionista(visionistaId) {
        const visionista = await visionistaService.softDeleteVisionista(visionistaId);

        return visionista;
    };
}