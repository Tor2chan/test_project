import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    constructor() {}

    openTargetBlank(url: string, filename?: string) {
        setTimeout(() => {
            const a = document.createElement('a');
            a.href = url;
            /** Optional: if you want to trigger a download */
            a.download = filename ? filename : this.uuidv4(); 
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, 50);
    }

    uuidv4(): string {
      return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
      );
    }

}
