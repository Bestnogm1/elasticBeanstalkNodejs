import Schedule, { defaultAvailableTimes } from "../models/Schedule.js";

// Todo - - If Day Had Scheduling, Send Back Available Days
// Todo - - If Day Had Scheduling, Send Back Available Days

export const checkDay = async (req, res) => {
  const day = await Schedule.findOne({ day: req.params.id });

  if (!day) {
    return res.status(200).json({ times: defaultAvailableTimes });
  }

  return res.status(200).json({ day });
};

export const updateSchedule = (req, res) => {};
