import type { XRPC } from '@atcute/client';
import type {
	At,
	ComAtprotoRepoGetRecord,
	Records
} from '@atcute/client/lexicons';

type RecordType = keyof Records;

interface GetRecordOptions<K extends RecordType> {
	repo: At.DID;
	collection: K;
	rkey: string;
	cid?: string;
}

interface GetRecordOutput<T> extends ComAtprotoRepoGetRecord.Output {
	value: T;
}

export const getRecord = async <K extends RecordType>(
	rpc: XRPC,
	options: GetRecordOptions<K>,
): Promise<GetRecordOutput<Records[K]>> => {
	const { data } = await rpc.get('com.atproto.repo.getRecord', {
		params: options,
	});

	return data as any;
};
