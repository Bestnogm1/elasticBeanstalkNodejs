import fetch from "node-fetch";
import "dotenv/config.js";
import { google } from "googleapis";

const { OAuth2 } = google.auth;

// const oAuth2Client = new OAuth2(
//   process.env.OAuth_Client_ID,
//   process.env.OAuth_Client_Secret
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.OAuth_Refresh_Token });

// const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

export const createCalendarEvent = (date, hourRange, address, name) => {
  // let [startingTime, endingTime] = hourRange.split(" - ").map((hour) => {
  //   if (hour.includes("am") || hour === "12:00pm") {
  //     return Number(hour.split(":")[0]);
  //   }
  //   return Number(hour.split(":")[0]) + 12;
  // });
  // const eventStartTime = new Date(date);
  // eventStartTime.setHours(startingTime);
  // const eventEndTime = new Date(date);
  // eventEndTime.setHours(endingTime);
  // const event = {
  //   summary: `${name}'s Cleaning Booking`,
  //   location: address,
  //   description: "Home Cleaning",
  //   start: {
  //     dateTime: eventStartTime,
  //     timeZone: "America/New_York",
  //   },
  //   end: {
  //     dateTime: eventEndTime,
  //     timeZone: "America/New_York",
  //   },
  //   colorId: 1,
  // };
  // // calendar.freebusy.query(
  // //   {
  // //     resource: {
  // //       timeMin: eventStartTime,
  // //       timeMax: eventEndTime,
  // //       timeZone: "America/New_York",
  // //       items: [{ id: "primary" }], // Calenders associated with this account
  // //     },
  // //   },
  // //   (err, res) => {
  // //     if (err) return console.error("Free Busy Query Error: ", err);
  // //     const eventsArray = res?.data?.calendars?.primary?.busy; // This is an array of events at the same time. Can be used to refuse bookings if there are too many bookings at one time
  // //     // If there is nothing scheduled for that time - insert our new event into the calendar
  // //   }
  // // );
  // console.log("eventStartTime: ", eventStartTime);
  // console.log("eventEndTime: ", eventEndTime);
  // calendar.events.insert({ calendarId: "primary", resource: event }, (err) => {
  //   if (err) return console.error("Calendar Event Creation Error: ", err);
  //   return console.log("Calendar Event Created!");
  // });
};

export const notifyBookingsChannel = async (bookingDetails) => {
  let { bedrooms, bathrooms, kitchens, addons, date, time, customerName } =
    bookingDetails;
  let data = await fetch(
    "https://hooks.slack.com/services/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",
    {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        blocks: [
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${
                customerName.toUpperCase() || customerName
              }*\n${date}\n${time}\n`,
            },
            accessory: {
              type: "image",
              image_url:
                "https://api.slack.com/img/blocks/bkb_template_images/notifications.png",
              alt_text: "calendar thumbnail",
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Booking Details",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${bedrooms}* Bedrooms\n*${bathrooms}* Bathrooms\n*${kitchens}* Kitchens\n\n*Add-ons:*\n${addons}`,
            },
            accessory: {
              type: "image",
              image_url:
                "https://fresh-start-cleaners-assets.s3.amazonaws.com/FR.png",
              alt_text: "calendar thumbnail",
            },
          },
        ],
      }),
    }
  );
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const buildLeadMessage = (leadDetails, type) => {
  const {
    firstName,
    lastName,
    fullName,
    zipCode,
    email,
    phoneNumber,
    bathrooms,
    bedrooms,
    cleaningType,
    frequency,
    quote,
    companySize,
    message: comments,
    city,
    businessName,
  } = leadDetails;

  // Determine the full name for commercial leads if not provided as firstName and lastName
  const name =
    fullName ||
    `${firstName || ""} ${lastName || ""}`.trim() ||
    "Name not provided";
  const readableDate = formatDate(leadDetails.date);

  // Build message text dynamically by including only defined values
  const messageParts = [
    `*Type: ${type}*`,
    `*Name: ${name}*`,
    phoneNumber && `Phone Number: ${phoneNumber}`,
    email && `Email: ${email}`,
    zipCode && `Zip Code: ${zipCode}`,
    bedrooms && `Bedrooms: ${bedrooms}`,
    bathrooms && `Bathrooms: ${bathrooms}`,
    cleaningType && `Cleaning Type: ${cleaningType}`,
    frequency && `Frequency: ${frequency}`,
    quote && `Quote: $${quote}.00`,
    readableDate && `Date: ${readableDate}`,
    companySize && `Company Size: ${companySize}`,
    comments && `Comments: ${comments}`,
    city && `City: ${city}`,
    businessName && `Business Name: ${businessName}`,
  ].filter(Boolean); // Remove undefined or falsy values

  return messageParts.join("\n");
};

export const notifyLeadsChannel = async (leadDetails, type = "residential") => {
  const messageText = buildLeadMessage(leadDetails, type);

  const message = {
    blocks: [
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: messageText,
        },
        accessory: {
          type: "image",
          image_url:
            "https://api.slack.com/img/blocks/bkb_template_images/notifications.png",
          alt_text: "calendar thumbnail",
        },
      },
      { type: "divider" },
    ],
  };

  await fetch(
    "https://hooks.slack.com/services/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",
    {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(message),
    }
  );
};

export const notifyZipCodeCheck = async (zipCode, distance, maxMiles) => {
  await fetch(
    "https://hooks.slack.com/services/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",
    {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        blocks: [
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*ZIP CODE CHECK*\nZip Code: ${zipCode}\n${distance}\nCurrent max miles: ${maxMiles}\n`,
            },
          },
          {
            type: "divider",
          },
        ],
      }),
    }
  );
};
