export const GMAIL_SEARCH_DESC = `Search the user's Gmail.
        Use Gmail search operators (from:, to:, subject:, has:attachment, after:YYYY/MM/DD).
        Returns id, from, subject, date, snippet for each match.
        IMPORTANT: \`id\` is a hex string (e.g. "196e8f2a3b4d5e6f"), never a decimal number.
        Pass it unchanged to gmail_get_message.`;

export const GMAIL_GET_MESSAGE_DESC = `Fetch the full body of a single Gmail message by id.
        The id MUST come from a gmail_search result in the CURRENT turn — never invent or guess one,
        and never reuse an id from a previous turn.
        Gmail ids are hex strings (e.g. "196e8f2a3b4d5e6f"). If you don't have a fresh id, call gmail_search first.
        Returns id, from, to, cc, subject, date, body (plain text preferred, html fallback),
        and a truncated flag if the body was clipped.`;
