import { Component, ChangeDetectionStrategy, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { BehaviorSubject } from 'rxjs';

import {
    FacebookPostModel,
    SellingPointModel,
    ResourceModel,

    SellingPointService,

    SellingPointBasicViewModel,

    LanguagePipe,
    ResourceType,

    ScheduleUtility,
} from '../../../../../../core/core.module';

import { environment } from '../../../../../../../environments/environment';

@Component({
    selector: 'm-raw-selling-points-detail',
    templateUrl: 'raw-selling-points-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RawSellingPointsDetailComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    }

    viewData: any = {
        post: new FacebookPostModel(),
        sellingPoint: new SellingPointModel()
    }

    viewModel: any = {
        sellingPoint: new SellingPointBasicViewModel()
    }

    form: FormGroup;

    lang: string = "vi";

    storageEndpoint: string = environment.storageEndpoint;

    constructor(
        private _sellingPointService: SellingPointService,
        private _scheduleUtil: ScheduleUtility,
        private dialogRef: MatDialogRef<RawSellingPointsDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        this.viewData.post = this.data;

        if (this.viewData.post.ReferenceId && this.viewData.post.ReferenceId.length > 0) {
            this.init(this.viewData.post.ReferenceId);
        }
    }

    onCancelClick() {
        this.dialogRef.close();
    }

    private init(id: string): void {

        this.viewControl.loading$.next(true);

        Promise.all([
            this._sellingPointService.get(id)
        ]).then(value => {
            this.viewData.sellingPoint = value[0];

            this.viewModel.sellingPoint = this.parseToViewModel(this.viewData.sellingPoint);

            this.setForm(this.viewData.sellingPoint);
        }).finally(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private setForm(sellingPoint: SellingPointModel): void {
        let posters: ResourceModel[] = [];

        for (let i = 0; i < sellingPoint.Gallery.length; i++) {
            let gallery = new ResourceModel();

            gallery.Url = sellingPoint.Gallery[i].Url;
            gallery.Type = sellingPoint.Gallery[i].Type;

            if (gallery.Type === ResourceType.Image) {
                posters.push(gallery);
            }
        }

        this.form.get('Video').setValue(sellingPoint.Gallery.filter(x => x.Type == ResourceType.HLS || x.Type == ResourceType.Video) || []);
        this.form.get('Posters').setValue(posters);
        this.form.get('Actions').setValue(sellingPoint.Actions.map(x => x.Service));

        this.form.get("TimeRanges").setValue(sellingPoint.TimeRanges);
    }

    private parseToViewModel(sellingPoint: SellingPointModel): SellingPointBasicViewModel {
        let vm = new SellingPointBasicViewModel();

        vm.Title = new LanguagePipe().transform(sellingPoint.Detail.Title);
        vm.TitleEn = new LanguagePipe().transform(sellingPoint.Detail.Title, "en");
        vm.Description = new LanguagePipe().transform(sellingPoint.Detail.Description);
        vm.DescriptionEn = new LanguagePipe().transform(sellingPoint.Detail.Description, "en");
        vm.StartDate = new Date(sellingPoint.StartDate);
        vm.EndDate = new Date(sellingPoint.EndDate);
        vm.Status = sellingPoint.Status;
        vm.Icon = sellingPoint.Icon;
        vm.Order = sellingPoint.Order;
        vm.TimeRanges = sellingPoint.TimeRanges;
        vm.Tags = sellingPoint.Tags;
        vm.Units = sellingPoint.Units;
        vm.RepeatString = this._scheduleUtil.toString(sellingPoint.Repeat, this.lang);

        for (let i = 0; i < sellingPoint.Gallery.length; i++) {
            let gallery = new ResourceModel();

            gallery.Url = sellingPoint.Gallery[i].Url;
            gallery.Type = sellingPoint.Gallery[i].Type;

            if (gallery.Type === ResourceType.Video) {
                vm.Video.push(gallery.Url);
            }
            else if (gallery.Type === ResourceType.Image) {
                vm.Posters.push(gallery);
            }
        }

        vm.Actions = sellingPoint.Actions.map(x => x.Service);

        return vm;
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Video: new FormControl(''),
            Posters: new FormControl([]),
            Actions: new FormControl([]),
            TimeRanges: new FormControl([])
        });
    }
}