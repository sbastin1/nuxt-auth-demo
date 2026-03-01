export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  return {
    sensitive: "This is a protected Page, only available to logged in users.",
  };
});
