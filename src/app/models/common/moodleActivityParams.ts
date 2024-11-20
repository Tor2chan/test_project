import { MemberCourseData } from "../teacher-portal/memberCourseData";


export type MoodleActivityParams = {
    wstoken: string;
    wsfunction: string;
    moodlewsrestformat: string;
    userid: string;
    courseid: string;
    coursepublicId?:any;
    memberDataList?:any;
    };