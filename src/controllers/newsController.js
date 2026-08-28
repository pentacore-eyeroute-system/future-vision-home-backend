import { NewsManagementService} from "../services/newsManagementService.js";

const newsManagementService = new NewsManagementService();

export class NewsController {
    createNews = async (req, res) => {
        try {
            const newsData = {
                title : req.body.title,
                description : req.body.description,
                date : req.body.date,
                files : req.files,
            };

            const result = await newsManagementService.createNews(newsData, req.user.id, req);
 
            res.status(201).json({
                success: true,
                message: 'News creation successful',
                result
            });
        } catch (err) {
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
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });                  
        }
    };

    updateNewsInfo = async (req, res) => {
        try {
            const newsId = req.params.id;
            const newsData = {
                title : req.body.title,
                description : req.body.description,
                date : req.body.date,
                files : req.files,
                existingNewsPicturesIds: JSON.parse(req.body.existingNewsPicturesIds || '[]'),
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
            const isTemporarilyDeleted = req.body.isTemporarilyDeleted;

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