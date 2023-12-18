export class MenuService {
    getRecruitmentDetailMenu(): any[] {
        return [
            {
                Name: "RECRUITMENTS.BASIC_INFO",
                Href: 'basic-info'
            },
            {
                Name: "RECRUITMENTS.SUBMISSIONS",
                Href: 'submissions'
            },
            {
                Name: "RECRUITMENTS.JOBS",
                Href: 'jobs'
            },
            // {
            //     Name: "RECRUITMENTS.REPORT",
            //     Href: 'report'
            // }
        ];
    }
}