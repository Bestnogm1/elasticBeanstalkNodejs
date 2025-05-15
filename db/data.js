export const service = {
  "Inside Oven": 30,
  Walls: 30,
  "Inside Windows": 30,
  "Inside the Fridge": 30,
  "Inside Cabinets": 30,
  Organization: 50,
  "Inside Dishwasher": 25,
  "Inside Garage": 30,
  Laundry: 65,
  Blinds: 35,
  "Inside Washer/Dryer": 45,
  Microwave: 12,
};

export const bedroomBasePrice = 115;
export const additionalKitchenPrice = 30;
export const additionalBathroomPrice = 22;
export const additionalBedroomPrice = 15;

export const roomPrice = (roomType, count) => {
  let cost;
  switch (roomType) {
    case "bedroom":
      cost = bedroomBasePrice;
      for (let i = 0; i < count - 1; i += 1) {
        cost += additionalBedroomPrice;
      }
      return cost;
    case "bathroom":
      cost = 0;
      for (let i = 0; i < count - 1; i += 1) {
        cost += additionalBathroomPrice;
      }
      return cost;
    case "kitchen":
      cost = 0;
      for (let i = 0; i < count - 1; i += 1) {
        cost += additionalKitchenPrice;
      }
      return cost;

    default:
      return 0;
  }
};
