import type { At } from '@atcute/client/lexicons';

import { assert } from '~/lib/utils/invariant';

export const isDid = (value: string): value is At.DID => {
	return value.startsWith('did:');
};

const ATURI_RE =
	/^at:\/\/(did:[a-zA-Z0-9._:%-]+|[a-zA-Z0-9-.]+)\/([a-zA-Z0-9-.]+)\/([a-zA-Z0-9._~:@!$&%')(*+,;=-]+)(?:#(\/[a-zA-Z0-9._~:@!$&%')(*+,;=\-[\]/\\]*))?$/;

interface AtUri {
	repo: string;
	collection: string;
	rkey: string;
	fragment: string | undefined;
}

export const parseAtUri = (str: string): AtUri => {
	const match = ATURI_RE.exec(str);
	assert(match !== null, `Failed to parse AT URI for ${str}`);

	return {
		repo: match[1] as At.DID,
		collection: match[2],
		rkey: match[3],
		fragment: match[4],
	};
};

const _parse = URL.parse;

// Check for the existence of URL.parse and use that if available, removes the
// performance hit from try..catch blocks.
export const safeUrlParse = _parse
	? (text: string): URL | null => {
			const url = _parse(text);

			if (url !== null && (url.protocol === 'https:' || url.protocol === 'http:')) {
				return url;
			}

			return null;
		}
	: (text: string): URL | null => {
			try {
				const url = new URL(text);

				if (url.protocol === 'https:' || url.protocol === 'http:') {
					return url;
				}
			} catch {}

			return null;
		};
