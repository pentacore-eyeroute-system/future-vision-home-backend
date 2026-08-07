import { News } from "./newsModel.js";
import { NewsPictures } from "./newsPictureModel.js";
import { Gallery } from "./galleryModel.js";
import { GalleryPicture } from "./galleryPictureModel.js";
import { User } from "./userModel.js";
import { Review } from "./reviewModel.js";

News.hasMany(NewsPictures, {
    foreignKey: 'npi_linked_news_id',
});

NewsPictures.belongsTo(News, {
    foreignKey: 'npi_linked_news_id',
});

Gallery.hasMany(GalleryPicture, {
    foreignKey: 'gpi_linked_gallery_id',
});

GalleryPicture.belongsTo(Gallery, {
    foreignKey: 'gpi_linked_gallery_id',
});

User.hasOne(Review, {
    foreignKey: 'rev_linked_reviewer_id',
    as: 'review',
});

Review.belongsTo(User, {
    foreignKey: 'rev_linked_reviewer_id',
    as: 'reviewer'
})