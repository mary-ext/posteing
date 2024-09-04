import { safeUrlParse } from '../../utils/strings';

import { graphemeLen } from '../intl';
import { toShortUrl } from '../url';

export interface TextPreliminarySegment {
	type: 'text';
	raw: string;
	text: string;
}

export interface EscapePreliminarySegment {
	type: 'escape';
	raw: string;
	text: string;
}

export interface LinkPreliminarySegment {
	type: 'link';
	raw: string;
	text: string;
	uri: string;
}

export interface MdLinkPreliminarySegment {
	type: 'mdlink';
	raw: [_0: string, label: string, _1: string, uri: string, _2: string];
	text: string;
	uri: string;
	valid: boolean;
}

export interface MentionPreliminarySegment {
	type: 'mention';
	raw: string;
	text: string;
	handle: string;
}

export interface TagPreliminarySegment {
	type: 'tag';
	raw: string;
	text: string;
	tag: string;
}

export interface EmotePreliminarySegment {
	type: 'emote';
	raw: string;
	text: string;
	name: string;
}

export type PreliminarySegment =
	| EmotePreliminarySegment
	| EscapePreliminarySegment
	| LinkPreliminarySegment
	| MdLinkPreliminarySegment
	| MentionPreliminarySegment
	| TagPreliminarySegment
	| TextPreliminarySegment;

export interface PreliminaryRichText {
	source: string;
	text: string;
	length: number;
	segments: PreliminarySegment[];
	links: string[];
}

const enum CharCode {
	ESCAPE = 92,

	AT = 64,
	TAG = 35,

	OSQUARE = 91,
	ESQUARE = 93,
	OPAREN = 40,
	EPAREN = 41,

	NEWLINE = 10,
	SPACE = 32,

	COLON = 58,
	FSLASH = 47,

	COMMA = 44,
	DOT = 46,
	SEMICOLON = 59,
	DQUOTE = 34,
	SQUOTE = 39,
	DASH = 45,
	UNDERSCORE = 95,

	LOWER_A = 97,
	LOWER_H = 104,
	LOWER_P = 112,
	LOWER_S = 115,
	LOWER_T = 116,
	LOWER_Z = 122,
	UPPER_A = 65,
	UPPER_Z = 90,
}

const WS_RE = / +(?=\n)|\n(?=(?: *\n){2} *)/g;
export const EOF_WS_RE = /\s+$| +(?=\n)|\n(?=(?: *\n){2}) */g;

export const PLAIN_WS_RE = /^\s+|\s+$| +(?=\n)|\n(?=(?: *\n){2}) */g;

