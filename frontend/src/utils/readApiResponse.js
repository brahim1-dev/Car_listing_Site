const invalidResponseMessage = (response, reason) =>
  `The listing server returned ${reason} (HTTP ${response.status}). Check the backend terminal and database connection. If this happened while creating a listing, check your profile before trying again.`

export const readApiResponse = async (response) => {
  const responseText = await response.text()
  if (!responseText.trim()) {
    throw new Error(invalidResponseMessage(response, "an empty response"))
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw new Error(invalidResponseMessage(response, "an invalid response"))
  }
}
