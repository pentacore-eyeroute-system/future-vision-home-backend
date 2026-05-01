import { GalleryPicture } from "../models/galleryPictureModel.js";

export class GalleryPictureService {
    async addGalleryPicture(linkedGalleryId, fileKey) {
        const galleryPicture = await GalleryPicture.create({
            gpi_linked_gallery_id : linkedGalleryId,
            gpi_pic_path : fileKey,
        });

        return galleryPicture;
    };

    async getAllPicturesByGallery(linkedGalleryId) {
        const galleryPictures = await GalleryPicture.findAll({ where: { gpi_linked_gallery_id : linkedGalleryId } });

        if (!galleryPictures) {
            throw new Error('Gallery picture not found');
        };

        return galleryPictures;
    };

    async softDeleteGaleryPictureById(galleryPictureId) {
        const galleryPicture = await GalleryPicture.findByPk(galleryPictureId);

        if (!galleryPicture) {
            throw new Error('Gallery picture not found');
        };

        await galleryPicture.destroy();
    };

    async softDeleteNewsPicturesByGalleryId(galleryId) {
        const galleryPictures = await GalleryPicture.findAll({ where: { gpi_linked_gallery_id : galleryId } });

        if (!galleryPictures) {
            throw new Error('Gallery pictures not found');
        };

        for (let i = 0; i < galleryPictures.length; i++) {
            const galleryPicture = galleryPictures[i];

            await galleryPicture.destroy();
        };
    };
};