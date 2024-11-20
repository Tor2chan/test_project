import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseListIf, ResponseOneIf } from '../models/common';
import { environment } from 'src/environments/environment';
import { NewsInfoData } from '../models/news-management/NewsInfoData';
import { NewsInfoAttachData } from '../models/news-management/NewsInfoAttachData';
@Injectable({ providedIn: 'root' })
export class NewsManagementService {
    constructor(private http: HttpClient) {}


    getNewsInfoRefMode(newsId: number): Observable<ResponseOneIf<NewsInfoData>> {
        return this.http.get<ResponseOneIf<NewsInfoData>>(
            `${environment.apiUrl}/news-management/news-info-refmode/${newsId}`
        );
    }
    putNewsInfo(
        newsId: number,
        newsInfoData: NewsInfoData
    ): Observable<ResponseOneIf<NewsInfoData>> {
        return this.http.put<ResponseOneIf<NewsInfoData>>(
            `${environment.apiUrl}/news-management/news-info-refmode/${newsId}`,
            newsInfoData
        );
    }
    postNewsInfo(newsInfoData: NewsInfoData): Observable<ResponseOneIf<NewsInfoData>> {
        return this.http.post<ResponseOneIf<NewsInfoData>>(
            `${environment.apiUrl}/news-management/news-info-refmode`,
            newsInfoData
        );
    }
    findNewsInfo(newsInfoData: NewsInfoData): Observable<ResponseListIf<NewsInfoData>> {
        return this.http.post<ResponseListIf<NewsInfoData>>(
            `${environment.apiUrl}/news-management/find-news-info-refmode`,
            newsInfoData
        );
    }

    getNewsInfoAttach(newsAttachId: number): Observable<ResponseOneIf<NewsInfoAttachData>> {
        return this.http.get<ResponseOneIf<NewsInfoAttachData>>(
            `${environment.apiUrl}/news-management/news-info-attach-refmode/${newsAttachId}`
        );
    }
    putNewsInfoAttach(
        newsAttachId: number,
        newsInfoAttachData: NewsInfoAttachData
    ): Observable<ResponseOneIf<NewsInfoAttachData>> {
        return this.http.put<ResponseOneIf<NewsInfoAttachData>>(
            `${environment.apiUrl}/news-management/news-info-attach-refmode/${newsAttachId}`,
            newsInfoAttachData
        );
    }
    postNewsInfoAttach(newsInfoAttahData: NewsInfoAttachData): Observable<ResponseOneIf<NewsInfoAttachData>> {
        return this.http.post<ResponseOneIf<NewsInfoAttachData>>(
            `${environment.apiUrl}/news-management/news-info-attach-refmode`,
            newsInfoAttahData
        );
    }
    findNewsInfoAttach(newsInfoAttahData: NewsInfoAttachData): Observable<ResponseListIf<NewsInfoAttachData>> {
        return this.http.post<ResponseListIf<NewsInfoAttachData>>(
            `${environment.apiUrl}/news-management/find-news-info-attach-refmode`,
            newsInfoAttahData
        );
    }

    deleteNewsInfo(criteria):Observable<ResponseListIf<NewsInfoData>> {
        return this.http.post<ResponseListIf<NewsInfoData>>(`${environment.apiUrl}/news-management/delete-news-info`,criteria);
    }

    deleteNewsInfoAttach(criteria):Observable<ResponseListIf<NewsInfoAttachData>> {
        return this.http.post<ResponseListIf<NewsInfoAttachData>>(`${environment.apiUrl}/news-management/delete-news-info-attach`,criteria);
    }

}
