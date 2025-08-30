import { Request, Response } from "express";
import { renderPage } from "@/flows";
import axios from "axios";

// Types for Polymarket API responses
export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  resolutionSource: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  openInterest: number;
  sortBy: string;
  createdAt: string;
  updatedAt: string;
  competitive: number;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  enableOrderBook: boolean;
  liquidityClob: number;
  negRisk: boolean;
  commentCount: number;
  markets: PolymarketMarket[];
  series: PolymarketSeries[];
  tags: PolymarketTag[];
  cyom: boolean;
  showAllOutcomes: boolean;
  showMarketImages: boolean;
  enableNegRisk: boolean;
  automaticallyActive: boolean;
  startTime: string;
  seriesSlug: string;
  negRiskAugmented: boolean;
  pendingDeployment: boolean;
  deploying: boolean;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  archived: boolean;
  resolvedBy: string;
  restricted: boolean;
  groupItemThreshold: string;
  questionID: string;
  enableOrderBook: boolean;
  orderPriceMinTickSize: number;
  orderMinSize: number;
  umaResolutionStatus: string;
  volumeNum: number;
  liquidityNum: number;
  endDateIso: string;
  startDateIso: string;
  hasReviewedDates: boolean;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  clobTokenIds: string; //e.g. for BTC up or down by X? YES token ID and NO token ID
  umaBond: string;
  umaReward: string;
  volume24hrClob: number;
  volume1wkClob: number;
  volume1moClob: number;
  volume1yrClob: number;
  volumeClob: number;
  liquidityClob: number;
  customLiveness: number;
  acceptingOrders: boolean;
  negRisk: boolean;
  negRiskRequestID: string;
  ready: boolean;
  funded: boolean;
  acceptingOrdersTimestamp: string;
  cyom: boolean;
  competitive: number;
  pagerDutyNotificationEnabled: boolean;
  approved: boolean;
  rewardsMinSize: number;
  rewardsMaxSpread: number;
  spread: number;
  oneDayPriceChange: number;
  oneHourPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  automaticallyActive: boolean;
  clearBookOnStart: boolean;
  showGmpSeries: boolean;
  showGmpOutcome: boolean;
  manualActivation: boolean;
  negRiskOther: boolean;
  umaResolutionStatuses: string;
  pendingDeployment: boolean;
  deploying: boolean;
  deployingTimestamp: string;
  rfqEnabled: boolean;
  eventStartTime: string;
  holdingRewardsEnabled: boolean;
}

export interface PolymarketSeries {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  seriesType: string;
  recurrence: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  featured: boolean;
  restricted: boolean;
  createdAt: string;
  updatedAt: string;
  volume: number;
  liquidity: number;
  commentCount: number;
}

export interface PolymarketTag {
  id: string;
  label: string;
  slug: string;
  forceShow: boolean;
  publishedAt?: string;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  isCarousel?: boolean;
}

export interface PolymarketSearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  status?: "open" | "closed" | "resolved";
}

export interface PolyMarketTokenHistory {
  history: {
    t: number;
    p: number;
  }[];
}

export interface PolyMarketTokenBook {
  market: string;
  asset_id: string;
  timestamp: string;
  hash: string;
  bids: {
    price: string;
    size: string;
  }[];
  asks: {
    price: string;
    size: string;
  }[];
}

export interface PolyMarketTokenPrices {
  buy: {
    Up: {
      price: string;
    };
    Down: {
      price: string;
    };
  };
  sell: {
    Up: {
      price: string;
    };
    Down: {
      price: string;
    };
  };
}

export interface PolyMarketLiveVolume {
  total: number;
  markets: [
    {
      market: string;
      value: number;
    }
  ];
}

class PolymarketService {
  private readonly clobApiUrl = "https://clob.polymarket.com";
  private readonly gammaApiUrl = "https://gamma-api.polymarket.com";
  private readonly dataApiUrl = "https://data-api.polymarket.com";

