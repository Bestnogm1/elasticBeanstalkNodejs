import mongoose from "mongoose";

mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGODB_URI, () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB has disconnected!");
});

mongoose.connection.on("error", (error) => {
  console.error(`Error connecting to MongoDB: ${error}`);
});
