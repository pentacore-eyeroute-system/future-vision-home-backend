import { z } from "zod";
import { NewsManagementService } from "../services/newsManagementService.js";
import { xssSafeString, optionalXssSafeString, getZodErrorMessage } from "../utils/sanitizeUtil.js";

const newsManagementService = new NewsManagementService();

const createNewsSchema = z.object({
    title: xssSafeString("Title", 255),
    description: optionalXssSafeString("Description", 10000),
    date: z.string({ required_error: "Date is required" }).trim().min(1, "Date is required")
});

const updateNewsSchema = z.object({
    title: xssSafeString("Title", 255),
    description: optionalXssSafeString("Description", 10000),
    date: z.string({ required_error: "Date is required" }).trim().min(1, "Date is required")
});

const isTemporarilyDeletedSchema = z.object({
    isTemporarilyDeleted: z.union([z.boolean(), z.string().transform(v => v === 'true' || v === '1')])
});

export class NewsController {
    createNews = async (req, res) => {
        try {
            const validation = createNewsSchema.safeParse(req.body);
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
                    error: "At least one news picture file is required"
                });
            }

            const newsData = {
                title : validation.data.title,
                description : validation.data.description || "",
                date : validation.data.date,
                files : req.files,
            };

            const result = await newsManagementService.createNews(newsData, req.user.id, req);
 
            res.status(201).json({
                success: true,
                message: 'News creation successful',
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

    getAllNews = async (req, res) => {
        try {
            const result = await newsManagementService.getAllNews();

            res.status(200).json({
                success: true,
                message: 'News retrieval successful',
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

    getAllTemporarilyDeletedNews = async (req, res) => {
        try {
            const result = await newsManagementService.getAllTemporarilyDeletedNews();

            res.status(200).json({
                success: true,
                message: 'Temporarily deleted news retrieval success',
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

    updateNewsInfo = async (req, res) => {
        try {
            const newsId = req.params.id;
            const validation = updateNewsSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            let existingNewsPicturesIds = [];
            try {
                existingNewsPicturesIds = JSON.parse(req.body.existingNewsPicturesIds || '[]');
            } catch (e) {
                existingNewsPicturesIds = [];
            }

            const newsData = {
                title : validation.data.title,
                description : validation.data.description || "",
                date : validation.data.date,
                files : req.files,
                existingNewsPicturesIds,
            };

            const result = await newsManagementService.updateNewsInfo(newsId, newsData, req.user.id, req);            

            res.status(200).json({
                success: true,
                message: 'News update successful',
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
            const newsId = req.params.id;
            const validation = isTemporarilyDeletedSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const isTemporarilyDeleted = validation.data.isTemporarilyDeleted;

            const result = await newsManagementService.updateIsTemporarilyDeletedStatus(newsId, isTemporarilyDeleted, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'News isTemporarilyDeleted status update success',
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

    softDeleteNews = async (req, res) => {
        try {
            const newsId = req.params.id;

            await newsManagementService.softDeleteNews(newsId, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'News soft delete success',
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