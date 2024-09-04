const isMac = /^Mac/i.test(navigator.platform);

export const isCtrlKeyPressed = (ev: MouseEvent | KeyboardEvent) => {
	return isMac ? ev.metaKey : ev.ctrlKey;
};
