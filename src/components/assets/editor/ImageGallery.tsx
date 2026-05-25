import { type ChangeEvent, useEffect, useRef, useState } from "react";

async function compressImage(file: File, maxWidth = 300, quality = 0.7) {
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

function ImageLightbox({ image, onClose }: { image: string; onClose: () => void }) {
	const lightboxRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const clickOutside = (event: MouseEvent) => {
			if (lightboxRef.current && !lightboxRef.current.contains(event.target as Node)) onClose();
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("mousedown", clickOutside);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("mousedown", clickOutside);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [onClose]);
	return (
		<div className="image-lightbox-overlay">
			<div className="image-lightbox" ref={lightboxRef}>
				<img src={image} alt="Full size preview" />
				<button className="lightbox-close-btn" type="button" onClick={onClose}>
					Close
				</button>
			</div>
		</div>
	);
}

export function ImageGallery({
	images,
	maxImages,
	onAdd,
	onRemove,
}: {
	images: string[];
	maxImages: number;
	onAdd: (image: string) => void;
	onRemove: (index: number) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);

	const upload = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file?.type.startsWith("image/")) onAdd(await compressImage(file));
		event.target.value = "";
	};

	return (
		<div className="image-gallery">
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				hidden
				onChange={(event) => void upload(event)}
			/>
			<div className="gallery-grid">
				{images.map((image, index) => (
					<div key={`${image.slice(0, 20)}-${index}`} className="gallery-item">
						<button
							type="button"
							className="gallery-preview"
							onClick={() => setLightboxImage(image)}
						>
							<img src={image} alt={`Visual ${index + 1}`} />
						</button>
						<button type="button" className="gallery-remove-btn" onClick={() => onRemove(index)}>
							×
						</button>
					</div>
				))}
				{images.length < maxImages && (
					<button
						type="button"
						className="gallery-add-btn"
						onClick={() => inputRef.current?.click()}
					>
						<span>+</span>
						<span>Upload</span>
					</button>
				)}
			</div>
			<span className="gallery-count">
				{images.length}/{maxImages}
			</span>
			{lightboxImage && (
				<ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
			)}
		</div>
	);
}
