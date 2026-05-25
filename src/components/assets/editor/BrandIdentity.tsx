import { useEffect, useState } from "react";
import type { BrandIdentityData } from "../types";
import { ColorPicker } from "./ColorPicker";
import { FontPicker, loadFont } from "./FontPicker";
import { LogoUpload } from "./LogoUpload";
import "./EditorParts.css";

export function BrandIdentity({
	data,
	onChange,
}: {
	data: BrandIdentityData;
	onChange: (updates: Partial<BrandIdentityData>) => void;
}) {
	const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
	const [showFontPicker, setShowFontPicker] = useState(false);
	const colors = data.colors || ["#f9f6f5", "#eceef0", "#f4f8f6", "#f8f6fa"];
	const typography = data.typography || "Inter";

	useEffect(() => {
		loadFont(typography);
	}, [typography]);

	const handleColorChange = (index: number, color: string) => {
		const updatedColors = [...colors];
		updatedColors[index] = color;
		onChange({ colors: updatedColors });
	};

	return (
		<div className="brand-identity">
			<h3 className="section-label">Brand Identity</h3>
			<div className="field-group">
				<label className="field-label" htmlFor="asset-brand-name">
					Name <span className="required">*</span>
				</label>
				<input
					id="asset-brand-name"
					type="text"
					className="input"
					placeholder="Enter your brand name"
					value={data.name}
					onChange={(event) => onChange({ name: event.target.value })}
				/>
			</div>
			<div className="field-group">
				<div className="logo-font-row">
					<div className="logo-column">
						<span className="field-label">Logo</span>
						<LogoUpload logo={data.logo} onUpload={(logo) => onChange({ logo })} />
					</div>
					<div className="font-column">
						<span className="field-label">Typography</span>
						<button
							type="button"
							className="font-card"
							onClick={() => setShowFontPicker((shown) => !shown)}
						>
							<span className="font-preview" style={{ fontFamily: `'${typography}', sans-serif` }}>
								Aa
							</span>
							<span className="font-name">{typography}</span>
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
					</div>
				</div>
				{showFontPicker && (
					<FontPicker
						currentFont={typography}
						onChange={(font) => onChange({ typography: font })}
						onClose={() => setShowFontPicker(false)}
					/>
				)}
			</div>
			<div className="field-group">
				<label className="field-label" htmlFor="asset-tagline">
					Tagline
				</label>
				<textarea
					id="asset-tagline"
					className="tagline-textarea"
					placeholder="A short product slogan"
					value={data.tagline}
					onChange={(event) => onChange({ tagline: event.target.value })}
				/>
			</div>
			<div className="field-group">
				<span className="field-label">Color</span>
				<div className="color-system">
					{colors.map((color, index) => (
						<div key={`${color}-${index}`} className="color-item">
							<button
								type="button"
								className={`color-dot ${index === 0 ? "primary" : "secondary"} ${activeColorIndex === index ? "active" : ""}`}
								style={{ backgroundColor: color }}
								onClick={() => setActiveColorIndex(activeColorIndex === index ? null : index)}
							/>
							{activeColorIndex === index && (
								<ColorPicker
									color={color.slice(0, 7)}
									onChange={(newColor) => handleColorChange(index, newColor)}
									onClose={() => setActiveColorIndex(null)}
								/>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
