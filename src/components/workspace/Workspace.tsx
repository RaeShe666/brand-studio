import { type ChangeEvent, type CSSProperties, useEffect, useRef, useState } from "react";
import type { RecordingSession } from "../../lib/recordingSession";
import { AssetWorkspace } from "../assets/AssetWorkspace";
import { toFileUrl } from "../video-editor/projectPersistence";
import "./Workspace.css";

type WorkspaceModule = "screen-studio" | "asset";
type BackgroundMode = "wallpaper" | "gradient" | "color" | "image";
type ToolId = "select" | "cursor" | "cam" | "comment" | "audio" | "cmd";
type IconName =
	| "audio"
	| "bg-image"
	| "cam"
	| "chev"
	| "cmd"
	| "comment"
	| "crop"
	| "cursor"
	| "desktop"
	| "export"
	| "folder"
	| "fwd"
	| "gauge"
	| "link"
	| "panel"
	| "play"
	| "plus"
	| "redo"
	| "rewind"
	| "select"
	| "sparkle"
	| "speed"
	| "split"
	| "trash"
	| "undo";

const WALLPAPERS = Array.from(
	{ length: 18 },
	(_, index) => `/wallpapers/wallpaper${index + 1}.jpg`,
);
const GRADIENTS = [
	"linear-gradient(112deg, #72a7e8 9%, #fd8152 48%, #f9ca56 86%)",
	"linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)",
	"radial-gradient(circle at 12% 34%, #500c8b 0%, #a10a90 84%)",
	"linear-gradient(112deg, #003844 0%, #a3d9b9 52%, #e79406 89%)",
	"linear-gradient(108deg, #ebe62c 8%, #fc980f 90%)",
	"linear-gradient(91deg, #489a4e 5%, #fbce46 96%)",
	"radial-gradient(circle at 10% 20%, #02254e 0%, #04387e 20%, #55f5dd 100%)",
	"linear-gradient(110deg, #0f0202 11%, #24a3be 91%)",
	"linear-gradient(135deg, #fbc8b4, #2447b1)",
	"linear-gradient(110deg, #f635a6, #36d860)",
	"linear-gradient(315deg, #ec0101, #5044a9)",
	"linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%)",
];
const ASPECTS = [
	{ id: "16:9", label: "Wide 16:9", value: 16 / 9 },
	{ id: "9:16", label: "Tall 9:16", value: 9 / 16 },
	{ id: "1:1", label: "Square 1:1", value: 1 },
	{ id: "4:5", label: "Post 4:5", value: 4 / 5 },
];
const TOOLS: Array<{ id: ToolId; label: string; icon: IconName }> = [
	{ id: "select", label: "Selection", icon: "select" },
	{ id: "cursor", label: "Cursor", icon: "cursor" },
	{ id: "cam", label: "Webcam", icon: "cam" },
	{ id: "comment", label: "Comment", icon: "comment" },
	{ id: "audio", label: "Audio", icon: "audio" },
	{ id: "cmd", label: "Shortcuts", icon: "cmd" },
];
const WEBCAM_SHAPES = ["Circle", "Rounded", "Square", "Rectangle"];

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const totalSeconds = Math.floor(seconds);
	const minutes = Math.floor(totalSeconds / 60);
	const remainder = totalSeconds % 60;
	return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
	const common = {
		stroke: "currentColor",
		strokeWidth: 1.6,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
		fill: "none",
	};
	switch (name) {
		case "folder":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
				</svg>
			);
		case "trash":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
				</svg>
			);
		case "undo":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M3 7v6h6M3 13a9 9 0 1 0 3-7" />
				</svg>
			);
		case "redo":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M21 7v6h-6M21 13a9 9 0 1 1-3-7" />
				</svg>
			);
		case "sparkle":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
				</svg>
			);
		case "panel":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<rect x="3" y="4" width="18" height="16" rx="2" />
					<path d="M15 4v16" />
				</svg>
			);
		case "gauge":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<circle cx="12" cy="13" r="8" />
					<path d="M12 13l4-3M9 4h6" />
				</svg>
			);
		case "export":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M12 3v12M7 8l5-5 5 5M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
				</svg>
			);
		case "select":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<rect x="4" y="4" width="16" height="16" rx="2" />
					<path d="M4 9h16M9 4v16" />
				</svg>
			);
		case "cursor":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M5 3l5 16 2-7 7-2L5 3z" />
				</svg>
			);
		case "cam":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<rect x="3" y="6" width="13" height="12" rx="2" />
					<path d="M16 10l5-3v10l-5-3z" />
				</svg>
			);
		case "comment":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M21 12a8 8 0 1 1-3.5-6.6L21 4l-1 4.5A8 8 0 0 1 21 12z" />
				</svg>
			);
		case "audio":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M11 5L6 9H3v6h3l5 4V5zM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
				</svg>
			);
		case "cmd":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6z" />
				</svg>
			);
		case "bg-image":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<rect x="3" y="4" width="18" height="16" rx="2" />
					<circle cx="9" cy="10" r="2" />
					<path d="M3 17l5-5 4 4 3-3 6 6" />
				</svg>
			);
		case "desktop":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<rect x="3" y="4" width="18" height="12" rx="2" />
					<path d="M8 20h8M12 16v4" />
				</svg>
			);
		case "crop":
		case "split":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d={name === "crop" ? "M6 2v16h16M2 6h16v16" : "M4 4l16 16M20 4L4 20"} />
				</svg>
			);
		case "play":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
					<path d="M6 4l14 8-14 8V4z" />
				</svg>
			);
		case "rewind":
		case "fwd":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
					<path
						d={
							name === "rewind"
								? "M11 5v14L2 12l9-7zm11 0v14l-9-7 9-7z"
								: "M13 5v14l9-7-9-7zM2 5v14l9-7-9-7z"
						}
					/>
				</svg>
			);
		case "speed":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M3 12h6m6-3l3-3m-3 9h6" />
					<circle cx="12" cy="12" r="4" />
				</svg>
			);
		case "link":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
				</svg>
			);
		case "plus":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M12 5v14M5 12h14" />
				</svg>
			);
		case "chev":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" {...common}>
					<path d="M6 9l6 6 6-6" />
				</svg>
			);
	}
}

