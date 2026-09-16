export interface ChildData {
    parent_id: string;
    full_name: string;
    dob: string;
    gender: string;
    relationship: string;
    birth_cert_number?: string;
}
export interface MedicalProfileData {
    blood_group: string;
    birth_weight_kg: number;
    allergies?: string;
    existing_conditions?: string;
    primary_clinic?: string;
}
export declare const createChildWithMedicalProfile: (child: ChildData, medical: MedicalProfileData) => Promise<any>;
export declare const getChildrenByParentId: (parent_id: string) => Promise<any[]>;
export declare const updateChildDetails: (child_id: string, child: Partial<ChildData>) => Promise<void>;
export declare const updateChildMedicalProfile: (child_id: string, medical: Partial<MedicalProfileData>) => Promise<void>;
export declare const getAllChildren: () => Promise<any[]>;
//# sourceMappingURL=childModel.d.ts.map