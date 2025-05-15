// Define service prices in a consistent manner
export const service = {
  insideOven: 30,
  walls: 30,
  insideWindows: 30,
  insideFridge: 30,
  insideCabinets: 30,
  organization: 50,
  insideDishwasher: 25,
  insideGarage: 30,
  laundry: 65,
  blinds: 35,
  insideWasherDryer: 45,
  microwave: 12,
};

const frequencyDiscounts = {
  oneTime: 0, // No discount
  monthly: 0.1, // 10% discount
  biweekly: 0.22, // 22% discount
  weekly: 0.26, // 26% discount
};

// Define base prices and additional room prices
export const BEDROOM_BASE_PRICE = 115;
export const ADDITIONAL_KITCHEN_PRICE = 30;
export const ADDITIONAL_BATHROOM_PRICE = 22;
export const ADDITIONAL_BEDROOM_PRICE = 25;
export const ONE_TIME_CLEANING_FEE = 30;

export const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[\s\-\_\(\)\,]+(.)?/g, (match, chr) =>
      chr ? chr.toUpperCase() : ""
    )
    .replace(/^[A-Z]/, (match) => match.toLowerCase());
};

// Calculate room price based on room type and count
export const roomPrice = (roomType, count) => {
  if (count < 1) return 0;

  switch (roomType) {
    case "bedroom":
      return (
        BEDROOM_BASE_PRICE +
        (count - 1 >= 0 ? count - 1 : 0) * ADDITIONAL_BEDROOM_PRICE
      );
    case "bathroom":
      return count <= 1 > 1 ? 0 : (count - 1) * ADDITIONAL_BATHROOM_PRICE;
    case "kitchen":
      return count <= 1 > 1 ? 0 : (count - 1) * ADDITIONAL_KITCHEN_PRICE;
    default:
      return 0;
  }
};

// Calculate total price based on room counts, frequency, and addons
const calculatePrice = ({
  bedrooms = 1,
  bathrooms = 0,
  kitchens = 0,
  frequency = "oneTime",
  cleaningType,
  addons = [],
}) => {
  let total = 0;

  total += roomPrice("bedroom", bedrooms);
  total += roomPrice("bathroom", bathrooms);
  total += roomPrice("kitchen", kitchens);

  // Handle add-ons
  addons.forEach((addon) => {
    total += service[toCamelCase(addon)];
  });

  // Apply frequency discount
  console.log(`\n\nfrequency: ${frequency}\n\n`);
  const discount = frequencyDiscounts[frequency] || 0;

  if (frequency === "oneTime") total += ONE_TIME_CLEANING_FEE;
  if (cleaningType === "deep") total = total * 1.25;
  if (cleaningType === "moving") total = total * 1.35;

  console.log(`\n\ndiscount: ${discount}\n\n`);
  return Math.ceil(total * (1 - discount));
};

export default calculatePrice;
