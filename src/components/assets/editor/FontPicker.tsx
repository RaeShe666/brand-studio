import { useEffect, useRef, useState } from "react";

const FONT_LIST = [
	"Inter",
	"Roboto",
	"Open Sans",
	"Montserrat",
	"Lato",
	"Poppins",
	"Raleway",
	"Nunito",
	"Ubuntu",
	"Playfair Display",
	"Merriweather",
	"Source Sans Pro",
	"Oswald",
	"Noto Sans",
	"Rubik",
	"Work Sans",
	"Quicksand",
	"Barlow",
	"Mulish",
	"Karla",
	"Outfit",
	"Space Grotesk",
	"DM Sans",
	"Manrope",
	"Sora",
	"Plus Jakarta Sans",
	"Figtree",
	"Lexend",
	"Be Vietnam Pro",
	"Albert Sans",
	"PT Sans",
	"Noto Serif",
	"Libre Franklin",
	"IBM Plex Sans",
	"Cabin",
	"Josefin Sans",
	"Fira Sans",
	"Arimo",
	"Dosis",
	"Titillium Web",
	"Crimson Text",
	"Cormorant Garamond",
	"Libre Baskerville",
	"EB Garamond",
	"Lora",
	"Roboto Slab",
	"Fira Code",
	"JetBrains Mono",
	"Source Code Pro",
	"IBM Plex Mono",
];

export function loadFont(fontName: string) {
	if (!fontName) return;
	const linkId = `font-${fontName.replace(/\s+/g, "-")}`;
	if (document.getElementById(linkId)) return;
	const link = document.createElement("link");
	link.id = linkId;
	link.rel = "stylesheet";
	link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
	document.head.appendChild(link);
}

export function FontPicker({
	currentFont,
	onChange,
	onClose,
}: {
	currentFont: string;
	onChange: (font: string) => void;
	onClose: () => void;
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const pickerRef = useRef<HTMLDivElement>(null);
	const fontList =
		currentFont && !FONT_LIST.includes(currentFont) ? [currentFont, ...FONT_LIST] : FONT_LIST;
	const filteredFonts = fontList.filter((font) =>
		font.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	useEffect(() => {
		for (const font of filteredFonts.slice(0, 10)) loadFont(font);
	}, [filteredFonts]);

	useEffect(() => {
		const clickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) onClose();
		};
		document.addEventListener("mousedown", clickOutside);
		return () => document.removeEventListener("mousedown", clickOutside);
	}, [onClose]);

	return (
		<div className="font-picker" ref={pickerRef}>
			<div className="font-picker-search">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="text"
					placeholder="Search Google Fonts"
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					autoFocus
				/>
			</div>
			<div className="font-picker-list">
				{filteredFonts.map((font) => (
					<button
						key={font}
						type="button"
						className={`font-picker-item ${font === currentFont ? "active" : ""}`}
						style={{ fontFamily: `'${font}', sans-serif` }}
						onMouseEnter={() => loadFont(font)}
						onClick={() => {
							loadFont(font);
							onChange(font);
							onClose();
						}}
					>
						{font === currentFont && <span>✓</span>}
						{font}
					</button>
				))}
			</div>
			<a
				href="https://fonts.google.com"
				target="_blank"
				rel="noopener noreferrer"
				className="font-picker-link"
			>
				Explore more fonts at <span>Google Fonts</span>
			</a>
		</div>
	);
}
