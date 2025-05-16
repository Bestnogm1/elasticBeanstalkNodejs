import express from "express";
import "dotenv/config.js";
import logger from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import Stripe from "stripe";

// CONFIG
const app = express();
app.use(logger("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// Allowed origins for dev or prod
const devOrigins = [
  "https://dev.freshstartcleaners.app",
  "https://dev.admin.freshstartcleaners.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
];

const prodOrigins = [
  "https://freshstartcleaners.app",
  "https://www.freshstartcleaners.app",
  "https://admin.freshstartcleaners.app",
];

// A custom CORS origin function that logs incoming requests
const corsOptions =
  process.env.NODE_ENV === "PRODUCTION"
    ? {
        origin: prodOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
      }
    : {
        origin: (origin, callback) => {
          console.log("[CORS DEBUG] Incoming request from origin:", origin);

          // If "origin" is undefined, it can be a same-origin request or a tool like Postman.
          // You can decide how to handle that. For now, let's allow if we are in dev mode and there's no origin.
          if (!origin && process.env.NODE_ENV !== "PRODUCTION") {
            console.log(
              "[CORS DEBUG] Missing origin header; allowing in development."
            );
            return callback(null, true);
          }

          // Build the array of allowed origins based on NODE_ENV
          const allowedOrigins =
            process.env.NODE_ENV === "PRODUCTION" ? prodOrigins : devOrigins;

          if (allowedOrigins.includes(origin)) {
            console.log("[CORS DEBUG] Origin allowed:", origin);
            callback(null, true);
          } else {
            console.log("[CORS DEBUG] Origin NOT allowed:", origin);
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
      };

// Setup CORS using the above options
app.use(cors(corsOptions));

export const stripe = Stripe(
  process.env.NODE_ENV === "DEVELOPMENT"
    ? process.env.STRIPE_SECRET_TEST_KEY
    : process.env.STRIPE_SECRET_KEY
);
// Database Connection
import("./db/connection.js"); // Make sure this file connects to MongoDB

// Expire Sessions
import("./helpers/expireSessions.js");

// Route Imports
import { router as authRouter } from "./routes/auth.js";
import { router as userRouter } from "./routes/user.js";
import { router as trackingRouter } from "./routes/tracking.js";
import { router as scheduleRouter } from "./routes/schedule.js";
import { router as stripeRouter } from "./routes/stripe.js";
import { router as distanceRouter } from "./routes/distance.js";
import { router as priceRouter } from "./routes/price.js";
import { router as leadRouter } from "./routes/lead.js";
import { router as crmRouter } from "./routes/crm.js";

// Routes
app.get("/health", (req, res) => {
  res.json({ health: "OK" });
});
app.use("/api/accept-lead", leadRouter);
app.use("/api/auth", authRouter);
app.use("/api/price", priceRouter);
app.use("/api/users", userRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/crm", crmRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/check-distance", distanceRouter);
app.use("/create-payment-intent", stripeRouter);

// PORT
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log("Listening On Port " + PORT));
// import express from "express";

// const app = express();
// const port = process.env.PORT || 8080;

// app.get("/", (req, res) => {
//   res.send("✅ Hello from Elastic Beanstalk!");
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
