import { sequelize } from '../config/db.js'
import { AwsService } from "./awsService.js";
import { GalleryService } from "./galleryService.js";
import { GalleryPictureService } from "./galleryPictureService.js";
import { AuditLogService, ACTION_TYPES, CATEGORIES, SEVERITIES } from "./auditLogService.js";

const awsService = new AwsService();
const galleryService = new GalleryService();
const galleryPictureService = new GalleryPictureService();
const auditLogService = new AuditLogService();

export class GalleryManagementService {
    async createGallery(galleryData, actorUserId, req) {
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

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_CREATED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Created gallery: "${gallery.gal_title}" (ID: ${gallery.id}).`,
                metadata: { galleryId: gallery.id, title: gallery.gal_title },
                request: req,
                transaction
            });

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

        const galleriesToSend = await Promise.all(
            // Loops through all galleries
            allGalleries.map(async (gallery) => {
                const pictures = await Promise.all(
                    // Retrieves all picture path or file key associated to individual gallery
                    gallery.GalleryPictures.map(async (picture) => {
                        // Retrieves picture url from aws s3
                        const presignedUrl = await awsService.getGalleryPic(picture.gpi_pic_path);

                        return {
                            ...picture.toJSON(),
                            gpi_pic_url : presignedUrl
                        };
                    })
                )

                return {
                    ...gallery.toJSON(),
                    galleryPictures: pictures,
                }            
            })
        );

        return galleriesToSend;
    };

    async getAllTemporarilyDeletedGalleries() {
        const temporarilyDeletedGalleries = await galleryService.getAllTemporarilyDeletedGalleries();

        return temporarilyDeletedGalleries.map(gallery => ({
            ...gallery.toJSON(),
            type: 'gallery'
        }));
    };

    async updateGalleryInfo(galleryId, galleryData, actorUserId, req) {
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

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_UPDATED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Updated gallery: "${gallery.gal_title}" (ID: ${galleryId}).`,
                metadata: { galleryId, title: gallery.gal_title },
                request: req,
                transaction
            });

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

    async updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted, actorUserId, req) {
        const gallery = await galleryService.updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted);
        
        await auditLogService.log({
            actorUserId,
            targetUserId: null,
            actionType: isTemporarilyDeleted ? ACTION_TYPES.CONTENT_DELETED : ACTION_TYPES.CONTENT_RESTORED,
            category: CATEGORIES.STAFF,
            severity: SEVERITIES.WARNING,
            isSecurityAlert: false,
            details: `${isTemporarilyDeleted ? 'Temporarily deleted' : 'Restored'} gallery: "${gallery.gal_title}" (ID: ${galleryId}).`,
            metadata: { galleryId, title: gallery.gal_title },
            request: req
        });

        return gallery;
    };

    async softDeleteGallery(galleryId, actorUserId, req) {
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

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_DELETED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.CRITICAL,
                isSecurityAlert: true,
                details: `Permanently deleted gallery: "${gallery.gal_title}" (ID: ${galleryId}).`,
                metadata: { galleryId, title: gallery.gal_title },
                request: req,
                transaction
            });

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