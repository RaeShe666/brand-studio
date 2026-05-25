import { supabase } from "./supabaseClient";
import { BLANK_PROJECT_DATA, type ProjectData } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "https://api.sylailabs.com";

function normalizeUrl(value: string) {
	const trimmed = value.trim();
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function extractBrandKit(input: string): Promise<{ data: ProjectData; url: string }> {
	const url = normalizeUrl(input);
	const { data: sessionData } = await supabase.auth.getSession();
	const token = sessionData.session?.access_token;
	if (!token) throw new Error("Your session expired. Please sign in again.");

	const response = await fetch(`${API_URL}/api/extract?url=${encodeURIComponent(url)}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const body = (await response.json()) as {
		data?: Partial<ProjectData>;
		error?: string;
		message?: string;
		success?: boolean;
	};

	if (!response.ok || !body.success || !body.data) {
		throw new Error(body.message || body.error || "Brand extraction failed.");
	}

	return {
		url,
		data: {
			brandIdentity: {
				...BLANK_PROJECT_DATA.brandIdentity,
				...body.data.brandIdentity,
				colors: body.data.brandIdentity?.colors ?? BLANK_PROJECT_DATA.brandIdentity.colors,
			},
			visualSystem: {
				...BLANK_PROJECT_DATA.visualSystem,
				...body.data.visualSystem,
			},
			brandContext: {
				...BLANK_PROJECT_DATA.brandContext,
				...body.data.brandContext,
				images: body.data.brandContext?.images ?? [],
				keywords: body.data.brandContext?.keywords ?? [],
				tones: body.data.brandContext?.tones ?? [],
			},
		},
	};
}
