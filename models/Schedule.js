import mongoose from "mongoose";

const { Schema, model } = mongoose;
export const defaultAvailableTimes = [
  "8:00 AM - 11:00 AM",
  "11:00 PM - 2:00 PM",
  "2:00 PM - 5:00 PM",
  "5:00 PM - 8:00 PM",
];

const scheduleSchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  takenTimes: {
    type: [String],
    required: true,
  },
  availableTimes: {
    type: [String],
    required: true,
    defaultValue: defaultAvailableTimes,
  },
});

export default model("Schedule", scheduleSchema);
