import type { User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "../assets/supabaseClient";

interface AuthContextValue {
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

	const value = useMemo<AuthContextValue>(
		() => ({
			loading,
			user,
			signInWithGoogle: async () => {
				throw new Error(
					"Google sign-in for the desktop app will be connected in a later delivery.",
				);
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
		[loading, user],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
}
