import { type ChangeEvent, useRef } from "react";

async function compressImage(file: File, maxWidth = 400, quality = 0.8) {
	const dataUrl = await new Promise<string>((resolve) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.readAsDataURL(file);
	});
	const image = await new Promise<HTMLImageElement>((resolve) => {
		const element = new Image();
		element.onload = () => resolve(element);
		element.src = dataUrl;
	});
	const scale = Math.min(1, maxWidth / image.width);
	const canvas = document.createElement("canvas");
	canvas.width = image.width * scale;
	canvas.height = image.height * scale;
	canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL("image/jpeg", quality);
}

export function LogoUpload({
	logo,
	onUpload,
}: {
	logo: string | null;
	onUpload: (logo: string) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file?.type.startsWith("image/")) {
			onUpload(await compressImage(file));
		}
		event.target.value = "";
	};

	return (
		<button className="logo-card" type="button" onClick={() => inputRef.current?.click()}>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				onChange={(event) => void handleFileChange(event)}
				hidden
			/>
			{logo ? (
				<img src={logo} alt="Brand Logo" className="logo-image" />
			) : (
				<span className="logo-placeholder">+</span>
			)}
			<span className="card-edit-icon">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
				</svg>
			</span>
		</button>
	);
}
