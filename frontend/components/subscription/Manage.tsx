"use client";

import  useStore  from "@/useStore";
import { Button } from "@/components/ui/button";
import { manageBilling } from "@/lib/actions/stripe";
import React from "react";

export default function Manage() {
	const { customerID, isPaidUser, isLoading } = useStore();
	if (isLoading) {
		return <>Loading.....</>;
	}

	const handleBilling = async () => {
		if (isPaidUser && customerID) {
			const data = JSON.parse( await manageBilling(customerID) )

			window.location.href = data.url;
		}
	};
	return (
		<div className=" space-y-5">
			{isPaidUser && (
				<Button onClick={handleBilling}>Manage subscription</Button>
			)}
		</div>
	);
}