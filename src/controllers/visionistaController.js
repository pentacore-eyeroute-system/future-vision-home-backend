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

            const result = await visionistaManagementService.addVisionista(visionistaData);

            res.status(201).json({
                success: true,
                message: 'Visionista store success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
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
                error: err.message,
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
                file : req.file,
            };

            const result = await visionistaManagementService.updateVisionistaInfo(visionistaId, visionistaData);

            res.status(200).json({
                success: true,
                message: 'Visionista info update success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        }
    };

    updateIsArchivedStatus = async (req, res) => {
        try {
            const visionistaId = req.params.id;
            const isArchived = req.body.isArchived;

            const result = await visionistaManagementService.updateIsArchivedStatus(visionistaId, isArchived);

            res.status(200).json({
                success: true,
                message: 'Visionista isArchived status update success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        }
    };

    updateIsTemporarilyDeletedStatus = async (req, res) => {
        try {
            const visionistaId = req.params.id;
            const isTemporarilyDeleted = req.body.isTemporarilyDeleted;

            const result = await visionistaManagementService.updateIsTemporarilyDeletedStatus(visionistaId, isTemporarilyDeleted);

            res.status(200).json({
                success: true,
                message: 'Visionista isTemporarilyDeleted status update success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        }
    };

    softDeleteVisionista = async (req, res) => {
        try {
            const visionistaId = req.params.id;

            const result = await visionistaManagementService.softDeleteVisionista(visionistaId);

            res.status(200).json({
                success: true,
                message: 'Visionista soft delete success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        }
    };
}