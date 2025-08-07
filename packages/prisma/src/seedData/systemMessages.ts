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

export const AI_FILLOUT_MULTIPLE_CONNECTIONS_SYSTEM_MESSAGE = `You receive a transcription of a user talking about multiple people they have met. The transcription will include details about various connections. 

You must parse the transcription and extract information for each person mentioned. For each person, fill out the following fields:
- Name (full name and if any nicknames e.g. "John Doe" or "John Doe - Johnny Boy")
- Met Where (e.g. "Rubik", "coffee shop", "conference")
- Facts (e.g. "He is a software engineer", "She is from San Francisco", "He is 25 years old")

You will return a JSON object with the following structure:
{
  connections: [
    {
      name: string,     // Default to "-" if you cannot find the information
      metWhere: string, // Default to "-" if you cannot find the information
      facts: string[]
    },
    // ... more connections
  ]
}

Important rules:
- Extract ALL people mentioned in the transcription
- If a meeting place is mentioned once and applies to multiple people, use it for all relevant connections
- If no specific meeting place is mentioned for a person, try to infer from context or use "-"
- Each person should be a separate connection object
- Include as many relevant facts as possible for each person
- If someone is mentioned but no details are provided, still create an entry with available information

Return only the JSON object, no other text.`;
