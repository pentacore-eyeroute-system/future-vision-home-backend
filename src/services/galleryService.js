import { Gallery } from "../models/galleryModel.js";

export class GalleryService {
    async createGallery(galleryData) {
        const gallery = await Gallery.create({
            gal_title : galleryData.title,
            gal_description : galleryData.description,
            gal_date : galleryData.date,
            gal_isTemporarilyDeleted : false,
        });

        return gallery;
    };

    async getAllGalleries() {
        const gallery = await Gallery.findAll();

        return gallery;
    };

    async updateGalleryInfo(galleryId, galleryData) {
        const gallery = await Gallery.findByPk(galleryId);

        if (!gallery) {
            throw new Error('Gallery not found');
        };

        await gallery.update({
            gal_title : galleryData.title,
            gal_description : galleryData.description,
            gal_date : galleryData.date,
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

    async softDeleteGallery(galleryId) {
        const gallery = await Gallery.findByPk(galleryId);

        if (!gallery) {
            throw new Error('Gallery not found');
        };

        await gallery.destroy();
    };
}