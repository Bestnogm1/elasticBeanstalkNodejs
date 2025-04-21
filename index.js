import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// A simple API endpoint that returns a JSON message
app.get("/api", (req, res) => {
  console.log("API endpoint hit part2");
  res.json({ message: "Hello from Express API!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// https://nodejsbackendbeamstack.s3.us-east-1.amazonaws.com/server/https://nodejsbackendbeamstack.s3.us-east-1.amazonaws.com/server/
//
// https://nodejsbackendbeamstack.s3.us-east-1.amazonaws.com/server/https://nodejsbackendbeamstack.s3.us-east-1.amazonaws.com/server/
