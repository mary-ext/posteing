import { lazy } from 'solid-js';
import type { RouteDefinition } from './lib/navigation/router';

const DID_RE = /^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/;
const DID_OR_HANDLE_RE =
	/^(?:did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,}))$/;

const TID_RE = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;

const isValidDid = (str: string | undefined): boolean => {
	return str !== undefined && DID_RE.test(str);
};
const isValidDidOrHandle = (str: string | undefined): boolean => {
	return str !== undefined && DID_OR_HANDLE_RE.test(str);
};
const isValidTid = (str: string | undefined): boolean => {
	return str !== undefined && str.length === 13 && TID_RE.test(str);
};
const isValidBookmarkTagId = (str: string | undefined) => {
	return str === 'all' || isValidTid(str);
};

const routes: RouteDefinition[] = [
	{
		path: '/oauth/callback',
		component: lazy(() => import('./views/oauth-callback')),
		meta: {
			public: true,
		},
	},

	{
		path: '/',
		component: lazy(() => import('./views/home')),
	},
	{
		path: '*',
		component: lazy(() => import('./views/not-found')),
		meta: {
			public: true,
		},
	},
];

export default routes;
