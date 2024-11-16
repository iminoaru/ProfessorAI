
import React from "react";
import Social from "./social";
import Image from "next/image";

export default function Register() {
  const queryString =
    typeof window !== "undefined" ? window?.location.search : "";
  const urlParams = new URLSearchParams(queryString);

  const next = urlParams.get("next");

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-md shadow-lg p-6 sm:p-12 border border-border rounded-lg bg-card text-card-foreground">
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-4 sm:space-y-6">
            
            <h1 className="text-2xl sm:text-3xl font-bold">Authorize Yourself</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
            
            </p>
          </div>
          <Social redirectTo={next || "/"} />
        </div>
      </div>
    </div>
  );
}