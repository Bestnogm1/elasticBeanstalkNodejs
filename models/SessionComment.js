// models/SessionComment.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * A comment associated with a single session (tracking).
 */
const sessionCommentSchema = new Schema(
  {
    sessionId: { type: String, required: true },
    authorName: { type: String, default: "Anonymous" },
    text: { type: String, required: true },
    mood: { type: String, default: null }, // e.g. "excited", "loved", etc.
  },
  { timestamps: true }
);

export default model("SessionComment", sessionCommentSchema);
