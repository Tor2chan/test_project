/**
 * Generated by orval v6.23.0 🍺
 * Do not edit manually.
 * OpenAPI definition
 * OpenAPI spec version: v0
 */

export interface MasBankChargeData {
    /** สถานะการใช้งาน */
    activeFlag?: boolean;
    /** ประเภทรายการ/บัตร LOOKUP (30024000) */
    cardType?: number;
    /** custom รายการบัตร (ภาษาอังกฤษ) */
    cardTypeNameEn?: string;
    /** custom รายการบัตร (ภาษาไทย) */
    cardTypeNameTh?: string;
    /** PK */
    chargeId?: number;
    /** อัตราค่าธรรมเนียม */
    chargeRate?: number;
    /** custom ผู้บันทึก */
    createById?: number;
    /** custom วันที่สร้าง */
    createDate?: string;
    /** custom วันที่สร้างใช้ในการค้นหา */
    createDateList?: string[];
    first?: number;
    mode?: string;
    /** ประเภทรูปแบบการชำระงิน LOOKUP (30023000) */
    paymentType?: number;
    /** custom รูปแบบการชำระเงิน (ภาษาอังกฤษ) */
    paymentTypeNameEn?: string;
    /** custom รูปแบบการชำระเงิน (ภาษาไทย) */
    paymentTypeNameTh?: string;
    rowNum?: number;
    size?: number;
    /** ปีที่เริ่มใช้งาน */
    startYear?: number;
    /** custom ปีที่เริ่มใช้งานใช้ในการค้นหา */
    startYearList?: Date[];
    /** เรียกเก็บผู้เรียน */
    studentChargePercent?: number;
    /** เรียกเก็บมหาวิทยาลัย */
    universityChargePercent?: number;
}