  /**
   * Get event information for a given slug
   * @param slug - The event slug (e.g., "bitcoin-up-or-down-august-29-7am-et")
   * @returns Promise<PolymarketEvent> - The event information
   */
  async getEventBySlug(slug: string): Promise<PolymarketEvent> {
    try {
      const response = await axios.get(
        `${this.gammaApiUrl}/events/slug/${slug}`,
        {
          headers: {
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch event: ${response.status} ${response.statusText}`
        );
      }

      const markets = response.data.markets;
      if (markets.length > 1) {
        console.warn("More than 1 market for event! Expected 1!!");
      }

      const liveVolume = await this.getLiveVolume(response.data.id);
      response.data.volumeLive = liveVolume;
      response.data.prices = await this.getTokenPrices(markets[0]);
      response.data.books = await this.getBooks(markets[0]);
      response.data.pricesHistory = await this.getPricesHistory(markets[0]);

      return response.data as PolymarketEvent & {
        volumeLive: PolyMarketLiveVolume;
        prices: PolyMarketTokenPrices;
        books: Record<PolymarketMarket["outcomes"], PolyMarketTokenBook>;
        pricesHistory: Record<
          PolymarketMarket["outcomes"],
          PolyMarketTokenHistory
        >;
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Event not found: ${slug}`);
        }
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getLiveVolume(eventId: number) {
    const response = await axios.get(
      `${this.dataApiUrl}/live-volume?id=${eventId}`,
      {
        headers: {
          Accept: "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data[0] as PolyMarketLiveVolume;
  }

  async getPricesHistory(market: PolymarketMarket) {
    const tokenIds = JSON.parse(market.clobTokenIds) as string[];
    const [YESTokenID, NOTokenID] = tokenIds; // TODO this only works for Y/N markets
    const outcomes = JSON.parse(market.outcomes) as string[];
    const eventStartTime = market.eventStartTime;
    const startTimestamp = new Date(eventStartTime).getTime() / 1000;
    const endDate = market.endDate;
    const endDateTimestamp = new Date(endDate).getTime() / 1000;
    const responses = {
      [outcomes[0]]: (
        await axios.get(
          `${this.clobApiUrl}/prices-history?market=${YESTokenID}&startTs=${startTimestamp}&fidelity=0.1&endTs=${endDateTimestamp}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        )
      ).data,
      [outcomes[1]]: (
        await axios.get(
          `${this.clobApiUrl}/prices-history?market=${NOTokenID}&startTs=${startTimestamp}&fidelity=0.1&endTs=${endDateTimestamp}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        )
      ).data,
    };
   
      return responses;
  }

  async getTokenPrices(market: PolymarketMarket) {
    const tokenIds = JSON.parse(market.clobTokenIds) as string[];
    const [YESTokenID, NOTokenID] = tokenIds; // TODO this only works for Y/N markets
    const outcomes = JSON.parse(market.outcomes) as string[];
    const responses = {
      buy: {
        [outcomes[0]]: (
          await axios.get(
            `${this.clobApiUrl}/price?token_id=${YESTokenID}&side=BUY`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          )
        ).data,
        [outcomes[1]]: (
          await axios.get(
            `${this.clobApiUrl}/price?token_id=${NOTokenID}&side=BUY`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          )
        ).data,
      },
      sell: {
        [outcomes[0]]: (
          await axios.get(
            `${this.clobApiUrl}/price?token_id=${YESTokenID}&side=SELL`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          )
        ).data,
        [outcomes[1]]: (
          await axios.get(
            `${this.clobApiUrl}/price?token_id=${NOTokenID}&side=SELL`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          )
        ).data,
      },
    };

    return responses;
  }

  async getBooks(market: PolymarketMarket) {
    const tokenIds = JSON.parse(market.clobTokenIds) as string[];
    const [YESTokenID, NOTokenID] = tokenIds; // TODO this only works for Y/N markets
    const outcomes = JSON.parse(market.outcomes) as string[];
    const responses = {
      [outcomes[0]]: (
        await axios.get(`${this.clobApiUrl}/book?token_id=${YESTokenID}`, {
          headers: {
            Accept: "application/json",
          },
        })
      ).data,
      [outcomes[1]]: (
        await axios.get(`${this.clobApiUrl}/book?token_id=${NOTokenID}`, {
          headers: {
            Accept: "application/json",
          },
        })
      ).data,
    };

    return responses;
  }

  /**
   * Generate BTC up/down slug for a specific date and time
   * @param month - Month name (e.g., "august", "september")
   * @param day - Day of the month (1-31)
   * @param hour - Hour in 24-hour format (0-23)
   * @returns string - The generated slug
   */
  generateBtcUpDownSlug(month: string, day: number, hour: number): string {
    // Validate inputs
    if (day < 1 || day > 31) {
      throw new Error("Day must be between 1 and 31");
    }
    if (hour < 0 || hour > 23) {
      throw new Error("Hour must be between 0 and 23");
    }

    // Convert hour to 12-hour format with AM/PM
    const period = hour >= 12 ? "pm" : "am";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    // Format the slug
    const slug = `bitcoin-up-or-down-${month.toLowerCase()}-${day}-${hour12}${period}-et`;
    return slug;
  }

  /**
   * Get BTC up/down event for a specific date and time
   * @param month - Month name (e.g., "august", "september")
   * @param day - Day of the month (1-31)
   * @param hour - Hour in 24-hour format (0-23)
   * @returns Promise<PolymarketEvent> - The event information
   */
  async getBtcUpDownEvent(
    month: string,
    day: number,
    hour: number
  ): Promise<PolymarketEvent> {
    const slug = this.generateBtcUpDownSlug(month, day, hour);
    return this.getEventBySlug(slug);
  }

  /**
   * Search markets by name with optional filters
   * @param params - Search parameters
   * @returns Promise<PolymarketEvent[]> - Array of matching events
   */
  async getMarketsByName(
    params: PolymarketSearchParams
  ): Promise<PolymarketEvent[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.query) {
        queryParams.append("query", params.query);
      }
      if (params.limit) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params.offset) {
        queryParams.append("offset", params.offset.toString());
      }
      if (params.status) {
        queryParams.append("status", params.status);
      }

      const response = await axios.get(
        `${this.gammaApiUrl}/events?${queryParams.toString()}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; Linkbase/1.0)",
          },
          timeout: 10000,
        }
      );

      if (response.status !== 200) {
        throw new Error(
          `Failed to search markets: ${response.status} ${response.statusText}`
        );
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get BTC up/down markets for a specific date and time slot
   * @param date - Date in YYYY-MM-DD format
   * @param timeSlot - Time slot (e.g., "7am", "2pm")
   * @returns Promise<PolymarketEvent[]> - Array of matching events
   */
  async getBitcoinUpDownMarkets(
    date: string,
    timeSlot: string
  ): Promise<PolymarketEvent[]> {
    try {
      // Parse the date to extract month and day
      const dateObj = new Date(date);
      const month = dateObj
        .toLocaleDateString("en-US", { month: "long" })
        .toLowerCase();
      const day = dateObj.getDate();

      // Parse time slot to extract hour
      const timeMatch = timeSlot.match(/^(\d+)(am|pm)$/i);
      if (!timeMatch) {
        throw new Error(
          "Invalid time slot format. Expected format: 7am, 2pm, etc."
        );
      }

      const hour12 = parseInt(timeMatch[1]);
      const period = timeMatch[2].toLowerCase();
      const hour24 =
        period === "pm"
          ? hour12 === 12
            ? 12
            : hour12 + 12
          : hour12 === 12
          ? 0
          : hour12;

      // Generate the slug and fetch the event
      const slug = this.generateBtcUpDownSlug(month, day, hour24);

      try {
        const event = await this.getEventBySlug(slug);
        return [event];
      } catch (error) {
        // If event not found, return empty array
        if (error instanceof Error && error.message.includes("not found")) {
          return [];
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to get Bitcoin up/down markets: ${error.message}`
        );
      }
      throw error;
    }
  }
}

// Export singleton instance
export const polymarketService = new PolymarketService();

export async function renderChartPage(
  req: Request,
  res: Response
): Promise<void> {
  await renderPage(req, res, "../services/polymarket/chart", "chart");
}
