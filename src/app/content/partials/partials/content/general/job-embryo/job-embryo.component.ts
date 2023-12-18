import { Component, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, OnInit } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../../../environments/environment'

@Component({
    selector: 'm-job-embryo',
    templateUrl: 'job-embryo.component.html',
    styleUrls: ['job-embryo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => JobEmbryoComponent),
            multi: true,
        }
    ]
})
export class JobEmbryoComponent implements OnInit, ControlValueAccessor {
    @ViewChild('brandLogo', { static: true }) logo: ElementRef;

    private _obsers: any[] = [];
    private _onChangeCallback = (value: any) => { };

    storageEndPoint = environment.storageEndpoint;

    jobPreview: any = {
        brandLogo: "",

        title: "",
        salary: "",
        types: [],
        dateRange: [new Date(), new Date()],

        benefits: [],
        workingAddress: "",
        jobDescription: "",
        requirements: "",
    };

    displayLogo: string = "/assets/app/media/img/default_user.jpg";
    defaultLogo: string = "/assets/app/media/img/default_user.jpg";

    benefitLogo: string = "../../../../../../assets/app/media/img/icons/jobs/ic_recruit_benefit@3x.png"
    addressLogo: string = "../../../../../../assets/app/media/img/icons/jobs/ic_recruit_location@3x.png"
    descriptionLogo: string = "../../../../../../assets/app/media/img/icons/jobs/ic_recruit_description@3x.png"
    requirementLogo: string = "../../../../../../assets/app/media/img/icons/jobs/ic_recruit_requirement@3x.png"

    constructor(
        private _translate: TranslateService,
        private _changeRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.bindEvents();
    }

    writeValue(obj: any): void {
        if (obj) {
            this.jobPreview = obj;

            this.displayLogo = this.jobPreview.brandLogo;

            this._changeRef.detectChanges();
        }
    }
    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    private bindEvents() {
        this.logo.nativeElement.addEventListener('error', () => {
            this.displayLogo = this.defaultLogo;
            this._changeRef.detectChanges();
        })
    }
}