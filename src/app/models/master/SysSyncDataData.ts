export interface SysSyncDataData {
    /** สถานะการใช้งาน */
    activeFlag?: boolean;
    id?: number;
    tableName?: string;
    totalRecordBeforeSync?: number;
    totalRecordAfterSync?: number;
}
