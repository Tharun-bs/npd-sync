export interface Trial {
  id: string;
  trialNo: string;
  partName: string;
  status: 'in_progress' | 'halted' | 'completed';
  haltedStepCode?: string;
  createdAt: string;
  updatedAt: string;
  steps: TrialStep[];
}

export interface TrialStep {
  id: string;
  stepCode: string;
  stepName: string;
  orderIndex: number;
  validationStatus: 'ok' | 'not_ok' | 'pending';
  data: Record<string, any>;
  remarks?: string;
  completedAt?: string;
}

export interface Department {
  code: string;
  name: string;
  orderIndex: number;
  fields: FieldConfig[];
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'time';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export const DEPARTMENTS: Department[] = [
  {
    code: 'DPT1',
    name: 'Department 1 - General Details',
    orderIndex: 1,
    fields: [
      { name: 'trialNo', label: 'Trial No', type: 'text', required: true },
      { name: 'partName', label: 'Part Name', type: 'text', required: true },
      { name: 'dateOfSampling', label: 'Date of Sampling', type: 'date', required: true },
      { name: 'noOfMoulds', label: 'No. of Moulds', type: 'number', required: true },
      { name: 'disaFoundry', label: 'DISA/FOUNDRY', type: 'select', options: ['A', 'B'], required: true },
      { name: 'reasonForSampling', label: 'Reason for Sampling', type: 'textarea', required: true },
      { name: 'hod', label: 'HOD', type: 'text', required: true }
    ]
  },
  {
    code: 'DPT2',
    name: 'Department 2 - Melting',
    orderIndex: 2,
    fields: [
      { name: 'heatCode', label: 'Heat Code', type: 'text', required: true },
      { name: 'carbon', label: 'Carbon (%)', type: 'number', required: true },
      { name: 'silicon', label: 'Silicon (%)', type: 'number', required: true },
      { name: 'manganese', label: 'Manganese (%)', type: 'number', required: true },
      { name: 'phosphorous', label: 'Phosphorous (%)', type: 'number', required: true },
      { name: 'sulphur', label: 'Sulphur (%)', type: 'number', required: true },
      { name: 'magnesium', label: 'Magnesium (%)', type: 'number', required: true },
      { name: 'copper', label: 'Copper (%)', type: 'number', required: true },
      { name: 'chromium', label: 'Chromium (%)', type: 'number', required: true },
      { name: 'pouringTemp', label: 'Pouring Temperature (°C)', type: 'number', required: true },
      { name: 'inoculationStream', label: 'Inoculation - Stream (gms)', type: 'number', required: true },
      { name: 'inoculationInmould', label: 'Inoculation - Inmould (gms)', type: 'number', required: true },
      { name: 'pouringTime', label: 'Pouring Time (Sec)', type: 'number', required: true },
      { name: 'ppCode', label: 'PP Code', type: 'text', required: true },
      { name: 'otherRemarks', label: 'Other Remarks', type: 'textarea' },
      { name: 'hod', label: 'HOD', type: 'text', required: true }
    ]
  },
  {
    code: 'DPT3',
    name: 'Department 3 - Sand Properties',
    orderIndex: 3,
    fields: [
      { name: 'tClay', label: 'T.Clay', type: 'number', required: true },
      { name: 'aClay', label: 'A.Clay', type: 'number', required: true },
      { name: 'vcm', label: 'VCM', type: 'number', required: true },
      { name: 'loi', label: 'LOI', type: 'number', required: true },
      { name: 'afs', label: 'AFS', type: 'number', required: true },
      { name: 'gcs', label: 'G.C.S', type: 'number', required: true },
      { name: 'moi', label: 'MOI', type: 'number', required: true },
      { name: 'compactability', label: 'Compactability', type: 'number', required: true },
      { name: 'perm', label: 'Perm', type: 'number', required: true },
      { name: 'otherRemarks', label: 'Other Remarks', type: 'textarea' },
      { name: 'hod', label: 'HOD', type: 'text', required: true }
    ]
  },
  {
    code: 'DPT4',
    name: 'Department 4 - Moulding',
    orderIndex: 4,
    fields: [
      { name: 'mouldThickness', label: 'Mould Thickness', type: 'number', required: true },
      { name: 'compressability', label: 'Compressability', type: 'number', required: true },
      { name: 'squeezePressure', label: 'Squeeze Pressure', type: 'number', required: true },
      { name: 'mouldHardness', label: 'Mould Hardness', type: 'number', required: true },
      { name: 'otherRemarks', label: 'Other Remarks', type: 'textarea' },
      { name: 'hod', label: 'HOD', type: 'text', required: true }
    ]
  },
  {
    code: 'DPT5',
    name: 'Department 5 - Metallurgical Inspection',
    orderIndex: 5,
    fields: [
      { name: 'microExamination', label: 'Micro Examination Result', type: 'select', options: ['OK', 'NOT OK'], required: true },
      { name: 'tensileTest', label: 'Tensile Strength, Yield Strength & Elongation', type: 'select', options: ['OK', 'NOT OK'], required: true },
      { name: 'hardnessTest', label: 'Hardness', type: 'select', options: ['OK', 'NOT OK'], required: true },
      { name: 'ndtInspection', label: 'NDT Inspection Analysis', type: 'textarea', required: true },
      { name: 'refNo', label: 'Ref.NO (Trial No: and date)', type: 'text', required: true },
      { name: 'hod', label: 'HOD', type: 'text', required: true }
    ]
  },
  {
    code: 'DPT6',
    name: 'Department 6 - Fettling & Inspection',
    orderIndex: 6,
    fields: [
      { name: 'visualRemarks', label: 'Visual Remarks on Degating, Flash, Fines, Inspection', type: 'textarea', required: true },
      { name: 'quantityInspected', label: 'Quantity Inspected', type: 'number', required: true },
      { name: 'quantityRejected', label: 'Quantity Rejected', type: 'number', required: true },
      { name: 'reasonForRejection', label: 'Reason for Rejection', type: 'textarea', required: true },
      { name: 'visualHod', label: 'HOD (Visual Inspection)', type: 'text', required: true },
      { name: 'dimensionalRemarks', label: 'Dimensional Inspection Remarks', type: 'textarea', required: true },
      { name: 'bunchWeight', label: 'Bunch Wt. (or) Casting Weight', type: 'number', required: true },
      { name: 'dimensionalHod', label: 'HOD (Dimensional Inspection)', type: 'text', required: true },
      { name: 'quantityReceived', label: 'Quantity Received (M/C Shop)', type: 'number', required: true },
      { name: 'quantityMachined', label: 'Quantity Machined', type: 'number', required: true },
      { name: 'quantityRejectedMc', label: 'Quantity Rejected (M/C Shop)', type: 'number', required: true },
      { name: 'reasonForRejectionMc', label: 'Reason for Rejection (M/C Shop)', type: 'textarea', required: true },
      { name: 'dimensionalReportRemarks', label: 'Dimensional Report Remarks', type: 'textarea', required: true },
      { name: 'mcShopHod', label: 'HOD (M/C Shop)', type: 'text', required: true },
      { name: 'refNo', label: 'Ref.NO (Trial No: and date)', type: 'text', required: true }
    ]
  }
];