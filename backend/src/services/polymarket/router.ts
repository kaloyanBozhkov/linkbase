import { Router } from "express";
import { polymarketService, renderChartPage } from "./index";
import { prisma } from "@linkbase/prisma";

const router = Router();

router.get("/poly/get-event-by-slug", async (req, res) => {
  const event = await polymarketService.getEventBySlug(
    req.query.slug as string
  );
  res.json(event);
});

router.post("/poly/btc-up-down-event", async (req, res) => {
  // Generate slug for current ET time
  const now = new Date();
  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const month = etTime.toLocaleString("en-US", { month: "long" }).toLowerCase();
  const day = etTime.getDate();
  const hour = etTime.getHours();
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;

  const slugForToday = `bitcoin-up-or-down-${month}-${day}-${displayHour}${ampm}-et`;

  const event = await polymarketService.getEventBySlug(slugForToday);

  // Store only essential data to avoid index size issues
  try {
    await prisma.jSON_DUMPS.create({
      data: {
        json_data: JSON.stringify(event),
        case: "btc-up-down-event",
      },
    });
  } catch (error) {
    console.warn("Failed to store event data:", error instanceof Error ? error.message : String(error));
    // Continue execution even if storage fails
  }

  res.json(event);
});

router.get("/poly/chart/:appName", renderChartPage);

export default router;
