export interface BrandIdentityData {
	colors: string[];
	logo: string | null;
	name: string;
	tagline: string;
	typography: string;
}

export interface VisualSystemData {
	baseAppearance: string;
	customStyles?: Array<{
		id: string;
		image: string;
		isCustom: true;
		name: string;
	}>;
}

export interface BrandContextData {
	images: string[];
	keywords: string[];
	overview: string;
	tones: string[];
}

export interface ProjectData {
	brandContext: BrandContextData;
	brandIdentity: BrandIdentityData;
	visualSystem: VisualSystemData;
}

export interface BrandProject extends ProjectData {
	createdAt: string;
	id: string;
	updatedAt: string;
	url: string;
}

export interface ProjectRow {
	created_at: string;
	data: ProjectData | null;
	id: string;
	name: string | null;
	updated_at: string;
	url: string;
}

export const BLANK_PROJECT_DATA: ProjectData = {
	brandIdentity: {
		name: "",
		logo: null,
		tagline: "",
		colors: ["#ff6b4a", "#4a7bf7", "#22c55e", "#9333ea"],
		typography: "Inter",
	},
	visualSystem: { baseAppearance: "clean-minimal" },
	brandContext: { overview: "", keywords: [], tones: [], images: [] },
};

export function toProject(row: ProjectRow): BrandProject {
	return {
		id: row.id,
		url: row.url,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		...(row.data ?? BLANK_PROJECT_DATA),
	};
}
