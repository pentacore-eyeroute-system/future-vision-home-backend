import { Partner } from "../models/partnerModel.js";

export class PartnerService {
    async createPartner(partnerData, transaction) {
        const partner = await Partner.create({
            par_fullname : partnerData.fullname,
            par_type : partnerData.type,
            par_is_temporarily_deleted: false,
        }, { transaction });

        return partner;
    };

    async getAllPartners() {
        const partner = await Partner.findAll({ where: { par_is_temporarily_deleted: false } });

        return partner;
    };

    async findById(partnerId, transaction) {
        const partner = await Partner.findByPk(partnerId, { transaction });

        if (!partner) {
            const error = new Error('Partner not found');
            error.statusCode = 404;
            
            throw error;
        }

        return partner;
    };

    async getAllTemporarilyDeletedPartners() {
        const temporarilyDeletedPartners = await Partner.findAll({ 
            where : {
                par_is_temporarily_deleted: true,
                deletedAt: null,
            }, 
        });

        return temporarilyDeletedPartners.map(partner => ({
            ...partner.toJSON(),
            type: 'partner'
        }));
    };

    async updatePartnerInfo(partnerId, partnerData, transaction) {
        const partner = await this.findById(partnerId, transaction);

        await partner.update({
            par_fullname : partnerData.fullname,
            par_type : partnerData.type,
        }, { transaction });

        return partner;
    };

    async updateIsTemporarilyDeletedStatus(partnerId, isTemporarilyDeleted, transaction) {
        const partner = await this.findById(partnerId, transaction);

        await partner.update({
            par_is_temporarily_deleted: isTemporarilyDeleted,
        }, { transaction });

        return partner;
    };

    async softDeletePartner(partnerId, transaction) {
        const partner = await this.findById(partnerId, transaction);

        await partner.destroy({ transaction });

        return partner;
    };
}