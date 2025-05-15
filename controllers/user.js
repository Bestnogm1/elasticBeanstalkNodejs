import User from "../models/User.js";
import CompletedOrder from "../models/CompletedOrder.js";

export const allUsers = async () => {
  try {
    const users = await User.find({});
    return resizeBy.json({ users });
  } catch (error) {
    console.error(error);
  }
};

export const getUserBookings = async (req, res) => {
  const { email } = req.body;

  let allUserOrders = await CompletedOrder.find({ customerEmail: email });

  return res.json(allUserOrders);
};
