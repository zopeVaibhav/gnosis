import { tool } from '@langchain/core/tools';
import { GMAIL_SEARCH_DESC } from '../const/toolsDescription';
import z from 'zod';
import { NotConnectedError } from '../client/error';
import { googleClient } from '../client/googleClient';
import { google } from 'googleapis';

export const buildGmailTools = (userId: string) => {
    const gmailSearch = tool(
        async ({ query, maxResults }) => {
            try {
                const auth = await googleClient(userId);
                const gmail = google.gmail({
                    version: 'v1',
                    auth,
                });

                const list = await gmail.users.messages.list({
                    userId: 'me',
                    q: query,
                    maxResults,
                });

                const ids = list.data.messages ?? [];
                if (ids.length === 0) return JSON.stringify({ results: [] });

                const messages = await Promise.all(
                    ids.map(async ({ id }) => {
                        const msg = await gmail.users.messages.get({
                            userId: 'me',
                            id: id!,
                            format: 'metadata',
                            metadataHeaders: ['From', 'Subject', 'Date'],
                        });
                        const headers = msg.data.payload?.headers ?? [];
                        const h = (name: string) =>
                            headers.find((x) => x.name === name)?.value ?? '';
                        return {
                            id: msg.data.id,
                            from: h('From'),
                            subject: h('Subject'),
                            date: h('Date'),
                            snipped: msg.data.snippet ?? '',
                        };
                    }),
                );
                return JSON.stringify({ results: messages });
            } catch (error) {
                if (error instanceof NotConnectedError) {
                    return JSON.stringify({
                        error: 'not_connected',
                        provider: 'google',
                        message: 'User has not connected gmail. Ask them to link Google',
                    });
                }
                console.error('gmail.search', error);
                return JSON.stringify({ error: 'tool_failed', message: 'Gmail search Failed' });
            }
        },
        {
            name: 'gmail_search',
            description: GMAIL_SEARCH_DESC,
            schema: z.object({
                query: z.string().describe('Gamil Search e.g. "from: alice@x.com subject: invoice'),

                maxResults: z
                    .number()
                    .int()
                    .min(1)
                    .max(20)
                    .default(10)
                    .describe('How many messages to reutrn (1-20)'),
            }),
        },
    );
    return [gmailSearch];
};
