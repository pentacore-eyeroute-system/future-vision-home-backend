import { z } from "zod";
import { VisionistaManagementService } from "../services/visionistaManagementService.js";
import { xssSafeString, optionalXssSafeString, getZodErrorMessage } from "../utils/sanitizeUtil.js";

const visionistaManagementService = new VisionistaManagementService();

const visionistaSchema = z.object({
    fullname: xssSafeString("Fullname", 255),
    age: z.union([
        z.number({ required_error: "Age is required" }).int().min(1, "Age must be valid").max(150, "Age must be valid"),
        z.string({ required_error: "Age is required" }).trim().regex(/^\d+$/, "Age must be a valid number").transform(Number)
    ]),
    story: optionalXssSafeString("Story", 10000)
});

const isTemporarilyDeletedSchema = z.object({
    isTemporarilyDeleted: z.union([z.boolean(), z.string().transform(v => v === 'true' || v === '1')])
});

export class VisionistaController {
    addVisionista = async (req, res) => {
        try {
            const validation = visionistaSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "Visionista image file is required"
                });
            }

            const visionistaData = {
                fullname : validation.data.fullname,
                age : validation.data.age,
                story : validation.data.story || "",
                file : req.file,
            };

            const result = await visionistaManagementService.addVisionista(visionistaData, req.user.id, req);

            res.status(201).json({
                success: true,
                message: 'Visionista store success',
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

    getAllVisionistas = async (req, res) => {
        try {
            const result = await visionistaManagementService.getAllVisionistas();

            res.status(200).json({
                success: true,
                message: 'Visionistas retrieval success',
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

    getAllTemporarilyDeletedVisionistas = async (req, res) => {
        try {
            const result = await visionistaManagementService.getAllTemporarilyDeletedVisionistas();

            res.status(200).json({
                success: true,
                message: 'Temporarily deleted visionistas retrieval success',
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

    updateVisionistaInfo = async (req, res) => {
        try {
            const visionistaId = req.params.id;
            const validation = visionistaSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const visionistaData = {
                fullname : validation.data.fullname,
                age : validation.data.age,
                story : validation.data.story || "",  
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
            const validation = isTemporarilyDeletedSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = getZodErrorMessage(validation.error);
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const isTemporarilyDeleted = validation.data.isTemporarilyDeleted;

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