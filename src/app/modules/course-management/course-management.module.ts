import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseManagementRoutingModule } from './course-management-routing.module';

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
import { DirectiveModule } from 'src/app/common/directive/directive.module';
import { CourseManagementMainComponent } from './course-management-main/course-management-main.component';
import { DetailOfTheShortTrainingCourseComponent } from './course-general-information/detail-of-the-short-training-course/detail-of-the-short-training-course.component';
import { TeachingFormatComponent } from './course-general-information/teaching-format/teaching-format.component';
import { IndustryGroupOrTargetGroupComponent } from './course-general-information/industry-group-or-target-group/industry-group-or-target-group.component';
import { ResponsiblePersonComponent } from './course-general-information/responsible-person/responsible-person.component';
import { RelatedAgenciesOrEstablishmentsComponent } from './course-general-information/related-agencies-or-establishments/related-agencies-or-establishments.component';
import { CourseComparisonComponent } from './course-general-information/course-comparison/course-comparison.component';
import { DocumentsAndMoreComponent } from './course-general-information/documents-and-more/documents-and-more.component';
import { CourseManagementListComponent } from './course-management-list/course-management-list.component';
import { PipeModule } from 'src/app/common/pipes/pipe.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

import { LearningOutcomesComponent } from './course-lerning-outcome-and-skill/learning-outcomes/learning-outcomes.component';
import { ExpectedLearningOutcomesComponent } from './course-lerning-outcome-and-skill/expected-learning-outcomes/expected-learning-outcomes.component';
import { LearningManagementProcessComponent } from './course-lerning-outcome-and-skill/learning-management-process/learning-management-process.component';
import { CourseApprovalDocumentsComponent } from './course-attached-document/course-approval-documents/course-approval-documents.component';
import { RelatedAgenciesOrEstablishmentsManageComponent } from './course-general-information/related-agencies-or-establishments/related-agencies-or-establishments-manage/related-agencies-or-establishments-manage.component';
import { ExpectedLearningOutcomesManageComponent } from './course-lerning-outcome-and-skill/expected-learning-outcomes/expected-learning-outcomes-manage/expected-learning-outcomes-manage.component';
import { LearningOutcomesManageComponent } from './course-lerning-outcome-and-skill/learning-outcomes/learning-outcomes-manage/learning-outcomes-manage.component';
import { LearningManagementProcessManageComponent } from './course-lerning-outcome-and-skill/learning-management-process/learning-management-process-manage/learning-management-process-manage.component';
import { CourseApprovalDocumentsManageComponent } from './course-attached-document/course-approval-documents/course-approval-documents-manage/course-approval-documents-manage.component';
import { CourseComparisonManageComponent } from './course-general-information/course-comparison/course-comparison-manage/course-comparison-manage.component';
import { DocumentsAndMoreManageComponent } from './course-general-information/documents-and-more/documents-and-more-manage/documents-and-more-manage.component';
import { ResponsiblePersonManageComponent } from './course-general-information/responsible-person/responsible-person-manage/responsible-person-manage.component';
import { CourseRoundListComponent } from './course-round-list/course-round-list.component';
import { CourseRoundMainComponent } from './course-round-main/course-round-main.component';
import { CourseRoundCreateComponent } from './course-round-create/course-round-create.component';
import { RoundOpenCourseRoundComponent } from './round-course-general/round-open-course-round/round-open-course-round.component';
import { RoundLocationAndStudyLocationComponent } from './round-course-general/round-location-and-study-location/round-location-and-study-location.component';
import { RoundInstructorComponent } from './round-course-general/round-instructor/round-instructor.component';
import { RoundTeachingDocumentsComponent } from './round-course-general/round-teaching-documents/round-teaching-documents.component';
import { RoundExpensesAndShareOfRegistrationFeesComponent } from './round-course-general/round-expenses-and-share-of-registration-fees/round-expenses-and-share-of-registration-fees.component';
import { RoundAccompanyingVideoComponent } from './round-course-general/round-accompanying-video/round-accompanying-video.component';
import { RoundThumbnailComponent } from './round-course-general/round-thumbnail/round-thumbnail.component';
import { RoundOtherIllustrationsComponent } from './round-course-general/round-other-illustrations/round-other-illustrations.component';
import { RoundTeachingSupportingDocumentsComponent } from './round-course-general/round-teaching-documents/round-teaching-supporting-documents/round-teaching-supporting-documents.component';
import { AddRoundInstructorComponent } from './round-course-general/round-instructor/add-round-instructor/add-round-instructor.component';
import { RoundOtherIllustrationsManageComponent } from './round-course-general/round-other-illustrations/round-other-illustrations-manage/round-other-illustrations-manage.component';
import { ComponentModule } from '../component/component.module';
import { RoundRequestApprovalComponent } from './round-course-general/round-request-approval/round-request-approval.component';
import { CourseApprovalComponent } from './course-approval/course-approval.component';
import { RoundApprovalComponent } from './round-approval/round-approval.component';
import { WindowComponent } from '../component/window.component';
import { PortalModule } from '@angular/cdk/portal';
import { RoundCancellationComponent } from './round-cancellation/round-cancellation.component';
import { RoundCancellationConfirmationComponent } from './round-cancellation-confirmation/round-cancellation-confirmation.component';
import { RoundWorkerComponent } from './round-course-general/round-worker/round-worker.component';
import { RoundWorkerManageComponent } from './round-course-general/round-worker/round-worker-manage/round-worker-manage.component';
import { RoundMoreDetailComponent } from './round-course-general/round-more-detail/round-more-detail.component';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { RoundCertificateComponent } from './round-course-general/round-certificate/round-certificate.component';

