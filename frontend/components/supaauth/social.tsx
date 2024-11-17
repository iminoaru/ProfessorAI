"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { IoLogoGithub } from "react-icons/io5";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function Social({ redirectTo }: { redirectTo: string }) {
	const loginWithProvider = async (provider: "github") => {
		const supbase = createSupabaseBrowser();
		await supbase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
			},
		});
	};

	return (
		
			<div className="w-full flex flex-col items-center gap-6">
			  <Button
				className="w-full h-12 text-lg font-medium flex items-center justify-center gap-4 transition-all duration-300 hover:scale-105"
				variant="outline"
				onClick={() => loginWithProvider("github")}
			  >
				<IoLogoGithub className="w-6 h-6" />
				Continue with GitHub
			  </Button>
			  
			  
			</div>
		  );
	
}
