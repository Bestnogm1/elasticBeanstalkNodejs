// routes/tracking.js
import { Router } from "express";
import TrackingSession from "../models/TrackingSession.js";
import SessionComment from "../models/SessionComment.js";
import authenticateToken from "../middleware/authenticateToken.js";

export const router = Router();

/**
 * GET /api/tracking/sessions
 * ?timeframe=string in {today, yesterday, past7days, past30days, thisyear, alltime}
 * Additional query parameters:
 *   - googleAds: "true" or "false" (optional)
 *   - landingVariant: specific landing variant string (optional)
 *   - newUser: "true" or "false" (optional)
 *
 * Returns an array of sessions that match the filters.
 */
router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const {
      timeframe = "alltime",
      googleAds,
      landingVariant,
      newUser,
    } = req.query;

    // Build the filter object for sessionStart.
    const filter = buildTimeFilter(timeframe);

    // Apply additional filters if provided.
    if (googleAds) {
      filter.fromGoogleAds = googleAds === "true";
    }
    if (landingVariant && landingVariant !== "all") {
      filter.landingVariant = landingVariant;
    }
    if (newUser) {
      filter.isNewVisitor = newUser === "true";
    }

    // Fetch the documents from Mongo.
    const sessions = await TrackingSession.find(filter).lean();
    return res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Utility function to convert a timeframe string into a MongoDB filter object.
 * We match documents where sessionStart is between [start, end].
 * For "today", returns sessions from 12:00 AM today until 12:00 AM tomorrow.
 */
function buildTimeFilter(timeframe) {
  const now = new Date();
  let start = null;
  let end = null;

  switch (timeframe) {
    case "today": {
      // Sessions from 12:00 AM today until 12:00 AM tomorrow.
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      );
      break;
    }
    case "yesterday": {
      // From midnight yesterday to midnight today.
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        0,
        0,
        0
      );
      start = yesterday;
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      break;
    }
    case "past7days": {
      // From now minus 7 days to now.
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start = sevenDaysAgo;
      end = now;
      break;
    }
    case "past30days": {
      // From now minus 30 days to now.
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start = thirtyDaysAgo;
      end = now;
      break;
    }
    case "thisyear": {
      // From January 1st of the current year to now.
      const firstOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      start = firstOfYear;
      end = now;
      break;
    }
    case "alltime":
    default:
      // No time filter applied.
      return {};
  }

  const startMs = start.getTime();
  const endMs = end.getTime();

  return {
    sessionStart: {
      $gte: startMs,
      $lte: endMs,
    },
  };
}

/**
 * GET /api/tracking/sessions/:sessionId
 * Fetch a single session by sessionId.
 */
router.get("/sessions/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await TrackingSession.findOne({ sessionId }).lean();
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    return res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching single session:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/tracking/sessions/:sessionId/comments
 * Fetch all comments associated with a sessionId.
 */
router.get(
  "/sessions/:sessionId/comments",
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const comments = await SessionComment.find({ sessionId })
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * POST /api/tracking/sessions/:sessionId/comments
 * Create a new comment for the given session.
 * Expects JSON body: { authorName, text, mood }
 */
router.post(
  "/sessions/:sessionId/comments",
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { authorName, text, mood } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Comment text is required" });
      }

      // Optionally verify that the session actually exists:
      const existingSession = await TrackingSession.findOne({
        sessionId,
      }).lean();
      if (!existingSession) {
        return res
          .status(404)
          .json({ error: "Cannot post a comment to a non-existent session" });
      }

      const newComment = await SessionComment.create({
        sessionId,
        authorName: authorName || "Anonymous",
        text,
        mood: mood || null,
      });

      return res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * POST /api/tracking/partial
 *
 * Expects a JSON body with the following properties:
 * {
 *   visitorId: String,
 *   sessionId: String,
 *   isNewVisitor: Boolean,
 *   landingVariant: String,
 *   sessionStart: Number,
 *   sessionEnd: Number,
 *   totalTimeOnSite: Number,
 *   pageViews: Array,         // Array of objects with { pathname, timestamp }
 *   landingPage: String,
 *   exitPage: String,
 *   conversionCompleted: Boolean,
 *   fromGoogleAds: Boolean
 * }
 */
router.post("/partial", async (req, res) => {
  try {
    const {
      visitorId,
      sessionId,
      isNewVisitor,
      landingVariant,
      sessionStart,
      sessionEnd,
      totalTimeOnSite,
      pageViews,
      landingPage,
      exitPage,
      conversionCompleted,
      fromGoogleAds,
    } = req.body;

    console.log("req.body", req.body);

    // Validate required fields
    if (!visitorId || !sessionId) {
      return res
        .status(400)
        .json({ error: "visitorId and sessionId are required" });
    }

    // Build a pipeline update array that:
    // - Updates basic fields.
    // - Sets landingVariant only if it is currently null using $ifNull.
    // - Updates isNewVisitor only if it is currently null or missing using $ifNull.
    // - Combines existing pageViews with incoming pageViews into a temporary field.
    // - Deduplicates pageViews so that no two entries have both the same timestamp and pathname.
    // - Removes the temporary field.
    // - Sets pageViewCount based on the length of the deduplicated pageViews array.
    const updatePipeline = [
      {
        $set: {
          visitorId: visitorId,
          sessionStart: sessionStart,
          sessionEnd: sessionEnd,
          totalTimeOnSite: totalTimeOnSite,
          landingPage: { $ifNull: ["$landingPage", landingPage] },
          exitPage: exitPage,
          conversionCompleted: {
            $ifNull: ["$conversionCompleted", conversionCompleted],
          },
          fromGoogleAds: { $ifNull: ["$fromGoogleAds", fromGoogleAds] },
          landingVariant: { $ifNull: ["$landingVariant", landingVariant] },
          isNewVisitor: { $ifNull: ["$isNewVisitor", isNewVisitor] },
          tempPageViews: {
            $concatArrays: [
              { $ifNull: ["$pageViews", []] },
              Array.isArray(pageViews) && pageViews.length ? pageViews : [],
            ],
          },
        },
      },
      {
        $set: {
          pageViews: {
            $reduce: {
              input: "$tempPageViews",
              initialValue: [],
              in: {
                $cond: [
                  {
                    $anyElementTrue: {
                      $map: {
                        input: "$$value",
                        as: "existing",
                        in: {
                          $and: [
                            {
                              $eq: ["$$this.timestamp", "$$existing.timestamp"],
                            },
                            { $eq: ["$$this.pathname", "$$existing.pathname"] },
                          ],
                        },
                      },
                    },
                  },
                  "$$value",
                  { $concatArrays: ["$$value", ["$$this"]] },
                ],
              },
            },
          },
        },
      },
      {
        $unset: "tempPageViews",
      },
      {
        $set: {
          pageViewCount: { $size: "$pageViews" },
        },
      },
    ];

    const updatedDoc = await TrackingSession.findOneAndUpdate(
      { sessionId },
      updatePipeline,
      { new: true, upsert: true }
    );

    console.log("Upserted tracking session:", updatedDoc);
    return res.status(200).json({ success: true, doc: updatedDoc });
  } catch (error) {
    console.error("Error updating partial tracking data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
