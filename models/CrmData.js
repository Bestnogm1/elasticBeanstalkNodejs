// File: models/CrmData.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CrmDataSchema = new Schema(
  {
    // The tag (e.g., "dentist", "doctor") that this row belongs to
    tag: {
      type: String,
      required: true,
    },
    // Each row's data is stored as a dynamic map of key-value pairs
    // e.g., { firstName: "John", lastName: "Doe", phone: "123-456-7890" }
    data: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const CrmData = model("CrmData", CrmDataSchema);
