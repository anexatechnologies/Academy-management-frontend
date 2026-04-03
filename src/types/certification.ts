export interface BonafideParams {
  student_id: number;
  reason: string;
}

export interface TCParams {
  student_id: number;
  tc_no: string;
  reason_for_leaving: string;
  conduct: string;
  last_exam_year: string;
  last_exam_result: 'passed' | 'failed';
}

export interface TuitionFeeParams {
  student_id: number;
}

export interface ReceiptParams {
  payment_id: number;
}

export interface CompletionParams {
  student_id: number;
  course_id: number;
  grade: string;
}

export type CertificateType = 'bonafide' | 'tc' | 'tuition-fee' | 'receipt' | 'completion';
