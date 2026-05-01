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

            const result = await newsManagementService.createNews(newsData);
 
            res.status(201).json({
                success: true,
                message: 'News creation successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
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
                error: err.message,
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

            const result = await newsManagementService.updateNewsInfo(newsId, newsData);            

            res.status(200).json({
                success: true,
                message: 'News update successful',
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
            const newsId = req.params.id;
            const isTemporarilyDeleted = req.body.isTemporarilyDeleted;

            const result = await newsManagementService.updateIsTemporarilyDeletedStatus(newsId, isTemporarilyDeleted);

            res.status(200).json({
                success: true,
                message: 'News isTemporarilyDeleted status update success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        }
    };

    softDeleteNews = async (req, res) => {
        try {
            const newsId = req.params.id;

            await newsManagementService.softDeleteNews(newsId);

            res.status(200).json({
                success: true,
                message: 'News soft delete success',
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        } 
    };
};