import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseListIf, ResponseOneIf } from '../models/common';
import { environment } from 'src/environments/environment';
import { MasDepartmentData, MasPersonalData } from '../models/master';
import { CoursepublicMainData } from '../models/course-management';
import { CoursepublicGradeData } from '../models/course-management/coursepublicGradeData';
import { MasGradeConfigData } from '../models/master/masGradeConfigData';
import { MemberCourseData } from '../models/teacher-portal/memberCourseData';
import { MoodleActivityParams } from '../models/common/moodleActivityParams';
import { MoodleActivityData } from '../models/common/moodleActivityData';
import { SysSyncDataData } from '../models/master/SysSyncDataData';
@Injectable({ providedIn: 'root' })
export class TeacherPortalService {
    constructor(private http: HttpClient) {}

    getPersonalData(): Observable<ResponseListIf<MasPersonalData>> {
        return this.http.post<ResponseListIf<MasPersonalData>>(
            `${environment.apiUrl}/teacher-portal/personal-data`,
            {}
        );
    }

    getPersonalDataById(personalId): Observable<ResponseListIf<MasPersonalData>> {
        return this.http.post<ResponseListIf<MasPersonalData>>(
            `${environment.apiUrl}/teacher-portal/personal-data-by-id`,
            personalId
        );
    }

    getDepartment(depIdlevel1): Observable<ResponseListIf<MasDepartmentData>> {
        return this.http.post<ResponseListIf<MasDepartmentData>>(
            `${environment.apiUrl}/teacher-portal/department-data`,
            depIdlevel1
        );
    }

    getActiveCourse(personalId): Observable<ResponseListIf<CoursepublicMainData>> {
        return this.http.post<ResponseListIf<CoursepublicMainData>>(
            `${environment.apiUrl}/teacher-portal/active-course`,
            personalId
        );
    }

    findCourseInfo(courseInput): Observable<ResponseListIf<CoursepublicMainData>> {
        return this.http.post<ResponseListIf<CoursepublicMainData>>(
            `${environment.apiUrl}/teacher-portal/find-course-info`,
            courseInput
        );
    }

    findPassGrade(courseInfoData): Observable<ResponseListIf<CoursepublicGradeData>> {
        return this.http.post<ResponseListIf<CoursepublicGradeData>>(
            `${environment.apiUrl}/teacher-portal/find-pass-grade`,
            courseInfoData
        );
    }

    findMasterGradeConfig(courseInfoData): Observable<ResponseListIf<MasGradeConfigData>> {
        return this.http.post<ResponseListIf<MasGradeConfigData>>(
            `${environment.apiUrl}/teacher-portal/find-mas-grade-config`,
            courseInfoData
        );
    }

    savePassGrade(data): Observable<ResponseListIf<CoursepublicGradeData>> {
        return this.http.put<ResponseListIf<CoursepublicGradeData>>(
            `${environment.apiUrl}/teacher-portal/save-pass-grade`,
            data
        );
    }

    saveEditGrade(data): Observable<ResponseListIf<CoursepublicGradeData>> {
        console.log('saveEditGrade:data:', data);
        return this.http.post<ResponseListIf<CoursepublicGradeData>>(
            `${environment.apiUrl}/teacher-portal/save-edit-grade`,
            data
        );
    }
    findStudentList(criteria): Observable<ResponseListIf<MemberCourseData>> {
        return this.http.post<ResponseListIf<MemberCourseData>>(
            `${environment.apiUrl}/teacher-portal/find-student-list`,
            criteria
        );
    }
    findStudyResultList(criteria): Observable<ResponseListIf<MemberCourseData>> {
        return this.http.post<ResponseListIf<MemberCourseData>>(
            `${environment.apiUrl}/teacher-portal/find-study-result-list`,
            criteria
        );
    }
    findPointInRange(criteria): Observable<ResponseListIf<CoursepublicGradeData>> {
        return this.http.post<ResponseListIf<CoursepublicGradeData>>(
            `${environment.apiUrl}/teacher-portal/find-point-in-range`,
            criteria
        );
    }
    putMemberData(memberCourseId, memberCourseData): Observable<ResponseListIf<MemberCourseData>> {
        return this.http.put<ResponseListIf<MemberCourseData>>(
            `${environment.apiUrl}/teacher-portal/put-member-data/${memberCourseId}`,
            memberCourseData
        );
    }
    putConfirmMemberData(memberCourseId, memberCourseData): Observable<ResponseListIf<MemberCourseData>> {
        return this.http.put<ResponseListIf<MemberCourseData>>(
            `${environment.apiUrl}/teacher-portal/put-confirm-member-data/${memberCourseId}`,
            memberCourseData
        );
    }

