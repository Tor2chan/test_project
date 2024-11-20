import { MasConsentDiscloseData } from "./masConsentDiscloseData";



export interface MasConsentManageData {

    consentId?: number;
    formType?: string;
    versionNo?: string;
    formName?: string;
    formDetail?: string;
    formNote?: string;
    acceptButton?: string;
    consentStatus?: boolean;
    createDate?: Date;
    createById?: string;
    updateDate?: Date;
    updateById?: string;
    activeFlag?: boolean;
    rows?:number;
    first?: number;
    size?: number;
    mode?: string;
    formNameTh?: string;
    formNameEn?: string;
    formDetailTh?: string;
    formDetailEn?: string;

    fullNameTh?: string;
    fullNmaeEn?: string;


	requestDateStart?: Date;
	requestDateEnd?: Date;

    formNoteTh?: string;
    formNoteEn?: string;

    masConsentDiscloseList?: MasConsentDiscloseData[];
}
