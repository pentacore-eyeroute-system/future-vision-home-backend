import { z } from "zod";
import { GalleryManagementService } from "../services/galleryManagementService.js";
import { xssSafeString, optionalXssSafeString, getZodErrorMessage } from "../utils/sanitizeUtil.js";

const galleryManagementService = new GalleryManagementService();

const createGallerySchema = z.object({
    title: xssSafeString("Title", 255),
    description: optionalXssSafeString("Description", 5000),
    date: z.string({ required_error: "Date is required" }).trim().min(1, "Date is required")
});

const updateGallerySchema = z.object({
    title: xssSafeString("Title", 255),
    description: optionalXssSafeString("Description", 5000),
    date: z.string({ required_error: "Date is required" }).trim().min(1, "Date is required")
});

const isTemporarilyDeletedSchema = z.object({
    isTemporarilyDeleted: z.union([z.boolean(), z.string().transform(v => v === 'true' || v === '1')])
});

export class GalleryController {
    createGallery = async (req, res) => {
        try {
            const validation = createGallerySchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "At least one gallery picture file is required"
                });
            }

            const galleryData = {
                title : validation.data.title,
                description : validation.data.description || "",
                date : validation.data.date,
                files : req.files,
            };

            const result = await galleryManagementService.createGallery(galleryData, req.user.id, req);
 
            res.status(201).json({
                success: true,
                message: 'Gallery creation successful',
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

    getAllGalleries = async (req, res) => {
        try {
            const result = await galleryManagementService.getAllGalleries();

            res.status(200).json({
                success: true,
                message: 'Gallery retrieval successful',
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

    getAllTemporarilyDeletedGalleries = async (req, res) => {
        try {
            const result = await galleryManagementService.getAllTemporarilyDeletedGalleries();

            res.status(200).json({
                success: true,
                message: 'Temporarily deleted galleries retrieval success',
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

    updateGalleryInfo = async (req, res) => {
        try {
            const galleryId = req.params.id;
            const validation = updateGallerySchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            let existingGalleryPicturesIds = [];
            try {
                existingGalleryPicturesIds = JSON.parse(req.body.existingGalleryPicturesIds || '[]');
            } catch (e) {
                existingGalleryPicturesIds = [];
            }

            const galleryData = {
                title : validation.data.title,
                description : validation.data.description || "",
                date : validation.data.date,
                files : req.files,
                existingGalleryPicturesIds,
            };

            const result = await galleryManagementService.updateGalleryInfo(galleryId, galleryData, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Gallery update successful',
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

    updateIsTemporarilyDeletedStatus = async (req, res) => {
        try {
            const galleryId = req.params.id;
            const validation = isTemporarilyDeletedSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const isTemporarilyDeleted = validation.data.isTemporarilyDeleted;

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
};