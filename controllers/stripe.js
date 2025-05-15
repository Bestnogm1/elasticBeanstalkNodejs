// Imports
import { stripe } from "../server.js";
import CompletedOrder from "../models/CompletedOrder.js";
import User from "../models/User.js";
import { getPrice } from "./price.js";
import { emailBookingDetails } from "./emailValidation.js";
import {
  notifyBookingsChannel,
  createCalendarEvent,
} from "../helpers/automation.js";
// Controllers
export const acceptPayment = async (req, res) => {
  const { formData: data, user = undefined } = req.body;

  console.log("Data: ", data);
  let orderDetails, orderTotal;

  try {
    orderTotal = (await calculatePrice(data)) * 100;

    // Create a customer
    let customer = await stripe.customers.create({
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      address: {
        city: data.city,
        country: "US",
        line1: data.address,
        postal_code: data.zipCode,
        state: data.state,
      },
    });
    2;

    if (data.frequency !== "One Time") {
      const product = await stripe.products.create({
        name: "Fresh Start Cleaning",
      });

      const price = await stripe.prices.create({
        nickname: "Fresh Start Cleaning",
        product: product.id,
        unit_amount:
          data.frequency === "Bi-Weekly" ? orderTotal / 2 : orderTotal, // Charge them double if its a bi-weekly subscription because we only change them once per month
        currency: "usd",
        recurring: {
          interval: data.frequency === "Monthly" ? "month" : "week",
        },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id, quantity: 1 }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      orderDetails = await CompletedOrder.create({
        serviceAddress:
          `${data?.address || ""} ${
            data?.aptSuite ? data.aptSuite + "," : ""
          } ${data?.city || ""} ${data?.state || ""}, ${data?.zipCode || ""}` ||
          "",
        arrivalWindow: data.selectedTime || "",
        price: orderTotal || 1,
        date: data?.selectedDate || "",
        service: JSON.stringify({
          cleaningPackage: data?.cleaningPackage || "Standard Cleaning",
          bedrooms: data?.bedrooms || 1,
          bathrooms: data?.bathrooms || 1,
          kitchens: data?.kitchens || 1,
          addons: data?.addons || "",
          instructions: data?.instructions || "",
        }),
        customerName: `${data?.firstName || ""} ${data?.lastName || ""}`,
        customerEmail: data?.email || "",
        customerPhoneNumber: data.phoneNumber,
        paymentId: subscription.id || "",
        isSubscription: true,
      });

      res.status(200).json({
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        subscriptionId: subscription.id,
        orderDetails,
      });
    } else {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        customer: customer ? customer.id : undefined,
        amount: orderTotal,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      orderDetails = await CompletedOrder.create({
        serviceAddress:
          `${data?.address || ""} ${
            data?.aptSuite ? data.aptSuite + "," : ""
          } ${data?.city || ""} ${data?.state || ""}, ${data?.zipCode || ""}` ||
          "",
        arrivalWindow: data.selectedTime || "",
        price: orderTotal || 1, //! Come Back To This!
        date: data?.selectedDate || "",
        service: JSON.stringify({
          cleaningPackage: data?.cleaningPackage || "Standard Cleaning",
          bedrooms: data?.bedrooms || 1,
          bathrooms: data?.bathrooms || 1,
          kitchens: data?.kitchens || 1,
          addons: data?.addons || "",
          instructions: data?.instructions || "",
        }),
        customerName: `${data?.firstName || ""} ${data?.lastName || ""}`,
        customerEmail: data?.email || "",
        customerPhoneNumber: data.phoneNumber,
        paymentId: paymentIntent?.id || "",
        isSubscription: false,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        orderDetails,
      });
    }
    let addons = Object.keys(data?.addons || {}).join(", ");
    let slackData = {
      customerName: `${data?.firstName || ""} ${data?.lastName || ""}`,
      bathrooms: data?.bathrooms || "",
      bedrooms: data?.bedrooms || "",
      kitchens: data?.kitchens || "",
      addons,
      date: data?.selectedDate || "",
      time: data.selectedTime || "",
    };
    notifyBookingsChannel(slackData);
    emailBookingDetails({ ...data, price: orderTotal });
    createCalendarEvent(
      data.selectedDate,
      data.selectedTime,
      data.address + " " + data.city + ", " + data.state + " " + data.zipCode,
      data.firstName + " " + data.lastName
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error,
    });
  }

  if (user && user._id) {
    const customer = await User.findById(user._id);
    if (customer) {
      if (!customer.firstName) customer.firstName = data?.firstName || "";
      if (!customer.lastName) customer.lastName = data?.lastName || "";
      if (!customer.phoneNumber) customer.phoneNumber = data?.phoneNumber || "";
      if (!customer.address) customer.address = data?.address || "";
      if (!customer.city) customer.city = data?.city || "";
      if (!customer.zipCode) customer.zipCode = data?.zipCode || "";

      customer.bookings.push(orderDetails);
      await customer.save();
    }
  }
};

// Helper Functions
const calculatePrice = async (formData) => {
  let { cost: bedroomCost } = await getPrice({
    service: "bedroom",
    count: formData?.bedrooms || 1,
  });

  let { cost: bathroomCost } = await getPrice({
    service: "bathroom",
    count: formData?.bathrooms || 1,
  });
  
  let { cost: kitchenCost } = await getPrice({
    service: "kitchen",
    count: formData?.kitchens || 1,
  });

  let addonTotal = Object.values(formData.addons).reduce((cv, acc) => {
    return (acc += cv);
  }, 0);

  let total = addonTotal + bedroomCost + bathroomCost + kitchenCost;

  if (formData.cleanliness === "Pretty Dirty") {
    total = Math.ceil(total * 1.08);
  }

  if (formData.cleanliness === "Very Dirty") {
    total = Math.ceil(total * 1.18);
  }

  if (formData.cleaningPackage === "Deep Cleaning") {
    total = Math.ceil(total * 1.2);
  }

  if (formData.cleaningPackage === "Moving Clean") {
    total = Math.ceil(total * 1.3);
  }

  let discount = 0;

  switch (formData.frequency) {
    case "Weekly":
      discount = Math.floor(total * 0.27);
      break;
    case "Bi-Weekly":
      discount = Math.floor(total * 0.2);
      break;
    case "Monthly":
      discount = Math.floor(total * 0.1);
      break;
    default:
      discount = 0;
      break;
  }

  return total - discount;
};
