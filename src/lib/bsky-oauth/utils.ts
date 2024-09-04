export const encoder = new TextEncoder();

export const extractContentType = (headers: Headers): string | undefined => {
	return headers.get('content-type')?.split(';')[0];
};

export const toBase64Url = (input: Uint8Array): string => {
	const CHUNK_SIZE = 0x8000;
	const arr = [];

	for (let i = 0; i < input.byteLength; i += CHUNK_SIZE) {
		// @ts-expect-error
		arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
	}

	return btoa(arr.join('')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const toSha256 = async (input: string): Promise<string> => {
	const bytes = encoder.encode(input);
	const digest = await crypto.subtle.digest('SHA-256', bytes);

	return toBase64Url(new Uint8Array(digest));
};

export const randomBytes = (length: number): string => {
	return toBase64Url(crypto.getRandomValues(new Uint8Array(length)));
};

export const generateState = (): string => {
	return randomBytes(16);
};

export const generatePKCE = async (): Promise<{ verifier: string; challenge: string; method: string }> => {
	const verifier = randomBytes(32);

	return {
		verifier: verifier,
		challenge: await toSha256(verifier),
		method: 'S256',
	};
};
