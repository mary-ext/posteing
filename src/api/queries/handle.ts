import { XRPC } from '@atcute/client';

export const resolveHandle = async (rpc: XRPC, handle: string, signal?: AbortSignal) => {
	const { data } = await rpc.get('com.atproto.identity.resolveHandle', {
		signal: signal,
		params: {
			handle: handle,
		},
	});

	return data.did;
};
