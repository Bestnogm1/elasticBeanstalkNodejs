// models/TrackingSession.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const pageViewSchema = new Schema({
  pathname: String,
  timestamp: Number,
});

const trackingSessionSchema = new Schema(
  {
    // Ties multiple sessions to one visitor.
    visitorId: { type: String, required: true },

    // Unique ID for this session.
    sessionId: { type: String, required: true, unique: true },

    // If it’s truly the first time visitorId is used – now only set on insert!
    isNewVisitor: { type: Boolean, default: null },

    // A/B test variant, e.g. "A", "B", or null.
    landingVariant: { type: String, default: null },

    // Timestamps.
    sessionStart: Number,
    sessionEnd: Number,
    totalTimeOnSite: { type: Number, default: 0 },

    // Page data.
    landingPage: { type: String, default: null },
    exitPage: String,
    pageViews: [pageViewSchema],
    pageViewCount: Number,

    // Additional flags.
    conversionCompleted: { type: Boolean, default: null },
    fromGoogleAds: { type: Boolean, default: null },
  },
  { timestamps: true }
);

export default model("TrackingSession", trackingSessionSchema);
