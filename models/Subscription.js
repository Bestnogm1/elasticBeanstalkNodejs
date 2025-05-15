import mongoose from "mongoose";

const { Schema, model } = mongoose;

const subscriptionSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  service: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "CompletedOrder",
  },
  customerName: String,
  customerEmail: String,
  customerPhoneNumber: String,
  howOften: String,
  startDate: String,
});

export default model("Subscription", subscriptionSchema);
