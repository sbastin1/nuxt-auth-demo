export default defineEventHandler(async () => {
  const db = useDb();
  return db.query.user.findMany();
});
