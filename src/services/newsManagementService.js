import { AwsService } from "./awsService.js";
import { NewsService } from "./newsService.js";
import { NewsPicturesService } from "./newsPicturesService.js";

const awsService = new AwsService();
const newsService = new NewsService(); 
const newsPicturesService = new NewsPicturesService();

export class NewsManagementService {
    async createNews(newsData) {
        // Stores news info 
        const news = await newsService.createNews(newsData);
        
        let newsPictures = [];

        // Loops through all pictures
        for (let i = 0; i < newsData.files.length; i++) {
            const file = newsData.files[i];

            // Uploads req.file to aws s3
            const fileKey = await awsService.uploadNewsPic(file);

            // Stores picture file key or path associated with news
            const newsPicture = await newsPicturesService.addNewsPicture(news.id, fileKey);

            newsPictures.push(newsPicture);
        };

        return {
            ...news.toJSON(),
            newsPictures: newsPictures,
        };
    };

    async getAllNews() {
        // Retrieves all news 
        const allNews = await newsService.getAllNews();

        const newsToSend = [];

        // Loops through all news
        for (let i = 0; i < allNews.length; i++) {
            const news = allNews[i];
            const newsPicturesToSend = [];

            // Retrieves all picture path or file key associated to individual news
            const newsPictures = await newsPicturesService.getAllPicturesByNews(news.id);

            // Loops through all pictures
            for (let j = 0; j < newsPictures.length; j++) {
                const newsPicture = newsPictures[j];
                
                // Retrieves picture url from aws s3
                const presignedUrl = await awsService.getNewsPic(newsPicture.npi_pic_path);

                newsPicturesToSend.push({
                    ...newsPicture.toJSON(),
                    npi_pic_url : presignedUrl
                });
            };

            newsToSend.push({
                ...news.toJSON(),
                newsPictures: newsPicturesToSend,
            });
        };

        return newsToSend;
    };

    async updateNewsInfo(newsId, newsData) {
        // Updates news info
        const news = await newsService.updateNewsInfo(newsId, newsData);

        // Retrieves current pictures associated to news
        const newsPictures = await newsPicturesService.getAllPicturesByNews(newsId);

        // Finds deleted pictures againts existing pictures id
        const picturesToDelete = newsPictures.filter(newsPicture => !newsData.existingNewsPicturesIds.includes(newsPicture.id)); 

        for (let i = 0; i < picturesToDelete.length; i++) {
            const newsPicture = picturesToDelete[i];

            // Soft deletes picture in table
            await newsPicturesService.softDeleteNewsPictureById(newsPicture.id);

            // Hard deletes picture in aws s3 bucket
            await awsService.hardDeleteNewsPic(newsPicture.npi_pic_path);
        }

        let newsPicturesToSend = [];

        // Loops through all pictures
        for (let i = 0; i < newsData.files.length; i++) {
            const file = newsData.files[i];

            // Uploads new pictures to aws s3
            const fileKey = await awsService.uploadNewsPic(file);

            // Stores new picture file key or path associated with news
            const newsPicture = await newsPicturesService.addNewsPicture(news.id, fileKey);

            newsPicturesToSend.push(newsPicture);
        };

        return {
            ...news.toJSON(),
            newsPictures: newsPicturesToSend,
        };
    };

    async updateIsTemporarilyDeletedStatus(newsId, isTemporarilyDeleted) {
        const news = await newsService.updateIsTemporarilyDeletedStatus(newsId, isTemporarilyDeleted);
        
        return news;
    };

    async softDeleteNews(newsId) {
        // Soft deletes news in table
        await newsService.softDeleteNews(newsId);

        // Soft deletes news picture in table
        await newsPicturesService.softDeleteNewsPicturesByNewsId(newsId);
    };
}