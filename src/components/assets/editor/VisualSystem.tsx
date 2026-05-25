import { type ChangeEvent, useRef, useState } from "react";
import type { VisualSystemData } from "../types";
import "./EditorParts.css";

interface PresetStyle {
	id: string;
	image: string;
	isCustom?: false;
	name: string;
}

const APPEARANCE_OPTIONS: PresetStyle[] = [
	{ id: "clean-minimal", name: "Clean Minimal", image: "/clean-minimal.jpg" },
	{ id: "gradient", name: "Gradient", image: "/gradient.jpg" },
	{ id: "frosted-glass", name: "Frosted Glass", image: "/frosted-glass.jpg" },
	{ id: "retro-grain", name: "Retro Grain", image: "/retro-grain.jpg" },
	{ id: "3d-volume", name: "3D Volume", image: "/3d-volume.jpg" },
];

type CustomStyle = NonNullable<VisualSystemData["customStyles"]>[number];

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

export function VisualSystem({
	data,
	onChange,
}: {
	data: VisualSystemData;
	onChange: (updates: Partial<VisualSystemData>) => void;
}) {
	const customStyles = data.customStyles ?? [];
	const [showModal, setShowModal] = useState(false);
	const [editingStyle, setEditingStyle] = useState<CustomStyle | null>(null);
	const [modalName, setModalName] = useState("");
	const [modalImage, setModalImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const styles: Array<PresetStyle | CustomStyle> = [...APPEARANCE_OPTIONS, ...customStyles];

	const addStyle = () => {
		setEditingStyle(null);
		setModalName("");
		setModalImage(null);
		setShowModal(true);
	};

	const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file?.type.startsWith("image/")) setModalImage(await compressImage(file));
		event.target.value = "";
	};

	const applyStyle = () => {
		if (!modalName.trim() || !modalImage) return;
		if (editingStyle) {
			onChange({
				customStyles: customStyles.map((style) =>
					style.id === editingStyle.id
						? { ...style, name: modalName.trim(), image: modalImage }
						: style,
				),
			});
		} else {
			const style: CustomStyle = {
				id: `custom-${Date.now()}`,
				image: modalImage,
				isCustom: true,
				name: modalName.trim(),
			};
			onChange({ baseAppearance: style.id, customStyles: [...customStyles, style] });
		}
		setShowModal(false);
	};

	return (
		<div className="visual-system">
			<h3 className="section-label">Visual System</h3>
			<div className="field-group">
				<span className="field-label">Base Appearance</span>
				<div className="appearance-grid">
					{styles.map((option) => (
						<button
							key={option.id}
							type="button"
							className={`appearance-option ${data.baseAppearance === option.id ? "active" : ""}`}
							onClick={() => onChange({ baseAppearance: option.id })}
						>
							<span className="appearance-thumbnail">
								<img src={option.image} alt={option.name} className="custom-thumbnail-img" />
							</span>
							<span className="appearance-name">{option.name}</span>
							{option.isCustom === true && (
								<span className="custom-style-actions">
									<button
										className="style-action-btn edit"
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											setEditingStyle(option);
											setModalName(option.name);
											setModalImage(option.image);
											setShowModal(true);
										}}
									>
										Edit
									</button>
									<button
										className="style-action-btn delete"
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											const remaining = customStyles.filter((style) => style.id !== option.id);
											onChange({
												customStyles: remaining,
												baseAppearance:
													data.baseAppearance === option.id ? "clean-minimal" : data.baseAppearance,
											});
										}}
									>
										×
									</button>
								</span>
							)}
						</button>
					))}
					{customStyles.length === 0 && (
						<button className="appearance-option add-style-btn" type="button" onClick={addStyle}>
							<span className="appearance-thumbnail add-thumbnail">+</span>
							<span className="appearance-name">Add Style</span>
						</button>
					)}
				</div>
			</div>
			{showModal && (
				<div className="style-modal-overlay" onClick={() => setShowModal(false)}>
					<div className="style-modal" onClick={(event) => event.stopPropagation()}>
						<h4 className="modal-title">{editingStyle ? "Edit Style" : "Add Custom Style"}</h4>
						<button
							className="modal-image-upload"
							type="button"
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								hidden
								onChange={(event) => void handleUpload(event)}
							/>
							{modalImage ? (
								<img src={modalImage} alt="Preview" className="modal-image-preview" />
							) : (
								<span className="modal-image-placeholder">Click to upload image</span>
							)}
						</button>
						<input
							type="text"
							className="modal-name-input"
							placeholder="Style name"
							value={modalName}
							onChange={(event) => setModalName(event.target.value)}
						/>
						<div className="modal-actions">
							<button
								className="modal-btn apply"
								type="button"
								disabled={!modalName.trim() || !modalImage}
								onClick={applyStyle}
							>
								Apply
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
