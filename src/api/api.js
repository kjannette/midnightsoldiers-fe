const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_API_DEV || "http://localhost:3200"
    : process.env.REACT_APP_API_PROD || "https://www.midnightsoldiers.com:3200";

export async function postReel(reelData) {
  const data = JSON.stringify(reelData);
  try {
    const response = await fetch(`${apiUrl}/v1/accept-reel-data/:reelId`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      json: true,
      body: data,
    });
    const res = response;
    return res;
  } catch (error) {
    console.error("Error sending resp to server:", error);
  }
}
