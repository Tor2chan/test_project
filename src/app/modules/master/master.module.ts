import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Import PrimeNG modules
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CarouselModule } from 'primeng/carousel';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DockModule } from 'primeng/dock';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { InplaceModule } from 'primeng/inplace';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
// import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
// import { InputGroupModule } from 'primeng/inputgroup';
import { ImageModule } from 'primeng/image';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { ScrollerModule } from 'primeng/scroller';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SpeedDialModule } from 'primeng/speeddial';
import { SpinnerModule } from 'primeng/spinner';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TerminalModule } from 'primeng/terminal';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { TreeModule } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeTableModule } from 'primeng/treetable';
import { AnimateModule } from 'primeng/animate';
import { CardModule } from 'primeng/card';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';

import { MasterRoutingModule } from './master-routing.module';
import { DirectiveModule } from 'src/app/common/directive/directive.module';
import { PipeModule } from 'src/app/common/pipes/pipe.module';
import { BankListComponent } from './bank/bank-list/bank-list.component';
import { BankManageComponent } from './bank/bank-manage/bank-manage.component';
import { BankBranchListComponent } from './bank-branch/bank-branch-list/bank-branch-list.component';
import { BankBranchManageComponent } from './bank-branch/bank-branch-manage/bank-branch-manage.component';
import { BankAccountListComponent } from './bank-account/bank-account-list/bank-account-list.component';
import { BankAccountManageComponent } from './bank-account/bank-account-manage/bank-account-manage.component';
import { SharePercentListComponent } from './share-percent/share-percent-list/share-percent-list.component';
import { SharePercentManageComponent } from './share-percent/share-percent-manage/share-percent-manage.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { GeneralSkillListComponent } from './general-skill/general-skill-list/general-skill-list.component';
import { GeneralSkillManageComponent } from './general-skill/general-skill-manage/general-skill-manage.component';
import { OccupationListComponent } from './occupation/occupation-list/occupation-list.component';
import { OccupationManageComponent } from './occupation/occupation-manage/occupation-manage.component';
import { OccupationManageAddSkillsComponent } from './occupation/occupation-manage/occupation-manage-add-skills/occupation-manage-add-skills.component';
import { OccupationGroupListComponent } from './occupation-group/occupation-group-list/occupation-group-list.component';
import { OccupationGroupManageComponent } from './occupation-group/occupation-group-manage/occupation-group-manage.component';
import { FacultyListComponent } from './faculty/faculty-list/faculty-list.component';
import { FacultyManageComponent } from './faculty/faculty-manage/faculty-manage.component';
import { CourseTypeListComponent } from './course-type/course-type-list/course-type-list.component';
import { CourseTypeManageComponent } from './course-type/course-type-manage/course-type-manage.component';
import { FeeListComponent } from './fee/fee-list/fee-list.component';
import { FeeManageComponent } from './fee/fee-manage/fee-manage.component';
import { NotificationListComponent } from './notification/notification-list/notification-list.component';
import { NotificationManageComponent } from './notification/notification-manage/notification-manage.component';
import { ConsentManagementListComponent } from './consent-management/consent-management-list/consent-management-list.component';
import { ConsentManagementManageComponent } from './consent-management/consent-management-manage/consent-management-manage.component';
import { WebsiteBannerListComponent } from './website-banner/website-banner-list/website-banner-list.component';
import { WebsiteBannerManageComponent } from './website-banner/website-banner-manage/website-banner-manage.component';
import { CampaignListComponent } from './campaign/campaign-list/campaign-list.component';
import { CampaignManageComponent } from './campaign/campaign-manage/campaign-manage.component';
import { PersonalListComponent } from './personal/personal-list/personal-list.component';
import { ComponentModule } from '../component/component.module';
import { SettingReceiptComponent } from './setting-receipt/setting-receipt.component';
import { FeeAttachComponent } from './fee/fee-manage/fee-attach/fee-attach.component';
import { ConsentDiscloseManagementComponent } from './consent-management/consent-management-manage/consent-disclose-management/consent-disclose-management.component';
import { MemberConsentListComponent } from './consent-management/member-consent-list/member-consent-list.component';
import { CurriculumTypeListComponent } from './curriculum/curriculum-type-list/curriculum-type-list.component';
import { SubjectTypeListComponent } from './subject/subject-type-list/subject-type-list.component';
@NgModule({
    declarations: [
        GeneralSkillListComponent,
        GeneralSkillManageComponent,
        OccupationListComponent,
        OccupationManageComponent,
        BankListComponent,
        BankManageComponent,
        BankBranchListComponent,
        BankBranchManageComponent,
        BankAccountListComponent,
        BankAccountManageComponent,
        SharePercentListComponent,
        SharePercentManageComponent,
        OccupationManageAddSkillsComponent,
        OccupationGroupListComponent,
        OccupationGroupManageComponent,
        FacultyListComponent,
        FacultyManageComponent,
        CourseTypeListComponent,
        CourseTypeManageComponent,
        FeeListComponent,
        FeeManageComponent,
        NotificationListComponent,
        NotificationManageComponent,
        ConsentManagementListComponent,
        ConsentManagementManageComponent,
        ConsentDiscloseManagementComponent,
        MemberConsentListComponent,
        WebsiteBannerListComponent,
        WebsiteBannerManageComponent,
        CampaignListComponent,
        CampaignManageComponent,
        PersonalListComponent,
        SettingReceiptComponent,
        FeeAttachComponent,
        CurriculumTypeListComponent,
        SubjectTypeListComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        DirectiveModule,
        PipeModule,
        NgxUiLoaderModule,
        AccordionModule,
        AutoCompleteModule,
        AvatarModule,
        AvatarGroupModule,
        BadgeModule,
        BreadcrumbModule,
        ButtonModule,
        CalendarModule,
        CarouselModule,
        CascadeSelectModule,
        ChartModule,
        CheckboxModule,
        ChipModule,
        ChipsModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ColorPickerModule,
        ContextMenuModule,
        DataViewModule,
        VirtualScrollerModule,
        DialogModule,
        DividerModule,
        DockModule,
        DragDropModule,
        DropdownModule,
        DynamicDialogModule,
        EditorModule,
        FieldsetModule,
        FileUploadModule,
        GalleriaModule,
        InplaceModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputNumberModule,
        InputTextareaModule,
        ImageModule,
        KnobModule,
        ListboxModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OrganizationChartModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        RadioButtonModule,
        RatingModule,
        ScrollerModule,
        ScrollPanelModule,
        ScrollTopModule,
        SelectButtonModule,
        SidebarModule,
        SkeletonModule,
        SlideMenuModule,
        SliderModule,
        SpeedDialModule,
        SpinnerModule,
        SplitButtonModule,
        SplitterModule,
        StepsModule,
        TabMenuModule,
        TableModule,
        TabViewModule,
        TagModule,
        TerminalModule,
        TieredMenuModule,
        TimelineModule,
        ToastModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TriStateCheckboxModule,
        TreeModule,
        TreeSelectModule,
        TreeTableModule,
        AnimateModule,
        CardModule,
        BlockUIModule,
        ProgressSpinnerModule,
        RippleModule,
        StyleClassModule,
        MasterRoutingModule,
        ComponentModule
    ]
})
export class MasterModule {}
