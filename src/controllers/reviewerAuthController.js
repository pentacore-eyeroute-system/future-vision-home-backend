import { ReviewerAuthService } from "../services/reviewerAuthService.js";

const reviewerAuthService = new ReviewerAuthService();

export class ReviewerAuthController {
    login = async (req, res) => {
        try {
            const userData = {
                email: req.reviewer['email'],
                googleSub: req.reviewer['sub'],
                fullname: req.reviewer['name'],
                picture: req.reviewer['picture'],
            };

            const result = await reviewerAuthService.login(userData);

            res.status(200).json({
                success : true,
                message : 'Login success',
                result
            });
        } catch (err) {
            res.status(401).json({
                success : false,
                error : err.message,
            });
        }
    };
}