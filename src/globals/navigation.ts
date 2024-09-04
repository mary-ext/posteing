import { createBrowserHistory } from '~/lib/navigation/history';
import { createHistoryLogger } from '~/lib/navigation/logger';

export const history = createBrowserHistory();
export const logger = createHistoryLogger(history);
