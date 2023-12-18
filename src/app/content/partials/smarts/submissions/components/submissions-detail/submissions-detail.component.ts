import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    SubmissionModel,
    JobModel,

    PDFService,
    SubmissionService,
    JobService,

    SystemAlertService,
    ConfirmService,
} from '../../../../../../core/core.module';

import { SubmissionRejectReasonsComponent } from '../submission-reject-reasons/submission-reject-reasons.component';
import { SubmissionInterviewComponent } from '../submission-interview/submission-interview.component';

@Component({
    selector: 'rbp-submissions-detail',
    templateUrl: './submissions-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionsDetailComponent implements OnInit {
    private submissionChanged: boolean = false;
    submission: SubmissionModel = new SubmissionModel();
    job: JobModel = new JobModel();
    sampleReasons: string[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    constructor(
        private _systemAlertService: SystemAlertService,
        private _submissionService: SubmissionService,
        private _changeRef: ChangeDetectorRef,
        private _jobService: JobService,
        private _pdfService: PDFService,
        private _confirmService: ConfirmService,
        private _translate: TranslateService,
        private _matDialog: MatDialog,
        public dialogRef: MatDialogRef<SubmissionsDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit() {
        this.init(this.data['id'], this.data['job']);
    }

    updateStatus(status: number): void {

        if (status === 2) {
            const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('SUBMISSION.ACCEPT_COMFIRM'));

            dialogRef.afterClosed().subscribe(res => {
                if (!res) {
                    return;
                }
                this.executeUpdate(status, null);
                this.submissionChanged = true;
            });
        }
        else if (status === 3) {
            const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('SUBMISSION.REJECT_COMFIRM'));

            dialogRef.afterClosed().subscribe(res => {
                if (!res) {
                    return;
                }
                const dialog = this.collectRejectReasons();

            let sub = dialog.afterClosed().subscribe(res => {
                    if (res) {
                        this.executeUpdate(status, res.map(x => x.Name));
                        this.submissionChanged = true;
                    }

                sub.unsubscribe();
                });
            });
        }
        else if (status === 4) {
            const dialog = this._matDialog.open(SubmissionInterviewComponent, {
                data: {
                    resumeId: this.submission.Id,
                    unitId: this.submission.UnitId,
                },
                disableClose: true,
                width: "40%"
            });

            dialog.afterClosed().subscribe(async res => {
                if (res) {
                    await this.refresh();
                    this.submissionChanged = true;
                }
            });
        }
        else if (status === 5) {
            const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('SUBMISSION.HIRED_COMFIRM'));

            dialogRef.afterClosed().subscribe(res => {
                if (!res) {
                    return;
                }
                this.executeUpdate(status, null);
                this.submissionChanged = true;
            });
        }
        else if (status === 6) {
            const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('SUBMISSION.INTERVIEW_FAIL_COMFIRM'));

            dialogRef.afterClosed().subscribe(res => {
                if (!res) {
                    return;
                }
                const dialog = this.collectRejectReasons();

                dialog.afterClosed().subscribe(res => {
                    if (res) {
                        this.executeUpdate(status, res.map(x => x.Name));
                        this.submissionChanged = true;
                    }
                });
            });
        } else {
            this.executeUpdate(status, null);
            this.submissionChanged = true;
        }
    }

    collectRejectReasons() {
        return this._matDialog.open(SubmissionRejectReasonsComponent, {
            data: this.sampleReasons,
            width: "50%"
        });
    }

    onCancel(): void {
        this.dialogRef.close(this.submissionChanged);
    }

    onExport(): void {
        this._pdfService.exportResume(this.submission);
    }

    private async executeUpdate(status: number, reasons: string[] = []): Promise<void> {
        this.viewControl.loading$.next(true);

        await this._submissionService.updateStatus(this.submission.Id, status, reasons).then(async res => {
            if (res) {
                this._systemAlertService.success(this._translate.instant("SUBMISSION.CRUD_MESSAGE.UPDATE_STATUS_SUCCESSFUL"));
                await this.refresh();
            }
        }).finally(() => this.viewControl.loading$.next(false));
    }

    private async refresh() {
        var result = await this._submissionService.getById(this.data['id']);
        if (result) {
            this.submission = result;
            this._changeRef.detectChanges();
        }
    }

    private init(id: string, job: string | number): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._submissionService.getById(id),
            this._jobService.get(job),
            this._submissionService.getSampleReasons(),
        ]).then(res => {
            this.submission = res[0];
            this.job = res[1];
            this.sampleReasons = res[2];
        }).finally(() => this.viewControl.loading$.next(false));
    }

    editInterview() {
        const dialog = this._matDialog.open(SubmissionInterviewComponent, {
            data: {
                resumeId: this.submission.Id,
                unitId: this.submission.UnitId,
                interview: this.submission.Interview,
            },
            disableClose: true,
            width: "40%"
        });

        dialog.afterClosed().subscribe(async res => {
            if (res) {
                await this.refresh();
                this.submissionChanged = true;
            }
        });
    }
}
