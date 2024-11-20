import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastCloseEvent } from 'primeng/toast';
import { TreeNode, MessageService, MenuItem, TreeTableNode } from 'primeng/api';
import { MODE_PAGE } from 'src/app/models/common';
import { AllMenuData, AutRoleData } from 'src/app/models/user-management';
import { UserManagementService } from 'src/app/services/user-management.service';

@Component({
    selector: 'app-role-manage',
    templateUrl: './role-manage.component.html',
    styleUrls: ['./role-manage.component.scss']
})
export class RoleManageComponent implements OnInit {
    processing: boolean = false;
    showError: boolean = false;

    @Input() item!: AutRoleData;
    @Input() mode: MODE_PAGE = 'CREATE';
    @Input() lang: string = 'th';

    @Output() backToListPage = new EventEmitter();

    menu: TreeNode[] = [];
    // menuTemp: [] = [];
    // menuTemp2: TreeNode[] = [];

    initForm: boolean = false;
    user: MenuItem;
    groupuser: MenuItem;

    cols: any[] = [];

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private userManagementService: UserManagementService
    ) {
        this.cols = [{ field: 'name', header: 'Name' }];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;

            this.user =
            {
                label: this.translate.instant('common.module.user'),
                command: () => this.openPage('LIST')
            }

            this.groupuser =
            {
                label: this.translate.instant('userManagement.role.name'),
                command: () => this.openPage('LIST')
            }

        }
    }

    sortMenu(rowNodeFlatten: any[]) {
        rowNodeFlatten.sort((a, b) => a.menuId - b.menuId)
    }

    checkTree(menu: AllMenuData, rowNode: any) {

        const rowNodeFlatten: any[] = [];
        this.flattenTree([ rowNode.node ], rowNodeFlatten);

        rowNodeFlatten.sort((a, b) => b.menuId - a.menuId)

        const updateActiveFlag = (node, item, menu) => {
            if (node.data['menuId'] && node.data['menuId'] == item['menuId']) {
                node.data.activeFlag = menu.activeFlag;
            }
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    updateActiveFlag(child, item, menu);
                });
            }
        }

        for (const item of rowNodeFlatten) {
            [rowNode.node].forEach(node => {
                updateActiveFlag(node, item, menu);
            });
        }

    }

    /*
    filterTreeNodesByKey(treeNodes: TreeNode[], key: string, searchValue: string): TreeNode[] {
        const filteredNodes: TreeNode[] = [];

        treeNodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                const filteredChildren = this.filterTreeNodesByKey(node.children, key, searchValue);
                if (filteredChildren.length > 0) {
                    const clonedNode = { ...node };
                    clonedNode.children = filteredChildren;
                    filteredNodes.push(clonedNode);
                }
            } else if (node && node.data[key] && node.data[key].toString().toLowerCase().includes(searchValue.toLowerCase())) {
                filteredNodes.push(node);
            }
        });

        return filteredNodes;
    }
    */

    flattenTree(treeNodes: TreeNode[], listData: AllMenuData[]) {
        treeNodes.forEach(node => {
            listData.push(node.data);
            if (node.children && node.children.length > 0) {
                this.flattenTree(node.children, listData);
            }
        });
    }

    onSave() {
        this.loaderService.start();

        this.processing = true;

        this.loaderService.start();
        if (
            !!!this.item.name
        ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            this.loaderService.stop();
            return;
        }

        const permissions = []
        this.flattenTree(this.menu, permissions);
        this.sortMenu(permissions)

        this.item.allMenu = permissions;


        if (this.mode === 'CREATE') {
            this.userManagementService.postRole(this.item).subscribe(({ status, message }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                } else if (status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
        } else if (this.mode === 'EDIT') {
            this.userManagementService.putRole(this.item.roleId, this.item).subscribe(({ status, message }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                } else if (status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
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

    }

    ngOnInit(): void {
        setTimeout(() => {
            this.transformData(this.item.allMenu);
        }, 200);
    }

    transformData(data: AllMenuData[]) {
        this.menu = this.buildTree(data);
        this.initForm = true;
    }

    buildTree(data, parentId = 0) {
        const result = [];
        (data || []).forEach((item) => {
            if (item.parentId === parentId) {
                const children = this.buildTree(data, item.menuId);
                const newItem = {
                    data: item,
                    children: null,
                    expanded: true,
                    key: item.menuId,
                    activeFlag: item.activeFlag,
                    leaf: false
                };
                if (children.length) {
                    newItem.children = children;
                }
                result.push(newItem);
            }
        });
        return result;
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    openPage(page: MODE_PAGE) {
        this.backToListPage.emit('LIST');
    }
}
