import { AwsService } from "./awsService.js";
import { GalleryService } from "./galleryService.js";
import { GalleryPictureService } from "./galleryPictureService.js";

const awsService = new AwsService();
const galleryService = new GalleryService();
const galleryPictureService = new GalleryPictureService();

export class GalleryManagementService {
    async createGallery(galleryData) {
        // Stores gallery info 
        const gallery = await galleryService.createGallery(galleryData);
        
        let galleryPictures = [];

        // Loops through all pictures
        for (let i = 0; i < galleryData.files.length; i++) {
            const file = galleryData.files[i];

            // Uploads req.file to aws s3
            const fileKey = await awsService.uploadGalleryPic(file);

            // Stores picture file key or path associated with gallery
            const galleryPicture = await galleryPictureService.addGalleryPicture(gallery.id, fileKey);

            galleryPictures.push(galleryPicture);
        };

        return {
            ...gallery.toJSON(),
            galleryPictures: galleryPictures,
        };
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

    async updateGalleryInfo(galleryId, galleryData) {
        // Updates gallery info
        const gallery = await galleryService.updateGalleryInfo(galleryId, galleryData);

        // Retrieves current pictures associated to gallery
        const galleryPictures = await galleryPictureService.getAllPicturesByGallery(galleryId);

        // Finds deleted pictures againts existing pictures id
        const picturesToDelete = galleryPictures.filter(galleryPicture => !galleryData.existingGalleryPicturesIds.includes(galleryPicture.id)); 

        for (let i = 0; i < picturesToDelete.length; i++) {
            const galleryPicture = picturesToDelete[i];

            // Soft deletes picture in table
            await galleryPictureService.softDeleteGaleryPictureById(galleryPicture.id);

            // Hard deletes picture in aws s3 bucket
            await awsService.hardDeleteGalleryPic(galleryPicture.gpi_pic_path);
        }

        let galleryPicturesToSend = [];

        // Loops through all pictures
        for (let i = 0; i < galleryData.files.length; i++) {
            const file = galleryData.files[i];

            // Uploads gallery pictures to aws s3
            const fileKey = await awsService.uploadGalleryPic(file);

            // Stores new picture file key or path associated with gallery
            const galleryPicture = await galleryPictureService.addGalleryPicture(gallery.id, fileKey);

            galleryPicturesToSend.push(galleryPicture);
        };

        return {
            ...gallery.toJSON(),
            galleryPictures: galleryPicturesToSend,
        };
    };

    async updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted) {
        const gallery = await galleryService.updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted);
        
        return gallery;
    };

    async softDeleteGallery(galleryId) {
        // Soft deletes gallery in table
        await galleryService.softDeleteGallery(galleryId);

        // Soft deletes gallery picture in table
        await galleryPictureService.softDeleteNewsPicturesByGalleryId(galleryId);
    };
}