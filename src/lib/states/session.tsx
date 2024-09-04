import {
	batch,
	createContext,
	createEffect,
	createRoot,
	createSignal,
	untrack,
	useContext,
	type ParentProps,
} from 'solid-js';

import { XRPC } from '@atcute/client';
import type { At } from '@atcute/client/lexicons';

import { sessions } from '~/globals/preferences';

import { OAuthServerAgent } from '../bsky-oauth/agents/server-agent';
import { getSession } from '../bsky-oauth/agents/session';
import { OAuthUserAgent } from '../bsky-oauth/agents/user-agent';
import { database } from '../bsky-oauth/globals';
import { getMetadataFromAuthorizationServer } from '../bsky-oauth/resolver';

import type { PerAccountPreferenceSchema } from '../preferences/account';
import type { AccountData } from '../preferences/sessions';

import { makeAbortable } from '../hooks/abortable';
import { createReactiveLocalStorage, isExternalWriting } from '../hooks/local-storage';
import { assert } from '../utils/invariant';

export interface CurrentAccountState {
	readonly did: At.DID;
	readonly data: AccountData;
	readonly preferences: PerAccountPreferenceSchema;

	readonly rpc: XRPC;
	readonly session: OAuthUserAgent;
	readonly _cleanup: () => void;
}

export interface SessionContext {
	readonly currentAccount: CurrentAccountState | undefined;

	getAccounts(): AccountData[];
	resumeSession(did: At.DID): Promise<void>;
	removeAccount(did: At.DID): Promise<void>;

	logout(): Promise<void>;
}

const Context = createContext<SessionContext>();

export const SessionProvider = (props: ParentProps) => {
	const [getSignal] = makeAbortable();
	const [state, _setState] = createSignal<CurrentAccountState>();

	const replaceState = (next: CurrentAccountState | undefined) => {
		_setState((prev) => {
			prev?._cleanup();
			return next;
		});
	};

	const createAccountState = (
		account: AccountData,
		session: OAuthUserAgent,
		rpc: XRPC,
	): CurrentAccountState => {
		return createRoot((cleanup): CurrentAccountState => {
			const preferences = createAccountPreferences(account.did);

			return {
				did: account.did,
				data: account,
				preferences: preferences,

				rpc: rpc,
				session: session,
				_cleanup: cleanup,
			};
		}, null);
	};

	const context: SessionContext = {
		get currentAccount() {
			return state();
		},

		getAccounts(): AccountData[] {
			return sessions.accounts;
		},
		async resumeSession(did: At.DID): Promise<void> {
			const account = sessions.accounts.find((acc) => acc.did === did);
			if (!account) {
				return;
			}

			const signal = getSignal();

			const { tokenSet, dpopKey } = await getSession(did);

			const session = new OAuthUserAgent(tokenSet, dpopKey);
			const rpc = new XRPC({ handler: session });

			signal.throwIfAborted();

			batch(() => {
				sessions.active = did;
				sessions.accounts = [account, ...sessions.accounts.filter((acc) => acc.did !== did)];

				replaceState(createAccountState(account, session, rpc));
			});
		},

		async removeAccount(did: At.DID): Promise<void> {
			const $state = untrack(state);
			const isLoggedIn = $state !== undefined && $state.did === did;

			batch(() => {
				if (isLoggedIn) {
					replaceState(undefined);
				}

				sessions.accounts = sessions.accounts.filter((acc) => acc.did !== did);
			});

			try {
				if (isLoggedIn) {
					const session = $state.session;

					await session.signOut();
				} else {
					const { dpopKey, tokenSet } = await getSession(did, false);

					const as_meta = await getMetadataFromAuthorizationServer(tokenSet.iss);
					const server = new OAuthServerAgent(as_meta, dpopKey);

					await server.revoke(tokenSet.access_token);
				}
			} finally {
				await database.sessions.delete(did);
			}
		},
		async logout(): Promise<void> {
			const $state = untrack(state);
			if ($state !== undefined) {
				return this.removeAccount($state.did);
			}
		},
	};

	createEffect(() => {
		const active = sessions.active;

		// Only run this on external changes
		if (isExternalWriting) {
			const untrackedState = untrack(state);

			if (active) {
				if (active !== untrackedState?.did) {
					// Current active account doesn't match what we have

					// Still logged in, so log out of this one
					if (untrackedState) {
						replaceState(undefined);
					}

					// Try to resume from this new account if we have it.
					context.resumeSession(active);
				}
			} else if (untrackedState) {
				// No active account yet we have a session, log out
				replaceState(undefined);
			}
		}
	});

	return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

// Safe to destructure when under <AgentProvider>
export const useSession = (): SessionContext => {
	const session = useContext(Context);
	assert(session !== undefined, `Expected useSession to be called under <SessionProvider>`);

	return session;
};

const createAccountPreferences = (did: At.DID) => {
	const key = `account-${did}`;
	return createReactiveLocalStorage<PerAccountPreferenceSchema>(key, (version, prev) => {
		if (version === 0) {
			const obj: PerAccountPreferenceSchema = {
				$version: 1,
				composer: {
					defaultPostLanguage: 'system',
					defaultReplyGate: 'everyone',
				},
			};

			return obj;
		}

		return prev;
	});
};
