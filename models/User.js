import mongoose from "mongoose";

const { Schema, model } = mongoose;

const defaultProfilePicture =
  "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg";

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
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
  },
  address: String,
  city: String,
  zipCode: Number,
  aptSuite: String,
  profilePicture: {
    type: String,
    required: true,
    default: defaultProfilePicture,
  },
  bookings: {
    type: [Schema.Types.ObjectId],
    ref: "CompletedOrder",
    required: true,
    default: [],
  },
  couponsOrOffers: {
    type: [Schema.Types.ObjectId],
    ref: "Offer",
    required: true,
    default: [],
  },
  subscription: [subscriptionSchema],
});

export default model("User", userSchema);