@NgModule({
    declarations: [
        CourseManagementMainComponent,
        DetailOfTheShortTrainingCourseComponent,
        TeachingFormatComponent,
        IndustryGroupOrTargetGroupComponent,
        ResponsiblePersonComponent,
        RelatedAgenciesOrEstablishmentsComponent,
        CourseComparisonComponent,
        DocumentsAndMoreComponent,
        CourseManagementListComponent,
        LearningOutcomesComponent,
        ExpectedLearningOutcomesComponent,
        LearningManagementProcessComponent,
        CourseApprovalDocumentsComponent,
        RelatedAgenciesOrEstablishmentsManageComponent,
        ExpectedLearningOutcomesManageComponent,
        LearningOutcomesManageComponent,
        LearningManagementProcessManageComponent,
        CourseApprovalDocumentsManageComponent,
        CourseComparisonManageComponent,
        DocumentsAndMoreManageComponent,
        ResponsiblePersonManageComponent,
        CourseRoundListComponent,
        CourseRoundMainComponent,
        CourseRoundCreateComponent,
        RoundOpenCourseRoundComponent,
        RoundLocationAndStudyLocationComponent,
        RoundInstructorComponent,
        RoundTeachingDocumentsComponent,
        RoundExpensesAndShareOfRegistrationFeesComponent,
        RoundAccompanyingVideoComponent,
        RoundThumbnailComponent,
        RoundOtherIllustrationsComponent,
        AddRoundInstructorComponent,
        RoundTeachingSupportingDocumentsComponent,
        RoundOtherIllustrationsManageComponent,
        RoundRequestApprovalComponent,
        CourseApprovalComponent,
        RoundApprovalComponent,
        WindowComponent,
        RoundCancellationComponent,
        RoundCancellationConfirmationComponent,
        RoundWorkerComponent,
        RoundWorkerManageComponent,
        RoundMoreDetailComponent,
        RoundCertificateComponent,
    ],
    imports: [
        CommonModule,
        CourseManagementRoutingModule,
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
        ComponentModule,
        PortalModule,
        VgCoreModule
    ]
})
export class CourseManagementModule {}
