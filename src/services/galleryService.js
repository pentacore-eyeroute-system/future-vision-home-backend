import { Gallery } from "../models/galleryModel.js";
import { GalleryPicture } from "../models/galleryPictureModel.js";

// Deterministic ordering: gal_date is not unique, so id breaks ties and keeps
// pages stable across requests.
const LIST_ORDER = [['gal_date', 'DESC'], ['id', 'DESC']];

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

    async getAllGalleries({ limit, offset }) {
        // distinct: true so the hasMany join does not inflate the count
        const { rows, count } = await Gallery.findAndCountAll(
            {
                where: { gal_is_temporarily_deleted: false },
                include: [
                    {
                        model: GalleryPicture
                    }
                ],
                order: LIST_ORDER,
                limit,
                offset,
                distinct: true,
            }
        );

        return { rows, count };
    };

    async findById(galleryId, transaction) {
        const gallery = await Gallery.findByPk(galleryId, { transaction });

        return gallery;
    };

    async getAllTemporarilyDeletedGalleries({ limit, offset }) {
        const { rows, count } = await Gallery.findAndCountAll({
            where : {
                gal_is_temporarily_deleted: true,
                deletedAt: null,
            },
            order: LIST_ORDER,
            limit,
            offset,
        });

        return { rows, count };
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