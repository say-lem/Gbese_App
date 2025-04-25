export interface IKYCMetadata {
    bvn?: string;
    nin?: string;
    selfieURL?: string;
    idType?: string;
    idNumber?: string;
  }
  
  export interface IKYCVerification {
    userId: string;
    status: 'pending' | 'verified' | 'rejected';
    submittedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    provider?: string;
    metadata?: IKYCMetadata;
    isDeleted?: boolean;
  }
  