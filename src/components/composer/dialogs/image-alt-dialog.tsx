import { createMemo, createSignal } from 'solid-js';

import { graphemeLen } from '~/api/richtext/intl';
import { PLAIN_WS_RE } from '~/api/richtext/parser/parse';

import { useModalContext } from '~/globals/modals';

import { convertBlobToUrl } from '~/lib/utils/blob';
import { autofocusNode, modelText } from '~/lib/utils/input-refs';

import Button from '../../button';
import * as Dialog from '../../dialog';
import Divider from '../../divider';
import CharCounterAccessory from '../../input/char-counter-accessory';
import TextareaInput from '../../textarea-input';

interface ImageAltDialogProps {
	image: Blob;
	value: string;
	onChange: (next: string) => void;
}

const ImageAltDialog = (props: ImageAltDialogProps) => {
	const { close } = useModalContext();

	const [text, setText] = createSignal(props.value);

	const length = createMemo(() => graphemeLen(text()));
	const isEqual = () => text() === props.value;

	const blobUrl = createMemo(() => {
		return convertBlobToUrl(props.image);
	});

	return (
		<>
			<Dialog.Backdrop />
			<Dialog.Container fullHeight>
				<Dialog.Header>
					<Dialog.HeaderAccessory>
						<Dialog.Close />
					</Dialog.HeaderAccessory>

					<Dialog.Heading title="Edit image description" />

					<Dialog.HeaderAccessory>
						<Button
							disabled={isEqual() || length() > 5_000}
							onClick={() => {
								close();
								props.onChange(text().replace(PLAIN_WS_RE, ''));
							}}
							variant="primary"
							size="sm"
						>
							Save
						</Button>
					</Dialog.HeaderAccessory>
				</Dialog.Header>

				<Dialog.Body unpadded class="flex flex-col">
					<div class="grow bg-contrast/sm-pressed p-4">
						<div class="h-full w-full" style={`background: url(${blobUrl()}) center/contain no-repeat`}></div>
					</div>

					<Divider />

					<div class="shrink-0 p-4 pt-3">
						<TextareaInput
							ref={(node) => {
								autofocusNode(node);
								modelText(node, text, setText);
							}}
							label="Description"
							minRows={2}
							maxRows={6}
							headerAccessory={<CharCounterAccessory value={length()} max={5_000} />}
						/>
					</div>
				</Dialog.Body>
			</Dialog.Container>
		</>
	);
};

export default ImageAltDialog;
