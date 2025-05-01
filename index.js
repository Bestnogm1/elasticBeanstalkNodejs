import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// A simple API endpoint that returns a JSON message
app.get("/api", (req, res) => {
  console.log("API endpoint hit part3");
  res.json({ message: "Hello from Express API!" });
});

app.get("/testing", (req, res) => {
  console.log("API endpoint hit part3");
  res.json({ message: "Works on testing" });
});

app.get("/", (req, res) => {
  console.log("API endpoint hit part3");
  res.json({ message: "Works on home" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// https://nodejsbackendbeamstack.s3.us-east-1.amazonaws.com/server/https://nodejsbackendbeamstack.s3.us-east-1.amazonaws.com/server/
//
// https://nodejsbackendbeamstack.s3.us-east-1.amazonaws.com/server/https://nodejsbackendbeamstack.s3.us-east-1.amazonaws.com/server/

/***
 * 
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "AllowS3BucketAccess",
			"Effect": "Allow",
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::elasticbeanstalk-us-east-1-126279266832",
				"arn:aws:s3:::elasticbeanstalk-us-east-1-126279266832/*",
				"arn:aws:s3:::codepipeline-us-east-1-2b63974515f8-4977-96fd-2819b74a5925",
				"arn:aws:s3:::codepipeline-us-east-1-2b63974515f8-4977-96fd-2819b74a5925/*"
			]
		},
		{
			"Sid": "AllowS3ObjectAccess",
			"Effect": "Allow",
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::elasticbeanstalk-us-east-1-126279266832",
				"arn:aws:s3:::elasticbeanstalk-us-east-1-126279266832/*",
				"arn:aws:s3:::codepipeline-us-east-1-2b63974515f8-4977-96fd-2819b74a5925",
				"arn:aws:s3:::codepipeline-us-east-1-2b63974515f8-4977-96fd-2819b74a5925/*"
			]
		}
	]
}
 * 
 * 
 * */
