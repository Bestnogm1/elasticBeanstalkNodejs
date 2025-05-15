import mongoose from "mongoose";

const { Schema, model } = mongoose;

const completedOrderSchema = new Schema({
  serviceAddress: {
    type: String,
    required: true,
  },
  arrivalWindow: {
    type: String,
    required: true,
  },
  date: String,
  price: {
    type: Number,
    required: true,
  },
  service: {
    type: String, // Stringified JSON
    required: true,
  },
  paymentId: String,
  customerName: String,
  customerEmail: String,
  customerPhoneNumber: String,
  isSubscription: Boolean,
});

export default model("completedOrder", completedOrderSchema);
