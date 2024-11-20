import { NewsInfoAttachData } from "./NewsInfoAttachData";

export interface NewsInfoData {
    newsId?:number;
    newsHeading?:string;
    newsFormat?:number;
    newsHilight?:number;
    newsFormatNameEn?:string;
    newsFormatNameTh?:string;
    prefixShortTh?:string;
    prefixShortEn?:string;
    firstnameTh?:string;
    firstnameEn?:string;
    middlenameTh?:string;
    middlenameEn?:string;
    lastnameTh?:string;
    lastnameEn?:string;
    newsStart?:Date;
    newFlag?:boolean;
    newIconStart?: Date;
    newIconEnd?:Date;
    newsEnd?:Date;
    newsCoverimage?:string;
    coursepublicRefId?:number;
    newsDetail?:string;
    newsOrder?:number;
    createById?:number;
    createDate?:Date;
    createdByName?:string;
    newsStatus?:boolean;
    rows?:number;
    first?: number;
    size?: number;
    filename?: string;
    prefix?: string;
    module?: number;
    mode?: string;
    activeFlag?: boolean;

    createdByNameTh?:string;
    createdByNameEn?:string;

    newsAttachDocList?: NewsInfoAttachData[];
}
