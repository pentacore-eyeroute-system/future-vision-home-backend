import { News } from "../models/newsModel.js";

export class NewsService {
    async createNews(newsData, transaction) {
        const news = await News.create({
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
        const news = await News.findAll();

        return news;
    };

    async findById(newsId, transaction) {
        const news = await News.findByPk(newsId, { transaction });

        if (!news) {
            throw new Error('News not found');
        };

        return news;
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
            throw new Error('News not found');
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