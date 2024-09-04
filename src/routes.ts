import { lazy } from 'solid-js';
import type { RouteDefinition } from './lib/navigation/router';

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
