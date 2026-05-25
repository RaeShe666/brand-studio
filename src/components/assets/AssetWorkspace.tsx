import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { extractBrandKit } from "./assetApi";
import "./AssetWorkspace.css";
import { BrandKitEditor } from "./BrandKitEditor";
import { supabase } from "./supabaseClient";
import { type BrandProject, type ProjectRow, toProject } from "./types";

function formatProjectDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

function ProjectCard({ onOpen, project }: { onOpen: () => void; project: BrandProject }) {
	const name = project.brandIdentity.name || "Untitled Project";
	const colors = project.brandIdentity.colors.slice(0, 4);

	return (
		<button type="button" className="asset-project-card" onClick={onOpen}>
			<div className="asset-project-logo">
				{project.brandIdentity.logo ? (
					<img src={project.brandIdentity.logo} alt="" />
				) : (
					<span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
				)}
			</div>
			<div className="asset-project-colors">
				{colors.map((color, index) => (
					<span key={`${project.id}-${index}`} style={{ backgroundColor: color }} />
				))}
			</div>
			<h3>{name}</h3>
			<p>{project.url}</p>
			<time>{formatProjectDate(project.updatedAt || project.createdAt)}</time>
		</button>
	);
}

export function AssetWorkspace() {
	const { signOut, user } = useAuth();
	const [projects, setProjects] = useState<BrandProject[]>([]);
	const [currentProject, setCurrentProject] = useState<BrandProject | null>(null);
	const [loadingProjects, setLoadingProjects] = useState(false);
	const [loadError, setLoadError] = useState("");
	const [extractError, setExtractError] = useState("");
	const [isExtracting, setIsExtracting] = useState(false);
	const [url, setUrl] = useState("");

	const loadProjects = useCallback(async () => {
		if (!user) return;
		setLoadingProjects(true);
		setLoadError("");
		const { data, error } = await supabase
			.from("projects")
			.select("id,url,name,data,created_at,updated_at")
			.order("updated_at", { ascending: false });

		if (error) {
			setLoadError(error.message);
		} else {
			setProjects(((data ?? []) as ProjectRow[]).map(toProject));
		}
		setLoadingProjects(false);
	}, [user]);

	useEffect(() => {
		if (!user) {
			setProjects([]);
			setCurrentProject(null);
			return;
		}
		void loadProjects();
	}, [loadProjects, user]);

	const submitExtraction = async (event: FormEvent) => {
		event.preventDefault();
		if (!user || !url.trim()) return;
		setIsExtracting(true);
		setExtractError("");
		try {
			const extracted = await extractBrandKit(url);
			const { data, error } = await supabase
				.from("projects")
				.insert({
					user_id: user.id,
					url: extracted.url,
					name: extracted.data.brandIdentity.name,
					data: extracted.data,
				})
				.select("id,url,name,data,created_at,updated_at")
				.single();
			if (error) throw error;

			const project = toProject(data as ProjectRow);
			setProjects((existing) => [project, ...existing]);
			setCurrentProject(project);
			setUrl("");
		} catch (error) {
			setExtractError(error instanceof Error ? error.message : "Extraction failed.");
		} finally {
			setIsExtracting(false);
		}
	};

	const saveProject = async (project: BrandProject) => {
		const data = {
			brandIdentity: project.brandIdentity,
			visualSystem: project.visualSystem,
			brandContext: project.brandContext,
		};
		const { error } = await supabase
			.from("projects")
			.update({ name: data.brandIdentity.name, data })
			.eq("id", project.id);
		if (error) throw error;
		setProjects((existing) => existing.map((item) => (item.id === project.id ? project : item)));
		setCurrentProject(project);
	};

	if (currentProject) {
		return (
			<BrandKitEditor
				project={currentProject}
				onSave={saveProject}
				onBack={() => {
					setCurrentProject(null);
					void loadProjects();
				}}
			/>
		);
	}

	return (
		<main className="asset-module asset-dashboard">
			<header className="asset-header">
				<div>
					<span className="asset-label">Asset</span>
					<h1>Brand DNA</h1>
					<p>Paste a URL below to decode its brand identity, visual system, and context.</p>
				</div>
				<div className="asset-user">
					<span>{user?.email}</span>
					<button type="button" onClick={() => void signOut()}>
						Sign Out
					</button>
				</div>
			</header>
			<form className="asset-extract-form" onSubmit={submitExtraction}>
				<label htmlFor="asset-url">Brand URL</label>
				<div>
					<input
						id="asset-url"
						value={url}
						onChange={(event) => setUrl(event.target.value)}
						placeholder="www.example.com"
						disabled={isExtracting}
					/>
					<button type="submit" disabled={isExtracting || !url.trim()}>
						{isExtracting ? "Extracting..." : "Extract Brand Kit"}
					</button>
				</div>
				{extractError && <small className="asset-extract-error">{extractError}</small>}
			</form>
			<section className="asset-projects">
				<div className="asset-projects-title">
					<div>
						<span className="asset-label">Saved assets</span>
						<h2>My Projects</h2>
					</div>
					<span>{String(projects.length).padStart(2, "0")} / PROJECTS</span>
				</div>
				{loadingProjects && <p className="asset-state">Loading projects...</p>}
				{loadError && <p className="asset-state asset-extract-error">{loadError}</p>}
				{!loadingProjects && !loadError && projects.length === 0 && (
					<p className="asset-state">No saved projects found for this account.</p>
				)}
				<div className="asset-project-grid">
					{projects.map((project) => (
						<ProjectCard
							key={project.id}
							project={project}
							onOpen={() => setCurrentProject(project)}
						/>
					))}
				</div>
			</section>
		</main>
	);
}