export function Workspace() {
	const [activeModule, setActiveModule] = useState<WorkspaceModule>("screen-studio");
	const [projectName, setProjectName] = useState("Untitled");
	const [bgMode, setBgMode] = useState<BackgroundMode>("wallpaper");
	const [wallpaperIdx, setWallpaperIdx] = useState(0);
	const [gradientIdx, setGradientIdx] = useState(0);
	const [bgColor, setBgColor] = useState("#1d1f2c");
	const [bgImage, setBgImage] = useState("");
	const [bgBlur, setBgBlur] = useState(0);
	const [padding, setPadding] = useState(48);
	const [cornerRadius, setCornerRadius] = useState(18);
	const [aspectId, setAspectId] = useState("16:9");
	const [webcamShape, setWebcamShape] = useState("Circle");
	const [showCamera, setShowCamera] = useState(false);
	const [includeAudio, setIncludeAudio] = useState(true);
	const [activeTool, setActiveTool] = useState<ToolId>("select");
	const [playbackRate, setPlaybackRate] = useState(1);
	const [openingRecorder, setOpeningRecorder] = useState(false);
	const [recordingSession, setRecordingSession] = useState<RecordingSession | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const bgInputRef = useRef<HTMLInputElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	const aspect = ASPECTS.find((entry) => entry.id === aspectId) ?? ASPECTS[0];
	const background =
		bgMode === "wallpaper"
			? `url(${WALLPAPERS[wallpaperIdx]})`
			: bgMode === "gradient"
				? GRADIENTS[gradientIdx]
				: bgMode === "image" && bgImage
					? `url(${bgImage})`
					: bgColor;
	const editorStyle = {
		"--studio-pad": `${padding}px`,
		"--studio-radius": `${cornerRadius}px`,
		"--studio-bg-blur": `${bgBlur}px`,
		"--studio-aspect": `${aspect.value}`,
	} as CSSProperties;
	const videoUrl = recordingSession ? toFileUrl(recordingSession.screenVideoPath) : null;

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			const result = await window.electronAPI.getCurrentRecordingSession();
			if (result.success && result.session) {
				if (!cancelled) setRecordingSession(result.session);
				return;
			}
			const pathResult = await window.electronAPI.getCurrentVideoPath();
			if (!cancelled && pathResult.success && pathResult.path) {
				setRecordingSession({
					screenVideoPath: pathResult.path,
					createdAt: Date.now(),
				});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.playbackRate = playbackRate;
		}
	}, [playbackRate]);

	const openRecorder = async () => {
		setOpeningRecorder(true);
		try {
			await window.electronAPI.openScreenStudio();
		} finally {
			setOpeningRecorder(false);
		}
	};

	const togglePlayback = async () => {
		const video = videoRef.current;
		if (!videoUrl || !video) return;
		if (video.paused) {
			await video.play();
		} else {
			video.pause();
		}
	};

	const seekBy = (seconds: number) => {
		const video = videoRef.current;
		if (!videoUrl || !video) return;
		video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
	};

	const uploadBackground = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => setBgImage(String(reader.result));
		reader.readAsDataURL(file);
	};

	return (
		<div className="workspace-shell">
			<aside className="product-sidebar">
				<div className="sidebar-logo" aria-label="SYL.AILABS">
					<img src="/logo-home-transparent.png" alt="SYL.AILABS" />
				</div>
				<nav className="sidebar-nav" aria-label="Workspace">
					<button
						type="button"
						className={`sidebar-nav-item ${activeModule === "screen-studio" ? "active" : ""}`}
						onClick={() => setActiveModule("screen-studio")}
					>
						Screen
						<br />
						Studio
					</button>
					<button
						type="button"
						className={`sidebar-nav-item ${activeModule === "asset" ? "active" : ""}`}
						onClick={() => setActiveModule("asset")}
					>
						Asset
					</button>
				</nav>
			</aside>
			<div className="workspace-content">
				{activeModule === "screen-studio" ? (
					<main className="studio-editor" style={editorStyle}>
						<header className="se-topbar">
							<div className="se-topbar-cluster">
								<button className="se-icon-btn" type="button" title="Open project">
									<Icon name="folder" />
								</button>
								<button className="se-icon-btn" type="button" title="Delete">
									<Icon name="trash" />
								</button>
							</div>
							<div className="se-topbar-title">
								<input
									className="se-title-input"
									value={projectName}
									onChange={(event) => setProjectName(event.target.value)}
								/>
								<span className="se-title-ext">.screenstudio</span>
							</div>
							<div className="se-topbar-cluster">
								<button className="se-icon-btn" type="button" title="Undo">
									<Icon name="undo" />
								</button>
								<button className="se-icon-btn" type="button" title="Redo">
									<Icon name="redo" />
								</button>
								<button className="se-icon-btn ghost-pill" type="button" title="Presets">
									<Icon name="sparkle" size={15} />
									<span>Presets</span>
									<Icon name="chev" size={14} />
								</button>
								<button className="se-icon-btn" type="button" title="Toggle inspector">
									<Icon name="panel" />
								</button>
								<button className="se-icon-btn" type="button" title="Performance">
									<Icon name="gauge" />
								</button>
								<button
									className="se-rec-btn"
									type="button"
									disabled={openingRecorder}
									onClick={openRecorder}
								>
									<span className="rec-dot" />
									{openingRecorder ? "Opening..." : "Record"}
								</button>
								<button className="se-export-btn disabled" type="button" disabled>
									<Icon name="export" size={15} /> Export
								</button>
							</div>
						</header>
						<section className="se-canvas-wrap">
							<div className="se-canvas">
								<div className="se-canvas-bg" style={{ background }} />
								<div
									className="se-canvas-frame"
									style={{ aspectRatio: aspect.value, borderRadius: `${cornerRadius}px` }}
								>
									<div className="se-empty">
										<Icon name="desktop" size={28} />
										<strong>No recording yet</strong>
										<small>
											Press <em>Record</em> above to capture a screen, window, or browser tab.
										</small>
									</div>
									{videoUrl && (
										<video
											ref={videoRef}
											className="se-recording-video"
											src={videoUrl}
											onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
											onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
											onPlay={() => setIsPlaying(true)}
											onPause={() => setIsPlaying(false)}
											onEnded={() => setIsPlaying(false)}
										/>
									)}
									{showCamera && (
										<div className={`se-webcam-preview shape-${webcamShape.toLowerCase()}`} />
									)}
								</div>
							</div>
						</section>
						<nav className="se-tool-rail" aria-label="Tools">
							{TOOLS.map((tool) => (
								<button
									key={tool.id}
									type="button"
									className={`se-tool-btn ${activeTool === tool.id ? "active" : ""}`}
									title={tool.label}
									onClick={() => {
										setActiveTool(tool.id);
										if (tool.id === "cam") setShowCamera((shown) => !shown);
										if (tool.id === "audio") setIncludeAudio((included) => !included);
									}}
								>
									<Icon name={tool.icon} />
									{tool.id === "cam" && showCamera && <span className="tool-dot on" />}
									{tool.id === "audio" && includeAudio && <span className="tool-dot on" />}
								</button>
							))}
						</nav>
						<aside className="se-inspector">
							<div className="insp-section">
								<div className="insp-section-head">
									<Icon name="bg-image" size={16} />
									<strong>Background</strong>
								</div>
								<div className="insp-tabs">
									{(["wallpaper", "gradient", "color", "image"] as BackgroundMode[]).map((mode) => (
										<button
											key={mode}
											type="button"
											className={bgMode === mode ? "active" : ""}
											onClick={() => setBgMode(mode)}
										>
											{mode[0].toUpperCase() + mode.slice(1)}
										</button>
									))}
								</div>
								{bgMode === "wallpaper" && (
									<div className="bg-grid">
										{WALLPAPERS.map((wallpaper, index) => (
											<button
												key={wallpaper}
												type="button"
												className={`bg-thumb ${wallpaperIdx === index ? "active" : ""}`}
												style={{ backgroundImage: `url(${wallpaper})` }}
												onClick={() => setWallpaperIdx(index)}
												aria-label={`Wallpaper ${index + 1}`}
											/>
										))}
									</div>
								)}
								{bgMode === "gradient" && (
									<div className="bg-grid">
										{GRADIENTS.map((gradient, index) => (
											<button
												key={gradient}
												type="button"
												className={`bg-thumb ${gradientIdx === index ? "active" : ""}`}
												style={{ background: gradient }}
												onClick={() => setGradientIdx(index)}
												aria-label={`Gradient ${index + 1}`}
											/>
										))}
									</div>
								)}
								{bgMode === "color" && (
									<div className="bg-color-picker">
										<input
											type="color"
											value={bgColor}
											onChange={(event) => setBgColor(event.target.value)}
										/>
										<input
											className="bg-color-input"
											value={bgColor}
											onChange={(event) => setBgColor(event.target.value)}
										/>
									</div>
								)}
								{bgMode === "image" && (
									<div className="bg-image-upload">
										{bgImage && (
											<div
												className="bg-image-preview"
												style={{ backgroundImage: `url(${bgImage})` }}
											/>
										)}
										<button
											className="upload-btn"
											type="button"
											onClick={() => bgInputRef.current?.click()}
										>
											<Icon name="plus" size={14} />
											{bgImage ? "Replace image" : "Upload image"}
										</button>
										<input
											ref={bgInputRef}
											type="file"
											accept="image/*"
											hidden
											onChange={uploadBackground}
										/>
									</div>
								)}
								<label className="insp-slider">
									<span className="insp-slider-label">Background blur</span>
									<span className="insp-slider-val">{bgBlur}</span>
									<input
										type="range"
										min="0"
										max="40"
										value={bgBlur}
										onChange={(event) => setBgBlur(Number(event.target.value))}
									/>
								</label>
							</div>
							<div className="insp-section">
								<div className="insp-section-head">
									<strong>Shape</strong>
								</div>
								<div className="shape-row">
									{WEBCAM_SHAPES.map((shape) => (
										<button
											key={shape}
											type="button"
											className={`shape-chip ${webcamShape === shape ? "active" : ""}`}
											onClick={() => setWebcamShape(shape)}
										>
											<span className={`shape-icon shape-${shape.toLowerCase()}`} />
											<small>{shape}</small>
										</button>
									))}
								</div>
								<label className="insp-toggle">
									<span className="toggle-text">Show webcam overlay</span>
									<input
										type="checkbox"
										checked={showCamera}
										onChange={(event) => setShowCamera(event.target.checked)}
									/>
									<span className="toggle-pill">
										<span />
									</span>
								</label>
							</div>
							<div className="insp-section">
								<div className="insp-section-head">
									<strong>Frame</strong>
								</div>
								<label className="insp-slider">
									<span className="insp-slider-label">Padding</span>
									<span className="insp-slider-val">{padding}</span>
									<input
										type="range"
										min="0"
										max="160"
										value={padding}
										onChange={(event) => setPadding(Number(event.target.value))}
									/>
								</label>
								<label className="insp-slider">
									<span className="insp-slider-label">Corner radius</span>
									<span className="insp-slider-val">{cornerRadius}</span>
									<input
										type="range"
										min="0"
										max="48"
										value={cornerRadius}
										onChange={(event) => setCornerRadius(Number(event.target.value))}
									/>
								</label>
								<button
									className="insp-reset"
									type="button"
									onClick={() => {
										setPadding(48);
										setCornerRadius(18);
										setBgBlur(0);
									}}
								>
									Reset
								</button>
							</div>
						</aside>
						<div className="se-transport">
							<div className="se-transport-left">
								<div className="se-select">
									<select value={aspectId} onChange={(event) => setAspectId(event.target.value)}>
										{ASPECTS.map((option) => (
											<option key={option.id} value={option.id}>
												{option.label}
											</option>
										))}
									</select>
									<Icon name="chev" size={14} />
								</div>
								<button className="se-trans-btn ghost" type="button" disabled>
									<Icon name="crop" size={15} /> Crop
								</button>
							</div>
							<div className="se-playback">
								<button
									className="se-trans-btn"
									type="button"
									disabled={!videoUrl}
									onClick={() => seekBy(-5)}
									aria-label="Rewind 5 seconds"
								>
									<Icon name="rewind" />
								</button>
								<button
									className="se-play-btn"
									type="button"
									disabled={!videoUrl}
									onClick={() => void togglePlayback()}
									aria-label={isPlaying ? "Pause recording" : "Play recording"}
								>
									<Icon name="play" />
								</button>
								<button
									className="se-trans-btn"
									type="button"
									disabled={!videoUrl}
									onClick={() => seekBy(5)}
									aria-label="Forward 5 seconds"
								>
									<Icon name="fwd" />
								</button>
								<span className="se-time">
									{formatTime(currentTime)} / {formatTime(duration)}
								</span>
							</div>
							<div className="se-transport-right">
								<button className="se-trans-btn ghost" type="button" disabled>
									<Icon name="split" />
								</button>
								<label className="se-speed">
									<Icon name="speed" size={14} />
									<input
										type="range"
										min="0.25"
										max="2"
										step="0.05"
										value={playbackRate}
										onChange={(event) => setPlaybackRate(Number(event.target.value))}
									/>
									<span>{playbackRate.toFixed(2)}x</span>
								</label>
							</div>
						</div>
						<div className="se-timeline">
							<div className="se-timeline-ruler">
								{["0:00", "0:01", "0:02", "0:03", "0:04", "0:05"].map((time) => (
									<span key={time}>{time}</span>
								))}
							</div>
							<div className="se-track clip">
								<div className="se-wave">
									{Array.from({ length: 60 }, (_, index) => (
										<span
											key={index}
											style={{ height: `${18 + Math.abs(Math.sin(index * 0.5)) * 62}%` }}
										/>
									))}
								</div>
								<span className="se-track-label">
									<Icon name="link" size={12} /> Clip - {formatTime(duration)} -{" "}
									{playbackRate.toFixed(2)}x
								</span>
							</div>
							<div className="se-track zoom">
								<span className="zoom-region">
									<Icon name="cursor" size={11} /> Zoom - 2x - Auto
								</span>
								<span className="zoom-note">Zoom regions live in the desktop studio</span>
							</div>
						</div>
					</main>
				) : (
					<AssetWorkspace />
				)}
			</div>
		</div>
	);
}
