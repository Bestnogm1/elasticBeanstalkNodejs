// File: models/Tag.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ColumnSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["text", "select"], default: "text" },
  options: { type: [String], default: [] },
});

const TagSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  // Each tag can have a distinct set of columns
  columns: {
    type: [ColumnSchema],
    default: [],
  },
});

export const Tag = model("Tag", TagSchema);
