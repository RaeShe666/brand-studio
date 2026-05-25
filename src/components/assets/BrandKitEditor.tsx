import { useCallback, useEffect, useRef, useState } from "react";
import "./BrandKitEditor.css";
import { BrandContext } from "./editor/BrandContext";
import { BrandIdentity } from "./editor/BrandIdentity";
import { VisualSystem } from "./editor/VisualSystem";
import type { BrandContextData, BrandIdentityData, BrandProject, VisualSystemData } from "./types";

export function BrandKitEditor({
	onBack,
	onSave,
	project,
}: {
	onBack: () => void;
	onSave: (project: BrandProject) => Promise<void>;
	project: BrandProject;
}) {
	const [formData, setFormData] = useState(project);
	const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
	const firstRenderRef = useRef(true);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		setFormData(project);
		firstRenderRef.current = true;
		setSaveState("idle");
	}, [project]);

	const saveProject = useCallback(
		async (draft: BrandProject) => {
			setSaveState("saving");
			try {
				await onSave(draft);
				setSaveState("saved");
			} catch (error) {
				console.error("Failed to save project:", error);
				setSaveState("error");
			}
		},
		[onSave],
	);

	useEffect(() => {
		if (firstRenderRef.current) {
			firstRenderRef.current = false;
			return;
		}

		clearTimeout(saveTimeoutRef.current);
		setSaveState("idle");
		saveTimeoutRef.current = setTimeout(() => {
			void saveProject(formData);
		}, 500);

		return () => clearTimeout(saveTimeoutRef.current);
	}, [formData, saveProject]);

	const updateBrandIdentity = (updates: Partial<BrandIdentityData>) => {
		setFormData((current) => ({
			...current,
			brandIdentity: { ...current.brandIdentity, ...updates },
		}));
	};

	const updateVisualSystem = (updates: Partial<VisualSystemData>) => {
		setFormData((current) => ({
			...current,
			visualSystem: { ...current.visualSystem, ...updates },
		}));
	};

	const updateBrandContext = (updates: Partial<BrandContextData>) => {
		setFormData((current) => ({
			...current,
			brandContext: { ...current.brandContext, ...updates },
		}));
	};

	const saveAndBack = async () => {
		clearTimeout(saveTimeoutRef.current);
		await saveProject(formData);
		onBack();
	};

	return (
		<div className="editor-page">
			<header className="editor-header">
				<button className="save-btn" type="button" onClick={() => void saveAndBack()}>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
						<polyline points="17,21 17,13 7,13 7,21" />
						<polyline points="7,3 7,8 15,8" />
					</svg>
					Save
				</button>
				<div className="header-center">
					<h1 className="header-title">Brand Kit Editor</h1>
					{formData.url && <span className="header-url">{formData.url}</span>}
				</div>
				<div className="save-status" aria-live="polite">
					{saveState === "saving" && (
						<span className="status-saving">
							<span className="status-spinner" /> Saving
						</span>
					)}
					{saveState === "saved" && <span className="status-saved">Saved</span>}
					{saveState === "error" && <span className="status-unsaved">Save failed</span>}
				</div>
			</header>
			<main className="editor-main">
				<div className="editor-grid">
					<section className="editor-column">
						<BrandIdentity data={formData.brandIdentity} onChange={updateBrandIdentity} />
					</section>
					<section className="editor-column">
						<VisualSystem data={formData.visualSystem} onChange={updateVisualSystem} />
					</section>
					<section className="editor-column">
						<BrandContext data={formData.brandContext} onChange={updateBrandContext} />
					</section>
				</div>
			</main>
		</div>
	);
}
