import { User } from "./userModel.js";
import { Review } from "./reviewModel.js";

User.hasOne(Review, {
    foreignKey: 'rev_linked_reviewer_id',
    as: 'review',
});

Review.belongsTo(User, {
    foreignKey: 'rev_linked_reviewer_id',
    as: 'reviewer'
})