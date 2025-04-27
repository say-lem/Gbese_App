import { Types } from 'mongoose';

export interface ICreditScore {
    userId: Types.ObjectId; // FK to User
    score: number; // Credit score value
    lastUpdated: Date; // Date when the score was last updated
    history: Array<{ date: Date; score: number }>; // History of score changes
    isDeleted: boolean; // Soft delete flag
}