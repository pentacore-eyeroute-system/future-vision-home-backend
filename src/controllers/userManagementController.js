import { UserManagementService } from "../services/userManagementService.js";

const userManagementService = new UserManagementService();

export class UserManagementController {
    getAllPendingUserApplications = async (req, res) => {
        try {
            const result = await userManagementService.getAllPendingUserApplications();

            res.status(200).json({
                success: true,
                message: 'User applications pending request retrieval successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        };
    };

    getAllStaffMembers = async (req, res) => {
        try {
            const result = await userManagementService.getAllStaffMembers();

            res.status(200).json({
                success: true,
                message: 'Staff members retrieval successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        };
    };

    updatePendingUserApplication = async (req, res) => {
        try {
            const userApplicationData = {
                id: req.params.id,
                status: req.body.status.trim(),
            }

            const result = await userManagementService.updatePendingUserApplication(userApplicationData, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'User application update status successful',
                result
            });
        } catch (err) {
            if (err.statusCode) {
                return res.status(err.statusCode).json({ 
                    success: false,
                    error: err.message,
                });
            }

            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        };
    };

    updateRole = async (req, res) => {
        try {
            const userData = {
                id: req.params.id,
                role: req.body.role.trim(),
            }

            const result = await userManagementService.updateRole(userData, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Staff member role update successful',
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
                success: false,
                error: 'An internal server error occurred',
            });
        };
    }

    updateStatus = async (req, res) => {
        try {
            const userData = {
                id: req.params.id,
                status: req.body.status.trim(),
            }

            const result = await userManagementService.updateStatus(userData, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Staff member status update successful',
                result
            });
        } catch (err) {
            if (err.statusCode) {
                return res.status(err.statusCode).json({ 
                    success: false,
                    error: err.message,
                });
            }

            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        };
    }
}