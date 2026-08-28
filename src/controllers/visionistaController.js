import { VisionistaManagementService } from "../services/visionistaManagementService.js";

const visionistaManagementService = new VisionistaManagementService();

export class VisionistaController {
    addVisionista = async (req, res) => {
        try {
            const visionistaData = {
                fullname : req.body.fullname,
                age : req.body.age,
                story : req.body.story,
                file : req.file,
            };

            const result = await visionistaManagementService.addVisionista(visionistaData, req.user.id, req);

            res.status(201).json({
                success: true,
                message: 'Visionista store success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });            
        }
    };

    getAllVisionistas = async (req, res) => {
        try {
            const result = await visionistaManagementService.getAllVisionistas();

            res.status(200).json({
                success: true,
                message: 'Visionistas retrieval success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });                  
        }
    };

    getAllTemporarilyDeletedVisionistas = async (req, res) => {
        try {
            const result = await visionistaManagementService.getAllTemporarilyDeletedVisionistas();

            res.status(200).json({
                success: true,
                message: 'Temporarily deleted visionistas retrieval success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });                  
        }
    };

    updateVisionistaInfo = async (req, res) => {
        try {
            const visionistaId = req.params.id;
            const visionistaData = {
                fullname : req.body.fullname,
                age : req.body.age,
                story : req.body.story,  
            };

            if (req.file) {
                visionistaData.file = req.file;
            }

            const result = await visionistaManagementService.updateVisionistaInfo(visionistaId, visionistaData, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Visionista info update success',
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
        }
    };

    updateIsTemporarilyDeletedStatus = async (req, res) => {
        try {
            const visionistaId = req.params.id;
            const isTemporarilyDeleted = req.body.isTemporarilyDeleted;

            const result = await visionistaManagementService.updateIsTemporarilyDeletedStatus(visionistaId, isTemporarilyDeleted, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Visionista isTemporarilyDeleted status update success',
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
        }
    };

    softDeleteVisionista = async (req, res) => {
        try {
            const visionistaId = req.params.id;

            const result = await visionistaManagementService.softDeleteVisionista(visionistaId, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Visionista soft delete success',
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
        }
    };
}