import { Types } from "mongoose";

export interface ICreditScore {
	userId: Types.ObjectId; // FK to User
	score: number; // Credit score value
	lastUpdated: Date; // Date when the score was last updated
	history: Array<{
		timestamp: Date; // Timestamp of the record creation
		reason: string; // Reason for score change
		scoreChange: number; // Change in score value
	}>; // History of score changes
	isDeleted: boolean; // Soft delete flag
}
