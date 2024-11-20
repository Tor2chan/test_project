export interface Response<T> {
    status: number;
    message: string;
    entries: T;
}

export interface ResponseOneIf<T> extends Response<T> {}

export interface ResponseListIf<T> extends Partial<Response<T[]>> {
    totalRecords?: number;
    sumWeight?: number;
    syncDate?: Date;
}

export interface DropdownData {
    value: any;
    nameTh?: string;
    nameEn?: string;
}
export interface CreatorListData {
    value?: any;
    fullNameTh?: string;
}

export interface DropdownTambonData extends Partial<DropdownData> {
    zipCode: any;
}

export interface DropdownCriteriaData {
    /** id รองเพื่อใช้ในการกรอง กรณีมีเป็น tree  */
    childId?: number;
    /** true or 1 เพื่อแสดง code ใน dropdown  */
    displayCode?: boolean;
    /** id เพื่อใช้ในการกรอง กรณีมีเป็น tree  */
    id?: number;
    /** ใข้สำหรับ department  */
    depType?: number;
    /** mode */
    mode?: string;
    /** PK id เพื่อใช้ในการค้นหา  */
    pkId?: number;
    /** PK ids เพื่อใช้ในการค้นหา  */
    pkIds?: number[];
    /** คำที่ใช้ค้นหา */
    searchValue?: string;
}
