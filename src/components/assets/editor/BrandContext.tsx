import { useEffect, useRef, useState } from "react";
import type { BrandContextData } from "../types";
import "./EditorParts.css";
import { ImageGallery } from "./ImageGallery";

export function BrandContext({
	data,
	onChange,
}: {
	data: BrandContextData;
	onChange: (updates: Partial<BrandContextData>) => void;
}) {
	const [newKeyword, setNewKeyword] = useState("");
	const [newTone, setNewTone] = useState("");
	const everHadImages = useRef(false);

	useEffect(() => {
		if (data.images.length > 0) everHadImages.current = true;
	}, [data.images.length]);

	const addKeyword = () => {
		const value = newKeyword.trim();
		if (value && !data.keywords.includes(value)) onChange({ keywords: [...data.keywords, value] });
		setNewKeyword("");
	};
	const addTone = () => {
		const value = newTone.trim();
		if (value && !data.tones.includes(value)) onChange({ tones: [...data.tones, value] });
		setNewTone("");
	};

	return (
		<div className="brand-context">
			<h3 className="section-label">Brand Context</h3>
			<div className="context-content">
				<div className="field-group">
					<label className="field-label" htmlFor="asset-overview">
						Overview
					</label>
					<textarea
						id="asset-overview"
						className="textarea context-textarea"
						placeholder="A concise product description to give AI background knowledge..."
						value={data.overview}
						onChange={(event) => onChange({ overview: event.target.value })}
					/>
				</div>
				<TagEditor
					label="Positioning Keyword"
					value={newKeyword}
					onChange={setNewKeyword}
					onAdd={addKeyword}
					tags={data.keywords}
					onRemove={(tag) => onChange({ keywords: data.keywords.filter((value) => value !== tag) })}
				/>
				<TagEditor
					label="Brand Tone"
					value={newTone}
					onChange={setNewTone}
					onAdd={addTone}
					tags={data.tones}
					onRemove={(tag) => onChange({ tones: data.tones.filter((value) => value !== tag) })}
				/>
				<div className="field-group">
					<span className="field-label">Visual Images</span>
					<ImageGallery
						images={data.images}
						maxImages={6}
						onAdd={(image) => onChange({ images: [...data.images, image] })}
						onRemove={(index) =>
							onChange({ images: data.images.filter((_, imageIndex) => imageIndex !== index) })
						}
					/>
					{data.images.length === 0 && !everHadImages.current && (
						<p className="field-hint capture-error">Unable to capture website screenshot</p>
					)}
				</div>
			</div>
		</div>
	);
}

function TagEditor({
	label,
	onAdd,
	onChange,
	onRemove,
	tags,
	value,
}: {
	label: string;
	onAdd: () => void;
	onChange: (value: string) => void;
	onRemove: (tag: string) => void;
	tags: string[];
	value: string;
}) {
	return (
		<div className="field-group">
			<span className="field-label">{label}</span>
			<div className="keywords-container">
				<div className="keyword-input-row">
					<input
						type="text"
						className="keyword-input"
						placeholder="Add keyword..."
						value={value}
						onChange={(event) => onChange(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								onAdd();
							}
						}}
					/>
					<button
						type="button"
						className="btn-accent add-keyword-btn"
						onClick={onAdd}
						disabled={!value.trim()}
					>
						+ Add
					</button>
				</div>
				<div className="keywords-list">
					{tags.map((tag) => (
						<span key={tag} className="keyword-tag">
							{tag}
							<button type="button" className="keyword-remove" onClick={() => onRemove(tag)}>
								×
							</button>
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
