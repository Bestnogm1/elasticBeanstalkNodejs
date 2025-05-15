import sgMail from "@sendgrid/mail";

const email = "bookings@freshstartcleaners.us";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const emailBookingDetails = (user, url, verified = false) => {
  const msg = {
    to: user.email,
    from: email,
    templateId: "d-f7c28a271d514e03a1b37c33adc8f9ff",
    dynamicTemplateData: {
      subject: "Your Booking is Confirmed",
      name: user.firstName,
      lastName: user.lastName,
      date: user.date,
      cleaningKind: user.cleaningPackage,
      arrivalWindow: user.selectedTime,
      phoneNumber: user.phoneNumber,
      orderTotal: user.price / 100,
      address: user.address,
      city: user.city,
      aptSuite: user.aptSuite,
      addOns: user.addons,
      bedrooms: user.bedrooms,
      bathrooms: user.bathrooms,
      kitchens: user.kitchens,
      frequency: user.frequency,
      zipCode: user.zipCode,
      state: user.state,
      instructions: user.instructions,
      cleanliness: user.cleanliness,
    },
  };

  const messageToSelf = {
    to: process.env.BOOKING_CONFIRMATION_EMAIL,
    from: email,
    templateId: "d-f7c28a271d514e03a1b37c33adc8f9ff",
    dynamicTemplateData: {
      subject: "New Booking",
      name: user.firstName,
      lastName: user.lastName,
      date: user.date,
      cleaningKind: user.cleaningPackage,
      arrivalWindow: user.selectedTime,
      phoneNumber: user.phoneNumber,
      orderTotal: user.price / 100,
      address: user.address,
      city: user.city,
      aptSuite: user.aptSuite,
      addOns: user.addons,
      bedrooms: user.bedrooms,
      bathrooms: user.bathrooms,
      kitchens: user.kitchens,
      frequency: user.frequency,
      zipCode: user.zipCode,
      state: user.state,
      instructions: user.instructions,
      cleanliness: user.cleanliness,
    },
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });

  sgMail
    .send(messageToSelf)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};
