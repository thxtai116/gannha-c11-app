export class MenuService {
    getJobDetailMenu(): any[] {
        return [
            {
                Name: "JOBS.BASIC_INFO",
                Href: 'basic-info'
            },
            {
                Name: "JOBS.SUBMISSIONS",
                Href: 'submissions'
            },
            {
                Name: "FORM.FIELDS.UNITS",
                Href: 'units'
            },
            // {
            //     Name: "FORM.FIELDS.REPORT",
            //     Href: 'report'
            // }
        ];
    }
}