import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AuthGuard } from './guard/auth.guard';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: '',
                    component: AppLayoutComponent,
                    canActivate: [AuthGuard],
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import('./modules/welcome/welcome.module').then((m) => m.WelcomeModule)
                        },
                        {
                            path: 'dash',
                            loadChildren: () =>
                                import('./demo/components/dashboard/dashboard.module').then((m) => m.DashboardModule)
                        },
                        {
                            path: 'uikit',
                            loadChildren: () =>
                                import('./demo/components/uikit/uikit.module').then((m) => m.UIkitModule)
                        },
                        {
                            path: 'utilities',
                            loadChildren: () =>
                                import('./demo/components/utilities/utilities.module').then((m) => m.UtilitiesModule)
                        },
                        {
                            path: 'documentation',
                            loadChildren: () =>
                                import('./demo/components/documentation/documentation.module').then(
                                    (m) => m.DocumentationModule
                                )
                        },
                        {
                            path: 'blocks',
                            loadChildren: () =>
                                import('./demo/components/primeblocks/primeblocks.module').then(
                                    (m) => m.PrimeBlocksModule
                                )
                        },
                        {
                            path: 'pages',
                            loadChildren: () =>
                                import('./demo/components/pages/pages.module').then((m) => m.PagesModule)
                        },
                        {
                            path: 'login',
                            loadChildren: () => import('./modules/login/login.module').then((m) => m.LoginModule)
                        },
                        {
                            path: 'master',
                            loadChildren: () => import('./modules/master/master.module').then((m) => m.MasterModule)
                        },
                        {
                            path: 'system-config',
                            loadChildren: () =>
                                import('./modules/system-config/system-config.module').then((m) => m.SystemConfigModule)
                        },
                        {
                            path: 'teacher-portal',
                            loadChildren: () =>
                                import('./modules/teacher-portal/teacher-portal.module').then(
                                    (m) => m.TeacherPortalModule
                                )
                        },
                        {
                            path: 'course-management',
                            loadChildren: () =>
                                import('./modules/course-management/course-management.module').then(
                                    (m) => m.CourseManagementModule
                                )
                        },
                        {
                            path: 'user-management',
                            loadChildren: () =>
                                import('./modules/user-management/user-management.module').then(
                                    (m) => m.UserManagementModule
                                )
                        },
                        {
                            path: 'news-management',
                            loadChildren: () =>
                                import('./modules/news-management/news-management.module').then(
                                    (m) => m.NewsManagementModule
                                )
                        },
                        {
                            path: 'financial-management',
                            loadChildren: () =>
                                import('./modules/financial-management/financial-management.module').then(
                                    (m) => m.FinancialManagementModule
                                )
                        },
                        {
                            path: 'report',
                            loadChildren: () => import('./modules/report/report.module').then((m) => m.ReportModule)
                        }
                    ]
                },
                {
                    path: 'auth',
                    loadChildren: () => import('./demo/components/auth/auth.module').then((m) => m.AuthModule)
                },
                {
                    path: 'landing',
                    loadChildren: () => import('./demo/components/landing/landing.module').then((m) => m.LandingModule)
                },
                { path: 'notfound', component: NotfoundComponent },
                { path: '**', redirectTo: '/notfound' }
            ],
            { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' }
        )
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
