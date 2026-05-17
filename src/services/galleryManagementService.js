import { sequelize } from '../config/db.js'
import { AwsService } from "./awsService.js";
import { GalleryService } from "./galleryService.js";
import { GalleryPictureService } from "./galleryPictureService.js";

const awsService = new AwsService();
const galleryService = new GalleryService();
const galleryPictureService = new GalleryPictureService();

export class GalleryManagementService {
    async createGallery(galleryData) {
        const transaction = await sequelize.transaction();

        const uploadedFileKeys = [];

        try {
            // Stores gallery info 
            const gallery = await galleryService.createGallery(galleryData, transaction);

            const galleryPictures = [];

            // Loops through all pictures
            for (let i = 0; i < galleryData.files.length; i++) {
                const file = galleryData.files[i];

                // Uploads req.file to aws s3
                const fileKey = await awsService.uploadGalleryPic(file);
                
                uploadedFileKeys.push(fileKey);

                // Stores picture file key or path associated with gallery
                const galleryPicture = await galleryPictureService.addGalleryPicture(gallery.id, fileKey, transaction);

                galleryPictures.push(galleryPicture);
            };

            await transaction.commit();

            return {
                ...gallery.toJSON(),
                galleryPictures: galleryPictures,
            };
        } catch (err) {
            await transaction.commit();

            for (let i = 0; i < uploadedFileKeys.length; i++) {
                const fileKey = uploadedFileKeys[i];

                await awsService.hardDeleteGalleryPic(fileKey);
            }

            throw err;
        }
    };

    async getAllGalleries() {
        // Retrieves all galleries 
        const allGalleries = await galleryService.getAllGalleries();

        const galleriesToSend = [];

        // Loops through all galleries
        for (let i = 0; i < allGalleries.length; i++) {
            const gallery = allGalleries[i];
            const galleryPicturesToSend = [];

            // Retrieves all picture path or file key associated to individual gallery
            const galleryPictures = await galleryPictureService.getAllPicturesByGallery(gallery.id);

            // Loops through all pictures
            for (let j = 0; j < galleryPictures.length; j++) {
                const galleryPicture = galleryPictures[j];
                
                // Retrieves picture url from aws s3
                const presignedUrl = await awsService.getGalleryPic(galleryPicture.gpi_pic_path);

                galleryPicturesToSend.push({
                    ...galleryPicture.toJSON(),
                    gpi_pic_url : presignedUrl
                });
            };

            galleriesToSend.push({
                ...gallery.toJSON(),
                galleryPictures: galleryPicturesToSend,
            });
        };

        return galleriesToSend;
    };

    async getAllTemporarilyDeletedGalleries() {
        const temporarilyDeletedGalleries = await galleryService.getAllTemporarilyDeletedGalleries();

        return temporarilyDeletedGalleries;
    };

    async updateGalleryInfo(galleryId, galleryData) {
        const transaction = await sequelize.transaction();

        // Newly uploaded pictures
        const uploadedFileKeys = [];

        // Old pictures to delete after commit
        const oldFileKeysToDelete = [];

        try {
            const gallery = await galleryService.findById(galleryId, transaction);

            // Updates gallery info
            await galleryService.updateGalleryInfo(gallery, galleryData, transaction);

            // Retrieves current pictures associated to gallery
            const galleryPictures = await galleryPictureService.getAllPicturesByGallery(galleryId, transaction);

            // Finds deleted pictures againts existing pictures id
            const picturesToDelete = galleryPictures.filter(galleryPicture => !galleryData.existingGalleryPicturesIds.includes(galleryPicture.id)); 

            for (let i = 0; i < picturesToDelete.length; i++) {
                const galleryPicture = picturesToDelete[i];

                // Soft deletes picture in table
                await galleryPictureService.softDeleteGalleryPictureById(galleryPicture, transaction);

                oldFileKeysToDelete.push(galleryPicture.gpi_pic_path);
            }

            const galleryPicturesToSend = [];

            // Loops through all pictures
            for (let i = 0; i < galleryData.files.length; i++) {
                const file = galleryData.files[i];

                // Uploads gallery pictures to aws s3
                const fileKey = await awsService.uploadGalleryPic(file);

                uploadedFileKeys.push(fileKey);

                // Stores new picture file key or path associated with gallery
                const galleryPicture = await galleryPictureService.addGalleryPicture(gallery.id, fileKey, transaction);

                galleryPicturesToSend.push(galleryPicture);
            };

            await transaction.commit();

            for (let i = 0; i < oldFileKeysToDelete.length; i++) {
                const fileKey = oldFileKeysToDelete[i];

                // Hard deletes picture in aws s3 bucket
                await awsService.hardDeleteGalleryPic(fileKey);
            }

            return {
                ...gallery.toJSON(),
                galleryPictures: galleryPicturesToSend,
            };
        } catch (err) {
            await transaction.commit();

            // Cleanups newly uploaded files
            for (let i = 0; i < uploadedFileKeys.length; i++) {
                const fileKey = uploadedFileKeys[i];

                await awsService.hardDeleteGalleryPic(fileKey);
            }

            throw err;
        }
    };

    async updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted) {
        const gallery = await galleryService.updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted);
        
        return gallery;
    };

    async softDeleteGallery(galleryId) {
        const transaction = await sequelize.transaction();

        let galleryPictures = [];

        try {
            const gallery = await galleryService.findById(galleryId, transaction);

            // Retrieves current pictures associated to gallery
            galleryPictures = await galleryPictureService.getAllPicturesByGallery(gallery.id, transaction);

            // Soft deletes gallery in table
            await galleryService.softDeleteGallery(gallery, transaction);

            // Soft deletes gallery picture in table
            await galleryPictureService.softDeleteGalleryPicturesByGalleryId(galleryId, transaction);

            await transaction.commit();

            // Hard deletes gallery pictures in aws s3
            for (let i = 0; i < galleryPictures.length; i++) {
                const fileKey = galleryPictures[i].gpi_pic_path;

                await awsService.hardDeleteGalleryPic(fileKey);
            }
        } catch (err) {
            await transaction.rollback();
            
            throw err;
        }
    };
}