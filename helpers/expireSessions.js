// expireSessions.js
import cron from "node-cron";
import TrackingSession from "../models/TrackingSession.js";

// This cron job runs every 30 minutes.
// The cron pattern "*/30 * * * *" means "at every 30th minute."
cron.schedule("*/30 * * * *", async () => {
  try {
    const now = Date.now();
    // Define a threshold of 30 minutes ago.
    const threshold = now - 30 * 60 * 1000;

    // Update all sessions where:
    // - sessionEnd is null, and
    // - sessionStart is older than the threshold.
    // The pipeline update does the following:
    //   - Sets sessionEnd to now.
    //   - If totalTimeOnSite is null, calculates it as the difference between now and sessionStart,
    //     divided by 1000 (to convert milliseconds to seconds) and rounded to two decimals.
    //     Otherwise, leaves totalTimeOnSite unchanged.
    const updateResult = await TrackingSession.updateMany(
      {
        sessionEnd: null,
        sessionStart: { $lt: threshold },
      },
      [
        {
          $set: {
            sessionEnd: now,
            totalTimeOnSite: {
              $cond: [
                { $eq: ["$totalTimeOnSite", null] },
                {
                  $round: [
                    { $divide: [{ $subtract: [now, "$sessionStart"] }, 1000] },
                    2,
                  ],
                },
                "$totalTimeOnSite",
              ],
            },
          },
        },
      ]
      // If needed, you can pass: { useUpdatePipeline: true }
    );

    const expiredCount =
      updateResult.modifiedCount || updateResult.nModified || 0;
    console.log(
      `[${new Date().toISOString()}] Expired ${expiredCount} tracking session(s).`
    );
  } catch (error) {
    console.error("Error expiring tracking sessions:", error);
  }
});
