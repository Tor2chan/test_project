export interface MasGradeConfigData {
    /** pk */
    gradeId?: number;
    /** grade_symbol */
    gradeSymbol?: string;
    /**grade_no*/
    gradeNo?: number;
    /**grade_format */
    gradeFormat?: number;
    /** active_flag */
    activeFlag?: boolean;
    /** create_date */
    createDate?: Date;
    /** create_by_id */
    createById?: number;
    /** update_date */
    updateDate?: Date;
    /** update_by_id */
    updateById: number;
    mode?: string;
    rowNum?: number;
    size?: number;
}