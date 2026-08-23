import { News } from "./newsModel.js";
import { NewsPictures } from "./newsPictureModel.js";
import { Gallery } from "./galleryModel.js";
import { GalleryPicture } from "./galleryPictureModel.js";
import { User } from "./userModel.js";
import { Review } from "./reviewModel.js";
import { AuditLog } from "./auditLogModel.js";
import { UserApplication } from "./userApplicationModel.js";

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
});

User.hasMany(AuditLog, {
    foreignKey: 'aud_actor_user_id',
    as: 'actorLogs',
});

AuditLog.belongsTo(User, {
    foreignKey: 'aud_actor_user_id',
    as: 'actor',
});

User.hasMany(AuditLog, {
    foreignKey: 'aud_target_user_id',
    as: 'targetLogs',
});

AuditLog.belongsTo(User, {
    foreignKey: 'aud_target_user_id',
    as: 'target',
});

UserApplication.hasMany(AuditLog, {
    foreignKey: 'aud_target_application_id',
    as: 'targetApplicationLogs',
});

AuditLog.belongsTo(UserApplication, {
    foreignKey: 'aud_target_application_id',
    as: 'targetApplication',
});