import { safeUrlParse } from '../utils/strings';

const TRIM_HOST_RE = /^www\./;
const PATH_MAX_LENGTH = 16;

export const toShortUrl = (uri: string): string => {
	const url = safeUrlParse(uri);

	if (url !== null) {
		const host = url.host.replace(TRIM_HOST_RE, '');
		const pathname = url.pathname;

		const path = (pathname === '/' ? '' : pathname) + url.search + url.hash;

		if (path.length > PATH_MAX_LENGTH) {
			return host + path.slice(0, PATH_MAX_LENGTH - 1) + '…';
		}

		return host + path;
	}

	return uri;
};
