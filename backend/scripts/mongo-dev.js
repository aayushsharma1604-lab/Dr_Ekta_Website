/**
 * Dev helper: runs an in-memory MongoDB on localhost:27017 so the backend
 * can run locally without a service installation.
 *
 * Usage: node scripts/mongo-dev.js
 * Note: data is not persisted across restarts (dev only).
 */
const { MongoMemoryServer } = require("mongodb-memory-server");

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, ip: "127.0.0.1", dbName: "dr_ekta_db" },
  });
  const uri = mongod.getUri();
  console.log(`[mongo-dev] running at ${uri}`);
  process.on("SIGINT", async () => {
    await mongod.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[mongo-dev] failed:", err);
  process.exit(1);
});
