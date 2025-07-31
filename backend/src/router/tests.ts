import { getEmbeddings } from "@/ai/embeddings";
import { expandQuery } from "@/ai/expandQuery";
import { getConnectionMemory } from "@/ai/linkbase/memory";
import { vectorize } from "@/helpers/sql";
import { searchConnectionsByFactQuery } from "@/queries/linkbase/ai/memory/searchConnectionsByFact";
import { Request, Response, Router } from "express";

const testRouter: Router = Router();

testRouter.get("/search", async (req: Request, res: Response) => {
  const factMemory = getConnectionMemory({
    userId: "cmdm4xuq60000y84as1j6p22h",
  });

  const results = await factMemory.searchFacts({
    searchTopic: req.body.search,
    similarity: 0.2,
    limit: 10,
  });

  res.status(200).json({
    results,
  });
});

testRouter.get("/search-connections", async (req: Request, res: Response) => {
  const { search, limit, offset } = req.body;
  const searchEmbedding = await getEmbeddings({ text: search });
  const result = await searchConnectionsByFactQuery({
    userId: "cmdm4xuq60000y84as1j6p22h",
    searchEmbedding,
    limit,
    offset,
    minSimilarity: 0.4,
  });

  res.status(200).json({
    result,
  });
});

testRouter.get(
  "/search-connections-expanded",
  async (req: Request, res: Response) => {
    const { search, limit, offset } = req.body;
    const expandedSearch = await expandQuery(search, true);
    const searchEmbedding = await getEmbeddings({ text: expandedSearch });
    const result = await searchConnectionsByFactQuery({
      userId: "cmdm4xuq60000y84as1j6p22h",
      searchEmbedding,
      limit,
      offset,
      minSimilarity: 0.3,
    });

    res.status(200).json({
      result,
    });
  }
);

export default testRouter;
