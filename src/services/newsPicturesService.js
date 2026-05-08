import { NewsPictures } from "../models/newsPictureModel.js";

export class NewsPicturesService {
    async addNewsPicture(linkedNewsId, fileKey, transaction) {
        const newsPicture = await NewsPictures.create({
            npi_linked_news_id : linkedNewsId,
            npi_pic_path : fileKey,
        }, {
            transaction
        });

        return newsPicture;
    };

    async getAllPicturesByNews(linkedNewsId, transaction) {
        const newsPictures = await NewsPictures.findAll({ where: { npi_linked_news_id : linkedNewsId }, transaction });

        return newsPictures;
    };

    async softDeleteNewsPictureById(newsPicture, transaction) {
        await newsPicture.destroy({ transaction });
    };

    async softDeleteNewsPicturesByNewsId(newsId, transaction) {
        const newsPictures = await NewsPictures.findAll({ where: { npi_linked_news_id : newsId }, transaction });

        for (let i = 0; i < newsPictures.length; i++) {
            const newsPicture = newsPictures[i];

            await newsPicture.destroy({ transaction });
        };
    };
};