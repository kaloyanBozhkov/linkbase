import { getOpenAISFWInstance } from "@/ai/openai";
import { AI_EMBEDDINGS_DIMENSIONS, OpenAIEmbeddingsModel } from "./constants";
import { getCachedEmbedding } from "@/queries/ai/embeddings/getCachedEmbedding";
import { createCachedEmbedding } from "@/queries/ai/embeddings/createCachedEmbedding";
import { getManyCachedEmbeddings } from "@/queries/ai/embeddings/getManyCachedEmbeddings";

export const generateVectorEmbeddings = async (
  text: string,
  {
    model = OpenAIEmbeddingsModel.TEXT_EMBEDDING_3_SMALL,
  }: { model?: OpenAIEmbeddingsModel } = {}
) => {
  const result = await getOpenAISFWInstance().embeddings.create({
    model,
    input: text,
    dimensions: AI_EMBEDDINGS_DIMENSIONS,
  });

  return result;
};

export type TextEmbedding = {
  text: string;
  embedding: number[];
  isFresh: boolean; // was it pulled from cache or freshly generated?
  cachedEmbeddingId: string;
};

export async function getEmbeddings({
  text,
}: {
  text: string;
}): Promise<TextEmbedding> {
  const existingEmbedding = await getCachedEmbedding(text);
  if (existingEmbedding) {
    return formatEmbeddings([existingEmbedding], false)[0];
  }

  const result = await generateVectorEmbeddings(text);
  const embedding = result.data[0].embedding;
  const cachedEmbedding = await createCachedEmbedding(text, embedding);
  return formatEmbeddings([cachedEmbedding], true)[0];
}

export async function getManyEmbeddings({ texts }: { texts: string[] }) {
  const existingEmbeddings = await getManyCachedEmbeddings(texts);
  const textsToEmbed = texts.filter((text) => {
    const existingEmbedding = existingEmbeddings.find(
      (embedding) => embedding.text === text
    );
    return !existingEmbedding;
  });

  const newEmbeddings: Awaited<ReturnType<typeof getManyCachedEmbeddings>> = [];
  for (const text of textsToEmbed) {
    const result = await generateVectorEmbeddings(text);
    const embedding = result.data[0].embedding;
    const cachedEmbedding = await createCachedEmbedding(text, embedding);
    newEmbeddings.push(cachedEmbedding);
  }

  return sortEmbeddings(
    [
      ...formatEmbeddings(newEmbeddings, true),
      ...formatEmbeddings(existingEmbeddings, false),
    ],
    texts
  );
}

// ensure the embeddings are sorted by the order of the texts, assists when these are used for e.g. search results
const sortEmbeddings = (embeddings: TextEmbedding[], texts: string[]) =>
  embeddings.sort((a, b) => texts.indexOf(a.text) - texts.indexOf(b.text));

const formatEmbeddings = (
  rawEmbeddings: Array<{
    id: string;
    embedding: number[];
    text: string;
  }>,
  isFresh = false
): TextEmbedding[] =>
  rawEmbeddings.map((e) => ({
    embedding: e.embedding,
    text: e.text,
    isFresh,
    cachedEmbeddingId: e.id,
  }));
