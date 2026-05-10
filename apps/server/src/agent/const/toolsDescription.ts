export const GMAIL_SEARCH_DESC = `Search the user's Gmail.
        Use Gmail search operators (from:, to:, subject:, has:attachment, after:YYYY/MM/DD).
        Returns id, from, subject, date, snippet for each match.`;

export const GMAIL_GET_MESSAGE_DESC = `Fetch the full body of a single Gmail message by id (use ids from gmail_search).
        Returns id, from, to, cc, subject, date, body (plain text preferred, html fallback),
        and a truncated flag if the body was clipped.`;
