import { Partner } from "../models/partnerModel.js";

export class PartnerService {
    async createPartner(partnerData) {
        const partner = await Partner.create({
            par_fullname : partnerData.fullname,
            par_type : partnerData.type,
            par_is_temporarily_deleted: false,
        });

        return partner;
    };

    async getAllPartners() {
        const partner = await Partner.findAll();

        return partner;
    };

    async updatePartnerInfo(partnerId, partnerData) {
        const partner = await Partner.findByPk(partnerId);

        if (!partner) {
            throw new Error('Partner not found')
        }

        partner.update({
            par_fullname : partnerData.fullname,
            par_type : partnerData.type,
        });

        return partner;
    };

    async updateIsTemporarilyDeletedStatus(partnerId, isTemporarilyDeleted) {
        const partner = await Partner.findByPk(partnerId);

        if (!partner) {
            throw new Error('Partner not found')
        }

        partner.update({
            par_is_temporarily_deleted: isTemporarilyDeleted,
        });

        return partner;
    };

    async softDeletePartner(partnerId) {
        const partner = await Partner.findByPk(partnerId);

        if (!partner) {
            throw new Error('Partner not found')
        }

        partner.destroy();
    };
}