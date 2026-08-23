import { sequelize } from "../config/db.js";
import { AwsService } from "./awsService.js";
import { NewsService } from "./newsService.js";
import { NewsPicturesService } from "./newsPicturesService.js";
import { AuditLogService, ACTION_TYPES, CATEGORIES, SEVERITIES } from "./auditLogService.js";

const awsService = new AwsService();
const newsService = new NewsService(); 
const newsPicturesService = new NewsPicturesService();
const auditLogService = new AuditLogService();
export class NewsManagementService {
    async createNews(newsData, actorUserId, req) {
        const transaction = await sequelize.transaction();

        const uploadedFileKeys = [];

        try {
            // Generates slug for news
            const slug = await newsService.generateSlug(newsData.title);

            newsData = {
                slug,
                ...newsData,
            };

            // Stores news info 
            const news = await newsService.createNews(newsData, transaction);
            
            const newsPictures = [];

            // Loops through all pictures
            for (let i = 0; i < newsData.files.length; i++) {
                const file = newsData.files[i];

                // Uploads req.file to aws s3
                const fileKey = await awsService.uploadNewsPic(file);

                uploadedFileKeys.push(fileKey);

                // Stores picture file key or path associated with news
                const newsPicture = await newsPicturesService.addNewsPicture(news.id, fileKey, transaction);

                newsPictures.push(newsPicture);
            };

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_CREATED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Created news article: "${news.nws_title}" (ID: ${news.id}).`,
                metadata: { newsId: news.id, title: news.nws_title },
                request: req,
                transaction
            });

            await transaction.commit();

            return {
                ...news.toJSON(),
                newsPictures: newsPictures,
            };
        } catch (err) {
            await transaction.rollback();

            // Cleanups uploaded files
            for (let i = 0; i < uploadedFileKeys.length; i++) {
                const fileKey = uploadedFileKeys[i];

                await awsService.hardDeleteNewsPic(fileKey);
            }

            throw err;
        }
    };

    async getAllNews() {
        // Retrieves all news 
        const allNews = await newsService.getAllNews();

        const newsToSend = await Promise.all(
            // Loops through all news
            allNews.map(async (news) => {
                const pictures = await Promise.all(
                    // Retrieves all picture path or file key associated to individual news
                    news.NewsPictures.map(async (picture) => {
                        // Retrieves picture url from aws s3
                        const presignedUrl = await awsService.getNewsPic(picture.npi_pic_path);

                        return {
                            ...picture.toJSON(),
                            npi_pic_url : presignedUrl,
                        }
                    })
                )

                return {
                    ...news.toJSON(),
                    newsPictures: pictures,
                }
            })
        );

        return newsToSend;
    };

    async getAllTemporarilyDeletedNews() {
        const temporarilyDeletedNews = await newsService.getAllTemporarilyDeletedNews();

        return temporarilyDeletedNews.map(news => ({
            ...news.toJSON(),
            type: 'news'
        }));
    };

    async updateNewsInfo(newsId, newsData, actorUserId, req) {
        const transaction = await sequelize.transaction();

        // Newly uploaded pictures
        const uploadedNewFileKeys = [];

        // Old pictures to delete after commit
        const oldFileKeysToDelete = [];

        try {
            const news = await newsService.findById(newsId, transaction);

            // Updates news info
            const updatedNews = await newsService.updateNewsInfo(news, newsData, transaction);

            // Retrieves current pictures associated to news
            const newsPictures = await newsPicturesService.getAllPicturesByNews(newsId, transaction);

            // Finds deleted pictures againts existing pictures id
            const picturesToDelete = newsPictures.filter(newsPicture => !newsData.existingNewsPicturesIds.includes(newsPicture.id));      

            for (let i = 0; i < picturesToDelete.length; i++) {
                const newsPicture = picturesToDelete[i];

                // Soft deletes picture in table
                await newsPicturesService.softDeleteNewsPictureById(newsPicture, transaction);

                oldFileKeysToDelete.push(newsPicture.npi_pic_path);
            }

            const newsPicturesToSend = [];

            // Loops through all pictures
            for (let i = 0; i < newsData.files.length; i++) {
                const file = newsData.files[i];

                // Uploads new pictures to aws s3
                const fileKey = await awsService.uploadNewsPic(file);

                uploadedNewFileKeys.push(fileKey);

                // Stores new picture file key or path associated with news
                const newsPicture = await newsPicturesService.addNewsPicture(news.id, fileKey, transaction);

                newsPicturesToSend.push(newsPicture);
            };

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_UPDATED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Updated news article: "${updatedNews.nws_title}" (ID: newsId).`,
                metadata: { newsId, title: updatedNews.nws_title },
                request: req,
                transaction
            });

            await transaction.commit();

            for (let i = 0; i < oldFileKeysToDelete.length; i++) {
                const fileKey = oldFileKeysToDelete[i];

                // Hard deletes picture in aws s3 bucket
                await awsService.hardDeleteNewsPic(fileKey);
            }

            return {
                ...updatedNews.toJSON(),
                newsPictures: newsPicturesToSend,
            };
        } catch (err) {
            await transaction.rollback();

            // Cleanups newly uploaded files
            for (let i = 0; i < uploadedNewFileKeys.length; i++) {
                const fileKey = uploadedNewFileKeys[i];

                await awsService.hardDeleteNewsPic(fileKey);
            }
            throw err;
        }
    };

    async updateIsTemporarilyDeletedStatus(newsId, isTemporarilyDeleted, actorUserId, req) {
        const news = await newsService.updateIsTemporarilyDeletedStatus(newsId, isTemporarilyDeleted);
        
        await auditLogService.log({
            actorUserId,
            targetUserId: null,
            actionType: isTemporarilyDeleted ? ACTION_TYPES.CONTENT_DELETED : ACTION_TYPES.CONTENT_RESTORED,
            category: CATEGORIES.STAFF,
            severity: SEVERITIES.WARNING,
            isSecurityAlert: false,
            details: `${isTemporarilyDeleted ? 'Temporarily deleted' : 'Restored'} news article: "${news.nws_title}" (ID: ${newsId}).`,
            metadata: { newsId, title: news.nws_title },
            request: req
        });

        return news;
    };

    async softDeleteNews(newsId, actorUserId, req) {
        const transaction = await sequelize.transaction();

        let newsPictures = [];

        try {
            const news = await newsService.findById(newsId, transaction);

            // Retrieves current pictures associated to news
            newsPictures = await newsPicturesService.getAllPicturesByNews(news.id, transaction);

            // Soft deletes news in table
            await newsService.softDeleteNews(news, transaction);

            // Soft deletes news picture in table
            await newsPicturesService.softDeleteNewsPicturesByNewsId(news.id, transaction);

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_DELETED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.CRITICAL,
                isSecurityAlert: true,
                details: `Permanently deleted news article: "${news.nws_title}" (ID: ${newsId}).`,
                metadata: { newsId, title: news.nws_title },
                request: req,
                transaction
            });

            await transaction.commit();

            // Hard deletes news pictures in aws s3
            for (let i = 0; i < newsPictures.length; i++) {
                const fileKey = newsPictures[i].npi_pic_path;

                await awsService.hardDeleteNewsPic(fileKey);
            }
        } catch (err) {
            await transaction.rollback();

            throw err;
        }
    };
}