/**
 * Generated by orval v6.23.0 🍺
 * Do not edit manually.
 * OpenAPI definition
 * OpenAPI spec version: v0
 */

export interface CourseCompanyData {
    /** สถานะการใช้งาน */
    activeFlag?: boolean;
    /** ที่ตั้ง */
    companyAddress: string;
    /** ชื่อหน่วยงาน/สถานประกอบการ */
    companyName: string;
    /** ชื่อผู้ประกอบการ */
    companyOwnerName: string;
    /** เบอร์โทรศัพท์ */
    companyTel: string;
    /** PK  */
    courseCompanyId?: number;
    /** FK (course_main) */
    courseId?: number;
    first?: number;
    mode?: string;
    rowNum?: number;
    size?: number;
}