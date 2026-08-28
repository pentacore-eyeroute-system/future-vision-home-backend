import { GalleryManagementService } from "../services/galleryManagementService.js";

const galleryManagementService = new GalleryManagementService();

export class GalleryController {
    createGallery = async (req, res) => {
        try {
            const galleryData = {
                title : req.body.title,
                description : req.body.description,
                date : req.body.date,
                files : req.files,
            };

            const result = await galleryManagementService.createGallery(galleryData, req.user.id, req);
 
            res.status(201).json({
                success: true,
                message: 'Gallery creation successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        }
    };

    getAllGalleries = async (req, res) => {
        try {
            const result = await galleryManagementService.getAllGalleries();

            res.status(200).json({
                success: true,
                message: 'Gallery retrieval successful',
                result
            });    
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        }
    };

    getAllTemporarilyDeletedGalleries = async (req, res) => {
        try {
            const result = await galleryManagementService.getAllTemporarilyDeletedGalleries();

            res.status(200).json({
                success: true,
                message: 'Temporarily deleted galleries retrieval success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });                  
        }
    };

    updateGalleryInfo = async (req, res) => {
        try {
            const galleryId = req.params.id;
            const galleryData = {
                title : req.body.title,
                description : req.body.description,
                date : req.body.date,
                files : req.files,
                existingGalleryPicturesIds: JSON.parse(req.body.existingGalleryPicturesIds || '[]'),
            };

            const result = await galleryManagementService.updateGalleryInfo(galleryId, galleryData, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Gallery update successful',
                result
            });  
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        }
    };

    updateIsTemporarilyDeletedStatus = async (req, res) => {
        try {
            const galleryId = req.params.id;
            const isTemporarilyDeleted = req.body.isTemporarilyDeleted;

            const result = await galleryManagementService.updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Gallery isTemporarilyDeleted status update success',
                result
            });
        } catch (err) {
            if (err.statusCode) {
                return res.status(err.statusCode).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });    
        }
    };

    softDeleteGallery = async (req, res) => {
        try {
            const galleryId = req.params.id;

            await galleryManagementService.softDeleteGallery(galleryId, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Gallery soft delete success',
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });    
        } 
    };
};