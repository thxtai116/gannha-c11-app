import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ResponseContentType, RequestOptions, Headers, Http } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { SubmissionModel } from '../models';
import { GenderNamePipe, DegreeNamePipe } from '../pipes';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable()
export class PDFService {

    private form: any;

    private images: any = {};
    // private idCardFront: any;
    // private idCardBack: any;

    constructor(
        private _datePipe: DatePipe,
        private _translateService: TranslateService,
        private _http: Http,
    ) { }

    exportResume(resume: SubmissionModel) {
        this.form = resume;

        Promise.all([
            this.getImage(resume.IdentityCardFront.trim()),
            this.getImage(resume.IdentityCardBack.trim())
        ]).then(value => {
            this.processIdCardFrontImage(value[0]);
            this.processIdCardBackImage(value[1]);
        })
    }

    private tryDownloadPDF() {
        let doc = this.getDocument(this.form)

        if (doc) {
            pdfMake.createPdf(doc).download();
        }
    }

    private getDocument(form: any) {
        switch (form.constructor.name) {
            case "SubmissionModel": {
                return this.getResumeDocument(form);
            }
            default: return undefined;
        }
    }

    private getResumeDocument(form: SubmissionModel) {
        if (this.images.idCardFront && this.images.idCardBack) {
            return {
                content: [
                    {
                        text: this._translateService.instant("SUBMISSION.BASIC_INFO"),
                        bold: true,
                        fontSize: 20,
                        alignment: 'center',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        columns: [
                            [{
                                text: this._translateService.instant("FORM.FIELDS.FULL_NAME") + ": " + form.FullName,
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("FORM.FIELDS.EMAIL") + ": " + form.Email,
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("FORM.FIELDS.BIRTHDAY") + ": " + this._datePipe.transform(form.BirthDay, 'dd/MM/yyyy'),
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("SUBMISSION.WORKING_ADDRESS") + ": " + form.WorkingAddress,
                                margin: [0, 0, 0, 20],
                            },
                            {
                                text: this._translateService.instant("SUBMISSION.EDUCATION") + ": " + new DegreeNamePipe().transform(form.Education),
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("SUBMISSION.GRADUATE_YEAR") + ": " + form.GraduateYear,
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("SUBMISSION.MAJOR") + ": " + form.Major,
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("SUBMISSION.SCHOOL_NAME") + ": " + form.SchoolName,
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("SUBMISSION.EXPERIENCES") + ": " + form.Experiences,
                                margin: [0, 0, 0, 20]
                            },
                            ],

                            [{
                                text: this._translateService.instant("FORM.FIELDS.GENDER") + ": " + new GenderNamePipe().transform(form.Gender),
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("FORM.FIELDS.PHONE") + ": " + form.Phone,
                                margin: [0, 0, 0, 20]
                            },
                            {
                                text: this._translateService.instant("SUBMISSION.APPLIED_UNIT") + ": " + form.UnitName["vi"],
                                margin: [0, 0, 0, 20]
                            },
                            ],
                        ]
                    },
                    {
                        columns: [
                            [
                                {
                                    text: this._translateService.instant("FORM.FIELDS.IDENTITY_CARD_FRONT") + ": "
                                },
                                {
                                    image: this.images.idCardFront,
                                    width: 200,
                                }
                            ],
                            [
                                {
                                    text: this._translateService.instant("FORM.FIELDS.IDENTITY_CARD_FRONT") + ": "
                                },
                                {
                                    image: this.images.idCardBack,
                                    width: 200,
                                }
                            ]
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: this._translateService.instant("FORM.FIELDS.APPLIED_DATE") + ": " + this._datePipe.transform(form.CreatedAt, 'd/MM/yyyy'),
                        margin: [0, 0, 0, 20]
                    }
                ]
            }
        } else {
            return undefined;
        }
    }

    //
    // Nabbed from ImageCarouselComponent
    //
    private async getImage(event: string): Promise<any> {
        let reqHeaders = new Headers();

        let reqOptions = new RequestOptions({ headers: reqHeaders, responseType: ResponseContentType.Blob });

        let result = await this._http.get(event, reqOptions)
            .toPromise()
            .then((res: any) => {
                let blob = new Blob([res._body], {
                    type: res.headers.get("Content-Type")
                });

                return blob;
            }).catch((error: any) => {
                console.log(error)
            });

        return result;
    }

    private createFileFromBlob(theBlob: Blob) {
        var b: any = theBlob;

        b.lastModifiedDate = new Date();
        b.name = "image.jpg";

        return <File>theBlob;
    }
    //

    private async processIdCardFrontImage(blob: Blob) {
        var reader = new FileReader();

        reader.onload = () => {
            this.images.idCardFront = reader.result as string;
            this.tryDownloadPDF();
        }

        reader.readAsDataURL(this.createFileFromBlob(blob));
    }

    private async processIdCardBackImage(blob: Blob) {
        var reader = new FileReader();

        reader.onload = () => {
            this.images.idCardBack = reader.result as string;
            this.tryDownloadPDF();
        }

        reader.readAsDataURL(this.createFileFromBlob(blob));
    }
}