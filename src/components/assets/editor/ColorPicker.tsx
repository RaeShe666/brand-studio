import { useEffect, useRef, useState } from "react";

function hsvToHex(h: number, s: number, v: number) {
	const saturation = s / 100;
	const value = v / 100;
	const channel = (n: number) => {
		const k = (n + h / 60) % 6;
		return Math.round(255 * (value - value * saturation * Math.max(0, Math.min(k, 4 - k, 1))));
	};
	return `#${channel(5).toString(16).padStart(2, "0")}${channel(3).toString(16).padStart(2, "0")}${channel(1).toString(16).padStart(2, "0")}`.toUpperCase();
}

function hexToHsv(hex: string) {
	const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#FFFFFF";
	const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
	const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
	const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const difference = max - min;
	let hue = 0;
	if (difference !== 0) {
		if (max === red) hue = ((green - blue) / difference + (green < blue ? 6 : 0)) * 60;
		else if (max === green) hue = ((blue - red) / difference + 2) * 60;
		else hue = ((red - green) / difference + 4) * 60;
	}
	return {
		h: Math.round(hue),
		s: Math.round((max === 0 ? 0 : difference / max) * 100),
		v: Math.round(max * 100),
	};
}

export function ColorPicker({
	color,
	onChange,
	onClose,
}: {
	color: string;
	onChange: (color: string) => void;
	onClose: () => void;
}) {
	const [hsv, setHsv] = useState(() => hexToHsv(color));
	const [hexInput, setHexInput] = useState(color.toUpperCase());
	const pickerRef = useRef<HTMLDivElement>(null);
	const areaRef = useRef<HTMLDivElement>(null);
	const draggingRef = useRef(false);

	useEffect(() => {
		const next = hsvToHex(hsv.h, hsv.s, hsv.v);
		setHexInput(next);
		onChange(next);
	}, [hsv, onChange]);

	useEffect(() => {
		const clickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) onClose();
		};
		document.addEventListener("mousedown", clickOutside);
		return () => document.removeEventListener("mousedown", clickOutside);
	}, [onClose]);

	useEffect(() => {
		const update = (event: MouseEvent) => {
			if (!draggingRef.current || !areaRef.current) return;
			const rect = areaRef.current.getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
			const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
			setHsv((current) => ({ ...current, s: Math.round(x * 100), v: Math.round((1 - y) * 100) }));
		};
		const stop = () => {
			draggingRef.current = false;
		};
		document.addEventListener("mousemove", update);
		document.addEventListener("mouseup", stop);
		return () => {
			document.removeEventListener("mousemove", update);
			document.removeEventListener("mouseup", stop);
		};
	}, []);

	return (
		<div className="color-picker" ref={pickerRef}>
			<div className="picker-header">
				<span className="eyedropper-icon">⌾</span>
				<input
					type="text"
					className="hex-input"
					value={hexInput}
					maxLength={7}
					onChange={(event) => {
						const next = event.target.value.toUpperCase();
						setHexInput(next);
						if (/^#[0-9A-F]{6}$/.test(next)) setHsv(hexToHsv(next));
					}}
				/>
			</div>
			<div className="hue-slider-container">
				<input
					type="range"
					className="hue-slider"
					min="0"
					max="360"
					value={hsv.h}
					onChange={(event) => setHsv((current) => ({ ...current, h: Number(event.target.value) }))}
				/>
			</div>
			<div
				className="color-area"
				ref={areaRef}
				style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
				onMouseDown={(event) => {
					draggingRef.current = true;
					const rect = event.currentTarget.getBoundingClientRect();
					setHsv((current) => ({
						...current,
						s: Math.round(((event.clientX - rect.left) / rect.width) * 100),
						v: Math.round((1 - (event.clientY - rect.top) / rect.height) * 100),
					}));
				}}
			>
				<span className="saturation-overlay" />
				<span className="value-overlay" />
				<span className="area-cursor" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }} />
			</div>
		</div>
	);
}
