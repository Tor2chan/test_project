export interface MemberCourseData {
    /**PK */
    memberCourseId?: number;
    coursepublicId?: number;
    memberId?: number;
    memberNo?:number;
    memberPhotoPath?: string;
    filename?: string;
    prefix?: string;
    module?: number;
    memberPhoneno?: string;
    prefixnameCode?: string;
    memberFirstnameTh?: string;
    memberLastnameTh?: string;
    memberFirstnameEn?: string;
    memberLastnameEn?: string;
    registerDate?: Date;
    paymentStatus?: number;
    studyStatus?: number;
    paymentNameLo?: string;
    paymentNameEn?: string;
    studyStatusNameLo?: string;
    studyStatusNameEn?: string;
    prefixnameNameTh?: string;
    prefixnameNameEn?: string;
    resultScore?: number;
    resultGrade?: string;
    passStatus?: boolean;
    nameOrSurnameTh?: string;
    nameOrSurnameEn?: string;
    memberCount?: number;
    createDate?:Date;
    createById?:number;
    updateDate?:Date;
    updateById?:number;
    courseId?:number;
    passDate?:Date;
    activeFlag?:boolean
    courseCode?:string;
    first?: number;
    rowNum?: number;
    size?: number;
    moodleUserId?:number;
    genPdfDate?:Date;
    certificateCaPathTh?:string;
    certificateCaPathEn?:string;
    changeResultScoreFlag?:boolean;
    changeResultGradeFlag?:boolean;
}
