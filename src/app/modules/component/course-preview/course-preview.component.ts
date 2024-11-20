import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-course-preview',
    templateUrl: './course-preview.component.html',
    styleUrls: ['./course-preview.component.scss']
})
export class CoursePreviewComponent implements OnInit, DoCheck {
    lang: string = 'th';
    coursepublicId: number;
    courseId: number;

    constructor(private translate: TranslateService, private activatedRoute: ActivatedRoute) {
        this.activatedRoute.queryParamMap.subscribe((params) => {
            const { coursepublicId, courseId } = this.decodeBase64(params.get('data'));
            this.coursepublicId = coursepublicId;
            this.courseId = courseId;
        });
    }
    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit(): void {}

    decodeBase64(data) {
        let str = structuredClone(data);
        for (let i = 0; i < str.length; i++) {
            str = str.replace('%3D', '=');
        }
        return JSON.parse(window.atob(str));
    }
}
