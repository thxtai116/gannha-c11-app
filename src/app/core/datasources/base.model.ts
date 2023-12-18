export interface ILog {
    _userId: number; // user who did changes
    _createdDate: string; // date when entity were created => format: 'mm/dd/yyyy'
    _updatedDate: string; // date when changed were applied => format: 'mm/dd/yyyy'
}

export interface IFilter {
    _defaultFieldName: string; // Field which should filtered first
}

export interface IEdit {
    _isEditMode: boolean;
    _isNew: boolean;
    _isDeleted: boolean;
    _isUpdated: boolean;
    _prevState: any;
}

export class BaseModel implements IEdit, IFilter, ILog {
    // Edit
    _isEditMode: boolean = false;
    _isNew: boolean = false;
    _isUpdated: boolean = false;
    _isDeleted: boolean = false;
    _prevState: any = null;
    // Filter
    _defaultFieldName: string = '';
    // Log
    _userId: number = 0; // Admin
    _createdDate: string;
    _updatedDate: string;
}
