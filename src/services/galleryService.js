import { Gallery } from "../models/galleryModel.js";

export class GalleryService {
    async createGallery(galleryData, transaction) {
        const gallery = await Gallery.create({
            gal_title : galleryData.title,
            gal_description : galleryData.description,
            gal_date : galleryData.date,
            gal_isTemporarilyDeleted : false,
        }, {
            transaction
        });

        return gallery;
    };

    async getAllGalleries() {
        const gallery = await Gallery.findAll();

        return gallery;
    };

    async findById(galleryId, transaction) {
        const gallery = await Gallery.findByPk(galleryId, { transaction });

        return gallery;
    };

    async updateGalleryInfo(gallery, galleryData, transaction) {
        await gallery.update({
            gal_title : galleryData.title,
            gal_description : galleryData.description,
            gal_date : galleryData.date,
        }, { 
            transaction 
        });

        return gallery;
    };

    async updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted) {
        const gallery = await Gallery.findByPk(galleryId);

        if (!gallery) {
            throw new Error('Gallery not found');
        };

        await gallery.update({
            gal_is_temporarily_deleted: isTemporarilyDeleted,
        });

        return gallery;
    };

    async softDeleteGallery(gallery, transaction) {
        await gallery.destroy({ transaction });
    };
}