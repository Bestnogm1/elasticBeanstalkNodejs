import { calculateApproximateDistance } from "../helpers/locationServices.js";

export const checkDistance = async (req, res) => {
  const { zipCode } = req.body;
  const validLocation = await calculateApproximateDistance(zipCode);

  res.json({ validLocation });
};
