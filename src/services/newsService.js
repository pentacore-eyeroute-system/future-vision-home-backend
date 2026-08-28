import slugify from 'slugify';
import { News } from "../models/newsModel.js";
import { NewsPictures } from '../models/newsPictureModel.js';

export class NewsService {
    async generateSlug(newsTitle) {
        const baseSlug = slugify(newsTitle, { lower: true, strict: true, trim: true });

        let slug = baseSlug;
        let count = 1;

        while (await News.findOne({ where: { news_slug: slug } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        };

        return slug;
    };

    async createNews(newsData, transaction) {
        const news = await News.create({
            news_slug : newsData.slug,
            news_title : newsData.title,
            news_description : newsData.description,
            news_date : newsData.date,
            news_isTemporarilyDeleted : false,
        }, {
            transaction
        });

        return news;
    };

    async getAllNews() {
        const news = await News.findAll(
            { 
                where: { news_is_temporarily_deleted: false },
                include: [
                    {
                        model: NewsPictures
                    }
                ]
            }
        );

        return news;
    };

    async findById(newsId, transaction) {
        const news = await News.findByPk(newsId, { transaction });

        if (!news) {
            const error = new Error('News not found');
            error.statusCode = 404;
            
            throw error;
        };

        return news;
    };

    async getAllTemporarilyDeletedNews() {
        const temporarilyDeletedNews = await News.findAll({ 
            where : {
                news_is_temporarily_deleted: true,
                deletedAt: null,
            }, 
        });

        return temporarilyDeletedNews;
    };

    async updateNewsInfo(news, newsData, transaction) {
        await news.update({
            news_title : newsData.title,
            news_description : newsData.description,
            news_date : newsData.date,
        }, {
            transaction
        });

        return news;
    };

    async updateIsTemporarilyDeletedStatus(newsId, isTemporarilyDeleted) {
        const news = await News.findByPk(newsId);

        if (!news) {
            const error = new Error('News not found');
            error.statusCode = 404;
            
            throw error;
        };

        await news.update({
            news_is_temporarily_deleted: isTemporarilyDeleted,
        });

        return news;
    };

    async softDeleteNews(news, transaction) {
        await news.destroy({ transaction });
    };
}