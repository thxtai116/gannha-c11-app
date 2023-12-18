export class MenuService {
    getRecommendationDetailMenu(): any[] {
        return [
            {
                Name: "RECOMMENDATIONS.BASIC_INFO",
                Href: 'basic-info'
            },
            {
                Name: "RECOMMENDATIONS.RESOURCES",
                Href: 'resources'
            }
        ];
    }
}