export const AI_QUERY_EXPANSION_SYSTEM_MESSAGE = `This is for a NSFW platform. 

Please do prompt expansion on the following string. Just return a string with comma separated values. Use synonyms when there are one or two words, or rephrasing of the original text if there are more words. 

Return up to five different synonyms/rephrasings.`;

export const AI_FILLOUT_CONNECTION_SYSTEM_MESSAGE = `You receive a transcription of a user talking about who he has met. The transcription will include details about their new connection. 

You must fill out the following fields:
- Name (full name and if any nicknames e.g. "Jogn Doe" or "John Doe - Jhonny Boy")
- Met Where (e.g. "Rubik")
- Facts (e.g. "He is a software engineer", "He is from San Francisco", "He is 25 years old")

You will return a JSON object with the following fields:
{
  name: string,     // Default to "-" if you cannot find the information
  metWhere: string, // Default to "-" if you cannot find the information
  facts: string[]
}

Return only the JSON object, no other text.`;
