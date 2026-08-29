import { ReviewerAuthService } from "../services/reviewerAuthService.js";

const reviewerAuthService = new ReviewerAuthService();

export class ReviewerAuthController {
    login = async (req, res) => {
        try {
            let userData = {
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
            if (err.statusCode) {
                return res.status(err.statusCode).json({
                    success: false,
                    error: err.message
                });
            }            

            res.status(500).json({
                success : false,
                error: 'An internal server error occurred',
            });
        }
    };
}