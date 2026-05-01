import { NewsPictures } from "../models/newsPictureModel.js";

export class NewsPicturesService {
    async addNewsPicture(linkedNewsId, fileKey) {
        const newsPicture = await NewsPictures.create({
            npi_linked_news_id : linkedNewsId,
            npi_pic_path : fileKey,
        });

        return newsPicture;
    };

    async getAllPicturesByNews(linkedNewsId) {
        const newsPictures = await NewsPictures.findAll({ where: { npi_linked_news_id : linkedNewsId } });

        if (!newsPictures) {
            throw new Error('News picture not found');
        };

        return newsPictures;
    };

    async softDeleteNewsPictureById(newsPictureId) {
        const newsPicture = await NewsPictures.findByPk(newsPictureId);

        if (!newsPicture) {
            throw new Error('News picture not found');
        };

        await newsPicture.destroy();
    };

    async softDeleteNewsPicturesByNewsId(newsId) {
        const newsPictures = await NewsPictures.findAll({ where: { npi_linked_news_id : newsId } });

        if (!newsPictures) {
            throw new Error('News picture not found');
        };

        for (let i = 0; i < newsPictures.length; i++) {
            const newsPicture = newsPictures[i];

            await newsPicture.destroy();
        };
    };
};