    findMemberCount(criteria): Observable<ResponseListIf<MemberCourseData>> {
        return this.http.post<ResponseListIf<MemberCourseData>>(
            `${environment.apiUrl}/teacher-portal/find-member-count`,
            criteria
        );
    }
    deleteGrade(criteria): Observable<ResponseListIf<CoursepublicGradeData>> {
        return this.http.post<ResponseListIf<CoursepublicGradeData>>(
            `${environment.apiUrl}/teacher-portal/delete-grade`,
            criteria
        );
    }
    findPassingCriteria(criteria): Observable<ResponseListIf<CoursepublicGradeData>> {
        return this.http.post<ResponseListIf<CoursepublicGradeData>>(
            `${environment.apiUrl}/teacher-portal/find-passing-criteria`,
            criteria
        );
    }
    findPointrangeCriteria(criteria): Observable<ResponseListIf<CoursepublicGradeData>> {
        return this.http.post<ResponseListIf<CoursepublicGradeData>>(
            `${environment.apiUrl}/teacher-portal/find-point-range-criteria`,
            criteria
        );
    }
    updateStatusCourse(criteria): Observable<ResponseListIf<CoursepublicMainData>> {
        return this.http.put<ResponseListIf<CoursepublicMainData>>(
            `${environment.apiUrl}/teacher-portal/update-status-course`,
            criteria
        );
    }

    findAllPersonalData(): Observable<ResponseListIf<MasPersonalData>> {
        return this.http.get<ResponseListIf<MasPersonalData>>(
            `${environment.apiUrl}/teacher-portal/find-all-personal-data`
        );
    }

    findSelectedGrade(criteria): Observable<ResponseListIf<CoursepublicGradeData>> {
        return this.http.post<ResponseListIf<CoursepublicGradeData>>(
            `${environment.apiUrl}/teacher-portal/find-selected-grade`,
            criteria
        );
    }
    moodleActivity(params: MoodleActivityParams): Observable<ResponseListIf<MoodleActivityData>> {
        return this.http.get<ResponseListIf<MoodleActivityData>>(
            `${environment.apiUrl}/teacher-portal/moodle-activity`,
            { params: { ...params } }
        );
    }
    moodleGradeList(params: MoodleActivityParams): Observable<ResponseListIf<MoodleActivityData>> {
        return this.http.post<ResponseListIf<MoodleActivityData>>(
            `${environment.apiUrl}/teacher-portal/moodle-grade-list`,
            params
        );
    }
    getProgressGradeMoodleCheck(): Observable<ResponseOneIf<SysSyncDataData>> {
        return this.http.get<ResponseOneIf<SysSyncDataData>>(
            `${environment.apiUrl}/teacher-portal/progress-grade-moodle/check`
        );
    }

    findBase64FromFilePath(filePath): Observable<ResponseListIf<MemberCourseData>> {
        return this.http.post<ResponseListIf<MemberCourseData>>(
            `${environment.apiUrl}/teacher-portal/findBase64FromFilePath`,
            filePath
        );
    }

    saveMoodleGradeOption(coursepublicMainData): Observable<ResponseListIf<CoursepublicMainData>> {
        return this.http.put<ResponseListIf<CoursepublicMainData>>(
            `${environment.apiUrl}/teacher-portal/save-moodle-grade-option`,
            coursepublicMainData
        );
    }

    moodle(personalId: number): Observable<ResponseOneIf<string>> {
        return this.http.get<ResponseOneIf<string>>(`${environment.apiUrl}/teacher-portal/moodle/${personalId}`);
    }
}
