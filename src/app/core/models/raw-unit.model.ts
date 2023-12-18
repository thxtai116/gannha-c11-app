import { BaseModel } from './base/base.model';
import { ActionStatus } from '../enums';

export class RawUnitModel extends BaseModel {
    Name: string = "";

    RemoteId: string = "";

    Address: string = "";

    Email: string = "";

    Deleted: boolean;

    Description: string = "";

    Is24H: boolean;

    Latitude: number;

    Longitude: number;

    PhoneString: string = "";

    BrandId: string = "";

    SpecificTime: string = "";

    ReferenceId: string = "";

    ActionCode: string = "";

    ActionStatus: ActionStatus = 0;

    ActionAt: Date = new Date();
}

        /*
    -    public string Name { get; set; }
    -    public string RemoteID { get; set; }
    -    public string Description { get; set; }
        public string Administrator { get; set; }
    -    public string Address { get; set; }
    -    public string Email { get; set; }
    -    public string PhoneString { get; set; }
    -    public double Latitude { get; set; }
    -    public double Longitude { get; set; }
    -    public bool Is24H { get; set; } = false;
    -    public string SpecificTime { get; set; }
    -    public bool Deleted { get; set; } = false;
    -    public int Status { get; set; } = 0;
        public string OldRowKey { get; set; }
    -    public string ReferenceId { get; set; }
        public string RefererId { get; set; }
    -    public string UpdatedBy { get; set; }
    -    public DateTime? UpdatedAt { get; set; }

    +    public int ActionStatus { get; set; }
    +    public DateTime? ActionAt { get; set; }
        public string ActionBy { get; set; }
    +    public string ActionCode { get; set; }
        public DateTime? LastCrawledAt { get; set; }
        public string LastCrawledBy { get; set; }
        */