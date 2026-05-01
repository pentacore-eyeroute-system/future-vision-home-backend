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

            const result = await galleryManagementService.createGallery(galleryData);
 
            res.status(201).json({
                success: true,
                message: 'Gallery creation successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
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
                error: err.message,
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

            const result = await galleryManagementService.updateGalleryInfo(galleryId, galleryData);

            res.status(200).json({
                success: true,
                message: 'Gallery update successful',
                result
            });  
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    };

    updateIsTemporarilyDeletedStatus = async (req, res) => {
        try {
            const galleryId = req.params.id;
            const isTemporarilyDeleted = req.body.isTemporarilyDeleted;

            const result = await galleryManagementService.updateIsTemporarilyDeletedStatus(galleryId, isTemporarilyDeleted);

            res.status(200).json({
                success: true,
                message: 'Gallery isTemporarilyDeleted status update success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        }
    };

    softDeleteGallery = async (req, res) => {
        try {
            const galleryId = req.params.id;

            await galleryManagementService.softDeleteGallery(galleryId);

            res.status(200).json({
                success: true,
                message: 'Gallery soft delete success',
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        } 
    };
};