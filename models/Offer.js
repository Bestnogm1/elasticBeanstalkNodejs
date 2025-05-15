import mongoose from "mongoose";

const { Schema, model } = mongoose;

const offerSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  copy: {
    type: String,
    required: true,
  },
  terms: {
    type: String,
  },
  offerValue: {
    type: Number,
    required: true,
  },
});

export default model("Offer", offerSchema);
