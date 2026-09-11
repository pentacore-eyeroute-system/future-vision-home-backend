import { sequelize } from "../config/db.js";
import { PartnerService } from "./partnerService.js";
import { AuditLogService, ACTION_TYPES, CATEGORIES, SEVERITIES } from "./auditLogService.js";

const partnerService = new PartnerService();
const auditLogService = new AuditLogService();

export class PartnerManagementService {
    async createPartner(partnerData, actorUserId, req) {
        const transaction = await sequelize.transaction();

        try {
            const partner = await partnerService.createPartner(partnerData, transaction);

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_CREATED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Created partner profile: "${partner.par_fullname}" (ID: ${partner.id}).`,
                metadata: { partnerId: partner.id, fullname: partner.par_fullname, type: partner.par_type },
                request: req,
                transaction
            });

            await transaction.commit();

            return partner;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    async getAllPartners() {
        return await partnerService.getAllPartners();
    }

    async getAllTemporarilyDeletedPartners() {
        return await partnerService.getAllTemporarilyDeletedPartners();
    }

    async updatePartnerInfo(partnerId, partnerData, actorUserId, req) {
        const transaction = await sequelize.transaction();

        try {
            const partner = await partnerService.updatePartnerInfo(partnerId, partnerData, transaction);

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_UPDATED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Updated partner profile: "${partner.par_fullname}" (ID: ${partnerId}).`,
                metadata: { partnerId, fullname: partner.par_fullname, type: partner.par_type },
                request: req,
                transaction
            });

            await transaction.commit();

            return partner;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    async updateIsTemporarilyDeletedStatus(partnerId, isTemporarilyDeleted, actorUserId, req) {
        const transaction = await sequelize.transaction();

        try {
            const partner = await partnerService.updateIsTemporarilyDeletedStatus(partnerId, isTemporarilyDeleted, transaction);

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: isTemporarilyDeleted ? ACTION_TYPES.CONTENT_DELETED : ACTION_TYPES.CONTENT_RESTORED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.WARNING,
                isSecurityAlert: false,
                details: `${isTemporarilyDeleted ? 'Temporarily deleted' : 'Restored'} partner profile: "${partner.par_fullname}" (ID: ${partnerId}).`,
                metadata: { partnerId, fullname: partner.par_fullname },
                request: req,
                transaction
            });

            await transaction.commit();

            return partner;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    async softDeletePartner(partnerId, actorUserId, req) {
        const transaction = await sequelize.transaction();

        try {
            const partner = await partnerService.softDeletePartner(partnerId, transaction);

            await auditLogService.log({
                actorUserId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_DELETED,
                category: CATEGORIES.STAFF,
                severity: SEVERITIES.CRITICAL,
                isSecurityAlert: true,
                details: `Permanently deleted partner profile: "${partner.par_fullname}" (ID: ${partnerId}).`,
                metadata: { partnerId, fullname: partner.par_fullname },
                request: req,
                transaction
            });

            await transaction.commit();

            return partner;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}
