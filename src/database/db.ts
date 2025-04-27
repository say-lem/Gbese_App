import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
	mongoose.Promise = global.Promise; // Use global Promise for mongoose
	try {
		mongoose.connection.on("connected", () => {
			console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
		});

		await mongoose.connect(process.env.MONGO_URI!);

	} catch (error) {
		console.error(`❌ Error connecting to MongoDB: ${error}`);
		process.exit(1);
	}
};
