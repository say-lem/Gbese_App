import mongoose from "mongoose";
import { MONGO_URI } from "../config/constants";

export const connectDB = async (): Promise<void> => {
	mongoose.Promise = global.Promise; // Use global Promise for mongoose
	try {
		mongoose.connection.on("connected", () => {
			console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
		});

		await mongoose.connect(MONGO_URI);

	} catch (error) {
		console.error(`❌ Error connecting to MongoDB: ${error}`);
		process.exit(1);
	}
};
