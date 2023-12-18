import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { PartialsModule } from '../../../partials/partials/partials.module';
import { CoreModule } from '../../../../core/core.module';
import { FilesModule } from '../../../partials/smarts/files/files.module';

import { FoldersPage } from './folders.page';

@NgModule({
    declarations: [
        FoldersPage
    ],
    imports: [
        CommonModule,

        PartialsModule,
        CoreModule,
        FilesModule,

        TranslateModule,
        RouterModule.forChild([
            {
                path: '',
                component: FoldersPage
            }
        ]),
    ],
    exports: [],
    providers: [],
})
export class FoldersModule { }