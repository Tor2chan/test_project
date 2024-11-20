# SwuLifelongUi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

#### dropdown ex:
``` ts

    loadDropDown() {
        if (this.item) {
            this.lazyLoadBank(null, this.item.bankId);
            this.lazyLoadBankBranch(null, this.item.bankBranchId);
        }
    }

    lazyLoadBank(event: DropdownFilterEvent, pkId?: number) {

        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService
            .getBankDropdown(dropdownCriteriaData)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.bankList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
    }

    lazyLoadBankBranch(event: DropdownFilterEvent, pkId?: number) {

        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        }

        if (this.item && this.item.bankId) {
            dropdownCriteriaData.id = this.item.bankId;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService
            .getBankBranchDropdown(dropdownCriteriaData)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.bankBranchList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
    }
```

``` html

                    <div class="col-12 md:col-12 ">
                        <label><a style="color: red">*</a>Bank</label>
                        <p-dropdown
                            [options]="bankList"
                            [(ngModel)]="item.bankId"
                            [optionLabel]="lang === 'th' ? 'nameTh' : 'nameEn'"
                            optionValue="value"
                            [showClear]="true"
                            [filter]="true"
                            (onFilter)="lazyLoadBank($event)"
                            (onChange)="lazyLoadBankBranch(null)"
                            [placeholder]=" 'common.pleaseSelect' | translate "
                            [class]="showError == true && !!!item.bankId ? 'ng-invalid ng-dirty' : ''"
                        ></p-dropdown>
                        <small
                            *ngIf="showError && !!!item.bankId"
                            class="p-error"
                            id="text-error"
                        >
                        {{ 'common.pleaseEnter' | translate }}
                        </small>
                    </div>

                    <div class="col-12 md:col-12 ">
                        <label><a style="color: red">*</a>Bank Branch</label>
                        <p-dropdown
                            [disabled]="!!!item.bankId"
                            [options]="bankBranchList"
                            [(ngModel)]="item.bankBranchId"
                            [optionLabel]="lang === 'th' ? 'nameTh' : 'nameEn'"
                            optionValue="value"
                            [showClear]="true"
                            [filter]="true"
                            [placeholder]=" 'common.pleaseSelect' | translate "
                            (onFilter)="lazyLoadBankBranch($event)"
                            [class]="showError == true && !!!item.bankBranchId ? 'ng-invalid ng-dirty' : ''"
                            ></p-dropdown>
                        <small
                            *ngIf="showError && !!!item.bankBranchId"
                            class="p-error"
                            id="text-error"
                        >
                        {{ 'common.pleaseEnter' | translate }}
                        </small>
                    </div>
```

``` 
restriction
[\D] = กรอกเฉพาะตัวอักษร
[\S] = ห่้ามหรอก spece
^[a-zA-Z\s]+$ = สำหรับชื่อภาษาอังกฤษ
^[ก-๏\s]+$ = สำหรับชื่อ นามสกุลภาษาไทย
[\d@_.a-zA-Z] = email
```
```
maxlength="10"
regular expression
^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$ = email
```

Generate Model and APi
``` sh
npx orval --config ./orval.config.ts
```

# docker build local
``` sh
docker build .
```

# build to registry
``` sh
docker build -t lifelong-operation-ui:v1.0.0-b.3-a.3 . &&
docker image tag lifelong-operation-ui:v1.0.0-b.3-a.3 hubcpa.ar.co.th:5000/lifelong-operation-ui:v1.0.0-b.3-a.3 &&
docker push hubcpa.ar.co.th:5000/lifelong-operation-ui:v1.0.0-b.3-a.3
```

# deploy
``` sh
kubectl apply -f lifelong-operation-ui.yml 
```

# build to registry - uat
``` sh
docker build -t lifelong-operation-ui:v1.0.0-b.3-a.3 . &&
docker image tag lifelong-operation-ui:v1.0.0-b.3-a.3 hubcpa.swu.ac.th/lifelong-operation-ui:v1.0.0-b.3-a.3 &&
docker push hubcpa.swu.ac.th/lifelong-operation-ui:v1.0.0-b.3-a.3
```

# deploy - uat
``` sh
kubectl apply -f lifelong-operation-ui-uat.yml 
```
