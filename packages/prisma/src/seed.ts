import { prisma, ai_feature } from ".";
import { AI_QUERY_EXPANSION_SYSTEM_MESSAGE } from "./seedData/systemMessages";

async function main() {
  console.info("Starting to seed");
  await prisma.ai_system_message.createMany({
    data: [
      {
        ai_feature: ai_feature.QUERY_EXPANSION,
        system_message: AI_QUERY_EXPANSION_SYSTEM_MESSAGE,
      },
    ],
  });
  console.info("Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
