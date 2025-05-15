import calculatePrice from "../helpers/pricing.js";
import { notifyLeadsChannel } from "../helpers/automation.js";
export const getPrice = (req, res) => {
  try {
    console.log(`\n\nQuote Request Body:\n`, req.body, "\n\n");
    const quote = calculatePrice(req.body);
    notifyLeadsChannel(req.body);
    return res.status(200).json({ quote });
  } catch (error) {
    res.status(500).json({ error });
  }
};
