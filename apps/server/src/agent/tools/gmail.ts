import { tool } from '@langchain/core/tools';
import { GMAIL_GET_MESSAGE_DESC, GMAIL_SEARCH_DESC } from '../const/toolsDescription';
import z from 'zod';
import { NotConnectedError } from '../client/error';
import { getGmailClient } from '../client/googleClient';
import { gmail_v1 } from 'googleapis';

const collectPart = (
    part: gmail_v1.Schema$MessagePart | undefined | null,
    mime: string,
    out: string[],
) => {
    if (!part) return;
    if (part.mimeType === mime && part.body?.data) {
        out.push(Buffer.from(part.body.data, 'base64url').toString('utf-8'));
    }
    part.parts?.forEach((p) => collectPart(p, mime, out));
};

const extractBody = (payload: gmail_v1.Schema$MessagePart | undefined | null): string => {
    if (!payload) return '';
    const plain: string[] = [];
    collectPart(payload, 'text/plain', plain);
    if (plain.length) return plain.join('\n');
    const html: string[] = [];
    collectPart(payload, 'text/html', html);
    return html.join('\n');
};

const headerValue = (
    headers: gmail_v1.Schema$MessagePartHeader[] | undefined | null,
    name: string,
): string => headers?.find((x) => x.name?.toLowerCase() === name.toLocaleLowerCase())?.value ?? '';

export const buildGmailTools = (userId: string) => {
    const gmailSearch = tool(
        async ({ query, maxResults }) => {
            try {
                const gmail = await getGmailClient(userId);
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
                        const h = (name: string) => headerValue(headers, name);
                        return {
                            id: msg.data.id,
                            from: h('From'),
                            subject: h('Subject'),
                            date: h('Date'),
                            snippet: msg.data.snippet ?? '',
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
                query: z.string().describe('Gmail Search e.g. "from: alice@x.com subject:invoice"'),

                maxResults: z
                    .number()
                    .int()
                    .min(1)
                    .max(20)
                    .default(10)
                    .describe('How many messages to return (1-20)'),
            }),
        },
    );

    const gmailGetMessage = tool(
        async ({ id }) => {
            try {
                const gmail = await getGmailClient(userId);
                const { data } = await gmail.users.messages.get({
                    userId: 'me',
                    id,
                    format: 'full',
                });

                const headers = data.payload?.headers ?? [];
                const h = (name: string) => headerValue(headers, name);
                const body = extractBody(data.payload);
                const MAX = 8000;
                const truncated = body.length > MAX;

                return JSON.stringify({
                    id: data.id,
                    from: h('From'),
                    date: h('Date'),
                    to: h('To'),
                    cc: h('Cc'),
                    subject: h('Subject'),
                    body: truncated ? body.slice(0, MAX) : body,
                    truncated,
                });
            } catch (error) {
                if (error instanceof NotConnectedError) {
                    return JSON.stringify({
                        error: 'not_connected',
                        provider: 'google',
                        message: 'User has not connected gmail. Ask them to link',
                    });
                }
                console.error('gmail.get_message', error);
                return JSON.stringify({ error: 'tool_failed', message: 'Gmail get tool failed' });
            }
        },
        {
            name: 'gmail_get_message',
            description: GMAIL_GET_MESSAGE_DESC,
            schema: z.object({
                id: z.string().describe('The Gmail message id (from gmail_search results)'),
            }),
        },
    );

    return [gmailSearch, gmailGetMessage];
};