const MENTION_RE = /[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,})(@)?/y;
const HASHTAG_RE = /(?!\ufe0f|\u20e3)[\p{N}]*[\p{L}\p{M}\p{Pc}][\p{L}\p{M}\p{Pc}\p{N}]*(#)?/uy;

const ESCAPE_SEGMENT: EscapePreliminarySegment = { type: 'escape', raw: '\\', text: '' };

const charCodeAt = String.prototype.charCodeAt;

export const parseRt = (source: string): PreliminaryRichText => {
	const segments: PreliminarySegment[] = [];
	const links: string[] = [];

	const c = charCodeAt.bind(source);

	let tmp: number;
	let secure: boolean = false;

	for (let idx = 0, len = source.length; idx < len; ) {
		const look = c(idx);

		jump: if (look === CharCode.AT) {
			MENTION_RE.lastIndex = idx + 1;
			const match = MENTION_RE.exec(source);

			if (!match || match[1]) {
				break jump;
			}

			const handle = match[0];
			const raw = '@' + handle;

			idx = idx + 1 + handle.length;
			segments.push({ type: 'mention', raw: raw, text: raw, handle: handle });

			break jump;
		} else if (look === CharCode.TAG) {
			HASHTAG_RE.lastIndex = idx + 1;
			const match = HASHTAG_RE.exec(source);

			if (!match || match[1]) {
				break jump;
			}

			const tag = match[0];
			const raw = '#' + tag;

			idx = idx + 1 + tag.length;
			segments.push({ type: 'tag', raw: raw, text: raw, tag: tag });

			break jump;
		} else if (look === CharCode.OSQUARE) {
			let textStart = idx + 1;
			let textEnd = textStart;
			let text = '';
			let textRaw = '';

			{
				let flushed = textStart;

				// Loop until we find ]
				for (; textEnd < len; textEnd++) {
					const char = c(textEnd);

					if (char === CharCode.ESQUARE) {
						break;
					} else if (char === CharCode.ESCAPE) {
						const next = c(textEnd + 1);

						if (next === CharCode.ESQUARE || next === CharCode.ESCAPE) {
							textRaw += source.slice(flushed, textEnd + 1);
							text += source.slice(flushed, textEnd);

							textEnd = flushed = textEnd + 1;
							continue;
						}
					}
				}

				// Check if the next characters are ] and (
				if (c(textEnd) !== CharCode.ESQUARE || c(textEnd + 1) !== CharCode.OPAREN) {
					break jump;
				}

				textRaw += source.slice(flushed, textEnd);
				text += source.slice(flushed, textEnd);
			}

			// Account for ] and (
			let urlStart = textEnd + 2;
			let urlEnd = urlStart;
			let url = '';
			let urlRaw = '';

			{
				let flushed = urlStart;

				// Loop until we find )
				for (; urlEnd < len; urlEnd++) {
					const char = c(urlEnd);

					if (char === CharCode.EPAREN) {
						break;
					} else if (char === CharCode.ESCAPE) {
						const next = c(urlEnd + 1);

						if (next === CharCode.EPAREN || next === CharCode.ESCAPE) {
							urlRaw += source.slice(flushed, urlEnd + 1);
							url += source.slice(flushed, urlEnd);

							urlEnd = flushed = urlEnd + 1;
							continue;
						}
					}
				}

				// Check if the next characters are ] and (
				if (c(urlEnd) !== CharCode.EPAREN) {
					break jump;
				}

				urlRaw += source.slice(flushed, urlEnd);
				url += source.slice(flushed, urlEnd);
			}

			const urlp = safeUrlParse(url);

			idx = urlEnd + 1;

			segments.push({
				type: 'mdlink',
				raw: ['[', textRaw, '](', urlRaw, ')'],
				text: text,
				uri: url,
				valid: urlp !== null,
			});

			if (urlp) {
				links.push(urlp.href);
			}

			continue;
		} else if (look === CharCode.COLON) {
			let nameStart = idx + 1;
			let nameEnd = nameStart;

			for (; nameEnd < len; nameEnd++) {
				const char = c(nameEnd);

				if (
					!(
						(char >= CharCode.LOWER_A && char <= CharCode.LOWER_Z) ||
						(char >= CharCode.UPPER_A && char <= CharCode.UPPER_Z) ||
						char === CharCode.DASH ||
						char === CharCode.UNDERSCORE
					)
				) {
					break;
				}
			}

			if (c(nameEnd) !== CharCode.COLON) {
				break jump;
			}

			const name = source.slice(nameStart, nameEnd);
			const raw = ':' + name + ':';

			idx = nameEnd + 1;

			segments.push({
				type: 'emote',
				name: name,
				text: '◌',
				raw: raw,
			});
			continue;
		} else if (look === CharCode.ESCAPE) {
			const next = c(idx + 1);

			if (
				next === CharCode.AT ||
				next === CharCode.COLON ||
				next === CharCode.ESCAPE ||
				next === CharCode.OSQUARE ||
				next === CharCode.TAG
			) {
				const ch = source.charAt(idx + 1);

				segments.push(ESCAPE_SEGMENT);
				segments.push({ type: 'text', raw: ch, text: ch });

				idx += 2;
				continue;
			}
		}

		jump: {
			let end = idx + 1;

			for (; end < len; end++) {
				const char = c(end);

				// Auto-link detection
				if (
					char === CharCode.COLON &&
					// we have 3 succeeding characters, beware that end is still on colon
					len - end >= 3 + 1 &&
					// the first two is //
					c(end + 1) === CharCode.FSLASH &&
					c(end + 2) === CharCode.FSLASH &&
					// the third is not a whitespace
					(tmp = c(end + 3)) !== CharCode.SPACE &&
					tmp !== CharCode.NEWLINE &&
					// either:
					// we have 5 preceeding characters
					((secure =
						end - idx >= 5 &&
						// the 5 characters are `https` (reverse-order)
						c(end - 1) === CharCode.LOWER_S &&
						c(end - 2) === CharCode.LOWER_P &&
						c(end - 3) === CharCode.LOWER_T &&
						c(end - 4) === CharCode.LOWER_T &&
						c(end - 5) === CharCode.LOWER_H) ||
						// or, we have 4 preceeding characters
						(end - idx >= 4 &&
							// the 4 characters are `http` (reverse-order)
							c(end - 1) === CharCode.LOWER_P &&
							c(end - 2) === CharCode.LOWER_T &&
							c(end - 3) === CharCode.LOWER_T &&
							c(end - 4) === CharCode.LOWER_H))
				) {
					const start = end - (secure ? 5 : 4);
					let hasParen = false;

					// Consume the :// we just had above
					end = end + 3;

					// Iterate until we get a whitespace character
					for (; end < len; end++) {
						const char = c(end);

						if (char === CharCode.SPACE || char === CharCode.NEWLINE) {
							break;
						} else if (char === CharCode.OPAREN) {
							// We want to avoid trimming the closing parenthesis
							hasParen = true;
						}
					}

					// Trim the URL
					for (; end >= start; end--) {
						const char = c(end - 1);

						// If we encounter any of these punctuations, save it and continue
						if (
							/* dot */ char === 0x2e ||
							/* comma */ char === 0x2c ||
							/* semicolon */ char === 0x3b ||
							/* double quote */ char === 0x22 ||
							/* single quote */ char === 0x27
						) {
							continue;
						}

						// If we encounter a closing paren, save it but break out of the loop
						if (!hasParen && char === CharCode.EPAREN) {
							end--;
						}

						// Otherwise, break out of the loop
						break;
					}

					if (start > idx) {
						const raw = source.slice(idx, start);
						const text = raw.replace(WS_RE, '');

						segments.push({ type: 'text', raw: raw, text: text });
					}

					{
						const raw = source.slice(start, end);

						idx = end;
						segments.push({ type: 'link', raw: raw, text: toShortUrl(raw), uri: raw });
						links.push(raw);
					}

					if (idx === len) {
						break jump;
					}

					continue;
				}

				if (char === CharCode.ESCAPE || char === CharCode.OSQUARE || char === CharCode.COLON) {
					break;
				}

				if (char === CharCode.AT || char === CharCode.TAG) {
					const prev = c(end - 1);

					if (prev !== CharCode.SPACE && prev !== CharCode.NEWLINE && prev !== CharCode.OPAREN) {
						continue;
					}

					break;
				}
			}

			const raw = source.slice(idx, end);
			const text = raw.replace(end === len ? EOF_WS_RE : WS_RE, '');

			idx = end;
			segments.push({ type: 'text', raw: raw, text: text });

			continue;
		}
	}

	let text = '';
	for (let idx = 0, len = segments.length; idx < len; idx++) {
		const segment = segments[idx];
		text += segment.text;
	}

	return {
		source: source,
		text: text,
		length: graphemeLen(text),
		segments: segments,
		links: links,
	};
};

export const getRtText = (rt: PreliminaryRichText): string => {
	const segments = rt.segments;
	let str = '';

	for (let i = 0, ilen = segments.length; i < ilen; i++) {
		const segment = segments[i];
		str += segment.text;
	}

	return str;
};

export const getRtGraphemeLength = (rt: PreliminaryRichText): number => {
	return graphemeLen(getRtText(rt));
};
