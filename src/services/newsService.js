import { News } from "../models/newsModel.js";

export class NewsService {
    async createNews(newsData) {
        const news = await News.create({
            news_title : newsData.title,
            news_description : newsData.description,
            news_date : newsData.date,
            news_isTemporarilyDeleted : false,
        });

        return news;
    };

    async getAllNews() {
        const news = await News.findAll();

        return news;
    };

    async updateNewsInfo(newsId, newsData) {
        const news = await News.findByPk(newsId);

        if (!news) {
            throw new Error('News not found');
        };

        await news.update({
            news_title : newsData.title,
            news_description : newsData.description,
            news_date : newsData.date,
        });

        return news;
    };

    async updateIsTemporarilyDeletedStatus(newsId, isTemporarilyDeleted) {
        const news = await News.findByPk(newsId);

        if (!news) {
            throw new Error('News not found');
        };

        await news.update({
            news_is_temporarily_deleted: isTemporarilyDeleted,
        });

        return news;
    };

    async softDeleteNews(newsId) {
        const news = await News.findByPk(newsId);

        if (!news) {
            throw new Error('News not found');
        };

        await news.destroy();
    };
}