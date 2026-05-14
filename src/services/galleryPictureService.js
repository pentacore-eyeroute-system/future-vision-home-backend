import { GalleryPicture } from "../models/galleryPictureModel.js";

export class GalleryPictureService {
    async addGalleryPicture(linkedGalleryId, fileKey, transaction) {
        const galleryPicture = await GalleryPicture.create({
            gpi_linked_gallery_id : linkedGalleryId,
            gpi_pic_path : fileKey,
        }, {
            transaction
        });

        return galleryPicture;
    };

    async getAllPicturesByGallery(linkedGalleryId, transaction) {
        const galleryPictures = await GalleryPicture.findAll({ where: { gpi_linked_gallery_id : linkedGalleryId }, transaction });

        return galleryPictures;
    };

    async softDeleteGalleryPictureById(galleryPicture, transaction) {
        await galleryPicture.destroy({ transaction });
    };

    async softDeleteGalleryPicturesByGalleryId(galleryId, transaction) {
        const galleryPictures = await GalleryPicture.findAll({ where: { gpi_linked_gallery_id : galleryId }, transaction });

        for (let i = 0; i < galleryPictures.length; i++) {
            const galleryPicture = galleryPictures[i];

            await galleryPicture.destroy({ transaction });
        };
    };
};