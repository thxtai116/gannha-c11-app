export class JobBasicInfoViewModel {
    Title: string = "";

    Description: string = "";

    Requirements: string = "";

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    CreatedAt: Date = new Date();

    JobTypes: string[] = [];

    JobBenefits: string[] = [];

    Salary: string = "";

    Demands: number = 1;

    Recruitment: string = "";

    WorkingAddress: string = "";

    RequireSubmitFields: string[] = [];

    Status: number = 0;
}