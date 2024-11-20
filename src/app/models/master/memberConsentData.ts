export interface MemberConsentData {






    memberConsentId?: number;
    memberId?: number;
    consentId?: number;
    consentVersionNo?: string;
    acceptStatus?: Boolean;
    actionDatetime?: Date;
    actionIp?: string;
    actionAgent?: string;
    createDate?: Date;
    createById?: number;
    updateDate?: Date;
    updateById?: string;
    consentDisclose?: string;
    activeFlag?: Boolean;
    first?: number;
    rowNum?: number;
    size?: number;
    mode?: string;

    /**custom query */
    countryTypeTh?: string;
    countryTypeEn?: string;
    countryNameTh?: string;
    countryNameEn?: string;
    fullNameTh?: string;
    fullNameEn?: string;
    memberCardno?: string;
    memberCountryType?: number;
    countryId?: number;
}
