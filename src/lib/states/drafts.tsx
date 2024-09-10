import { type IDBPDatabase, openDB } from 'idb';
import { type ParentProps, createContext, onCleanup, useContext } from 'solid-js';

import type { DraftsDBSchema } from '../aglais-drafts';
import { assert } from '../utils/invariant';

import { useSession } from './session';

interface DraftsContext {
	open(): Promise<IDBPDatabase<DraftsDBSchema>>;
}

const Context = createContext<DraftsContext>();

export const DraftsProvider = (props: ParentProps) => {
	const { currentAccount } = useSession();

	let promise: Promise<IDBPDatabase<DraftsDBSchema>> | undefined;
	const context: DraftsContext = {
		open(): Promise<IDBPDatabase<DraftsDBSchema>> {
			if (promise !== undefined) {
				return promise;
			}

			assert(currentAccount !== undefined);

			return (promise = (async (): Promise<IDBPDatabase<DraftsDBSchema>> => {
				const db = await openDB<DraftsDBSchema>(`drafts-${currentAccount.did}`, 1, {
					async upgrade(db, oldVersion) {
						if (oldVersion < 1) {
							db.createObjectStore('drafts', { keyPath: 'id' });
						}
					},
				});

				return db;
			})());
		},
	};

	onCleanup(() => {
		if (!promise) {
			return;
		}

		const held = promise;
		promise = undefined;

		held.then((db) => db.close());
	});

	return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export const useDrafts = (): DraftsContext => {
	const drafts = useContext(Context);
	assert(drafts !== undefined, `Expected useDrafts to be used under <DraftsProvider>`);

	return drafts;
};
