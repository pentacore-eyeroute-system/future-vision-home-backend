import { PartnerService } from "../services/partnerService.js";

const partnerService = new PartnerService();

export class PartnerController {
    addPartner = async (req, res) => {
        try {
            const partnerData = {
                fullname : req.body.fullname,
                type : req.body.type,
            };

            const result = await partnerService.createPartner(partnerData);

            res.status(201).json({
                success: true,
                message: 'Partner store success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });            
        }
    };

    getAllPartners = async (req, res) => {
        try {
            const result = await partnerService.getAllPartners();

            res.status(200).json({
                success: true,
                message: 'Partners retrieval success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });                  
        }
    };

    updatePartnerInfo = async (req, res) => {
        try {
            const partnerId = req.params.id;
            const partnerData = {
                fullname : req.body.fullname,
                type : req.body.type,
            };

            const result = await partnerService.updatePartnerInfo(partnerId, partnerData);

            res.status(200).json({
                success: true,
                message: 'Partner info update success',
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
            const partnerId = req.params.id;
            const isArchived = req.body.isArchived;

            const result = await partnerService.updateIsArchivedStatus(partnerId, isArchived);

            res.status(200).json({
                success: true,
                message: 'Partner isArchived status update success',
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
            const partnerId = req.params.id;
            const isTemporarilyDeleted = req.body.isTemporarilyDeleted;

            const result = await partnerService.updateIsTemporarilyDeletedStatus(partnerId, isTemporarilyDeleted);

            res.status(200).json({
                success: true,
                message: 'Partner isTemporarilyDeleted status update success',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        }
    };

    softDeletePartner = async (req, res) => {
        try {
            const partnerId = req.params.id;

            const result = await partnerService.softDeletePartner(partnerId);

            res.status(200).json({
                success: true,
                message: 'Visionista soft delete success',
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });    
        }
    };
}