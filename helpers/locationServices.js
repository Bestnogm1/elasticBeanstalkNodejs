import axios from "axios";
import { notifyZipCodeCheck } from "./automation.js";

const MAX_MILE_RADIUS = 35;

export const calculateApproximateDistance = async (zipCode) => {
  const { lat, lng } = await getCoordinates(zipCode);
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=39.1869537%2C-77.18299249&destinations=${
      lat + "%2C" + lng
    }&units=imperial&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const distanceInMiles =
    Math.ceil(data?.rows[0]?.elements[0]?.distance?.value / 1609) ?? 9999;

  const validLocation = distanceInMiles <= MAX_MILE_RADIUS;

  console.log(`This location is approximately ${distanceInMiles} miles away`);
  notifyZipCodeCheck(
    zipCode,
    `This location is approximately ${distanceInMiles} miles away`,
    MAX_MILE_RADIUS
  );

  return validLocation;
};

const getCoordinates = async (zipCode) => {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const { lat, lng } = data?.results[0]?.geometry?.location ?? {
    lat: 34.052235,
    lng: -118.243683,
  };

  return { lat, lng };
};
