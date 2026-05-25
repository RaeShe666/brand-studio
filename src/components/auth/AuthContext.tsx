import type { User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "../assets/supabaseClient";

interface AuthContextValue {
	authError: string;
	clearAuthError: () => void;
	loading: boolean;
	signInWithEmail: (email: string, password: string) => Promise<void>;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
	signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
	user: User | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [authError, setAuthError] = useState("");

	useEffect(() => {
		if (!hasSupabaseConfig) {
			setLoading(false);
			return;
		}

		void supabase.auth.getSession().then(({ data }) => {
			setUser(data.session?.user ?? null);
			setLoading(false);
		});

		const { data } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});
		return () => data.subscription.unsubscribe();
	}, []);

	useEffect(() => {
		const completeGoogleSignIn = async () => {
			const callbackUrl = await window.electronAPI.consumeAuthCallbackUrl();
			if (!callbackUrl) return;
			const url = new URL(callbackUrl);
			const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
			const callbackError =
				url.searchParams.get("error_description") ||
				fragment.get("error_description") ||
				url.searchParams.get("error") ||
				fragment.get("error");
			if (callbackError) {
				setAuthError(callbackError);
				return;
			}

			const code = url.searchParams.get("code");
			if (code) {
				const { error } = await supabase.auth.exchangeCodeForSession(code);
				if (error) setAuthError(error.message);
				return;
			}

			const accessToken = fragment.get("access_token");
			const refreshToken = fragment.get("refresh_token");
			if (!accessToken || !refreshToken) {
				setAuthError("Google sign-in returned without a usable session.");
				return;
			}

			const { error } = await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken,
			});
			if (error) setAuthError(error.message);
		};

		const unsubscribe = window.electronAPI.onAuthCallbackReady(() => {
			void completeGoogleSignIn();
		});
		void completeGoogleSignIn();
		return unsubscribe;
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			authError,
			clearAuthError: () => setAuthError(""),
			loading,
			user,
			signInWithGoogle: async () => {
				setAuthError("");
				const { data, error } = await supabase.auth.signInWithOAuth({
					provider: "google",
					options: {
						redirectTo: "brandstudio://auth/callback",
						skipBrowserRedirect: true,
					},
				});
				if (error) throw error;
				if (!data.url) throw new Error("Google sign-in URL was not returned.");
				const result = await window.electronAPI.openExternalUrl(data.url);
				if (!result.success) throw new Error(result.error || "Could not open Google sign-in.");
			},
			signInWithEmail: async (email, password) => {
				const { error } = await supabase.auth.signInWithPassword({ email, password });
				if (error) throw error;
			},
			signUpWithEmail: async (email, password, displayName) => {
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: { data: { display_name: displayName || "" } },
				});
				if (error) throw error;
			},
			signOut: async () => {
				const { error } = await supabase.auth.signOut();
				if (error) throw error;
			},
		}),
		[authError, loading, user],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
}
