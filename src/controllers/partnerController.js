import { z } from "zod";
import { PartnerManagementService } from "../services/partnerManagementService.js";
import { xssSafeString, getZodErrorMessage } from "../utils/sanitizeUtil.js";

const partnerManagementService = new PartnerManagementService();

const partnerSchema = z.object({
    fullname: xssSafeString("Fullname", 255),
    type: xssSafeString("Type", 100)
});

const isTemporarilyDeletedSchema = z.object({
    isTemporarilyDeleted: z.union([z.boolean(), z.string().transform(v => v === 'true' || v === '1')])
});

export class PartnerController {
    addPartner = async (req, res) => {
        try {
            const validation = partnerSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const partnerData = {
                fullname : validation.data.fullname,
                type : validation.data.type,
            };

            const result = await partnerManagementService.createPartner(partnerData, req.user.id, req);

            res.status(201).json({
                success: true,
                message: 'Partner store success',
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

    getAllPartners = async (req, res) => {
        try {
            const result = await partnerManagementService.getAllPartners();

            res.status(200).json({
                success: true,
                message: 'Partners retrieval success',
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

    getAllTemporarilyDeletedPartners = async (req, res) => {
        try {
            const result = await partnerManagementService.getAllTemporarilyDeletedPartners();

            res.status(200).json({
                success: true,
                message: 'Temporarily deleted partners retrieval success',
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

    updatePartnerInfo = async (req, res) => {
        try {
            const partnerId = req.params.id;
            const validation = partnerSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const partnerData = {
                fullname : validation.data.fullname,
                type : validation.data.type,
            };

            const result = await partnerManagementService.updatePartnerInfo(partnerId, partnerData, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Partner info update success',
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
            const partnerId = req.params.id;
            const validation = isTemporarilyDeletedSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const isTemporarilyDeleted = validation.data.isTemporarilyDeleted;

            const result = await partnerManagementService.updateIsTemporarilyDeletedStatus(partnerId, isTemporarilyDeleted, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Partner isTemporarilyDeleted status update success',
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

    softDeletePartner = async (req, res) => {
        try {
            const partnerId = req.params.id;

            const result = await partnerManagementService.softDeletePartner(partnerId, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'Partner soft delete success',
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