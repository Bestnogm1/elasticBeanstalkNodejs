import { notifyLeadsChannel } from "../helpers/automation.js";

export const acceptLead = (req, res) => {
  notifyLeadsChannel(req.body, "Residential");
  res.json({ success: true });
};

export const acceptCommercialLead = (req, res) => {
  console.log("Commercial Lead Received: ", req.body);
  notifyLeadsChannel(req.body, "Commercial");
  res.json({ success: true });
};
