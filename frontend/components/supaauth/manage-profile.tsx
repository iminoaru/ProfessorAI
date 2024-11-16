import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CircleUser } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; 
import { cn } from "@/lib/utils";
import useUser from "@/app/hook/useUser";
import Avatar from "./avatar";
import Manage from "../subscription/Manage"; 
import useStore from "@/useStore";

export default function ManageProfile() {
    const [activeTab, setActiveTab] = useState("profile");
    const { data } = useUser();
    const { isPaidUser, isLoading, session } = useStore();

    if (!data) {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button id="manage-profile"></button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-[55rem] h-[90vh] md:h-[40rem] flex flex-col md:flex-row">
                <div className="w-full md:w-60 h-auto md:h-full rounded-t-lg md:rounded-s-lg md:rounded-tr-none p-5 space-y-4 md:space-y-7 bg-background text-foreground">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">Account</h1>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Manage subscriptions and stats
                        </p>
                    </div>

                    <div className="flex md:flex-col gap-2">
                        <div
                            className={cn(
                                "p-2 flex items-center gap-2 rounded-lg text-sm cursor-pointer transition-all flex-1 md:flex-auto",
                                {
                                    "text-green-700 ring-[0.5px] ring-zinc-400": activeTab === "profile",
                                    "text-muted-foreground": activeTab !== "profile",
                                }
                            )}
                            onClick={() => setActiveTab("profile")}
                        >
                            <CircleUser />
                            <span>Profile</span>
                        </div>

                        
                    </div>
                </div>

                <div className="flex-1 h-full border-t md:border-l md:border-t-0 rounded-b-lg md:rounded-r-lg px-4 md:px-10 py-5 overflow-y-auto bg-background text-foreground">
                    {activeTab === "profile" && (
                        isLoading ? (
                            <ProfileSkeleton />
                        ) : (
                            <div className="space-y-5">
                                <h1 className="font-bold text-lg md:text-xl w-full md:w-36">Profile details</h1>
                                <div className="flex flex-col md:flex-row items-start md:items-center py-3 md:py-5 gap-3 md:gap-24">
                                    <h1 className="text-sm font-medium w-full md:w-36">Profile</h1>
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                        {isPaidUser && <Manage />}
                                        <Avatar />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-2 md:gap-24 py-3 md:py-5">
                                    <h1 className="text-sm font-medium w-full md:w-36">Name</h1>
                                    <p className="text-sm">{data?.user_metadata.name || 'N/A'}</p>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-2 md:gap-24 py-3 md:py-5">
                                    <h1 className="text-sm font-medium w-full md:w-36">Email</h1>
                                    <p className="text-sm">{data?.email || 'N/A'}</p>
                                </div>
                                <div className="flex flex-col md:flex-row items-start py-3 md:py-5 gap-2 md:gap-24">
                                    <h1 className="text-sm font-medium w-full md:w-36">Connected accounts</h1>
                                    <div className="flex items-center gap-2 px-0 md:px-3">
                                        <p className="capitalize">{data?.app_metadata.provider || 'N/A'}</p>
                                        <p className="text-sm text-muted-foreground">{data?.user_metadata.user_name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                    
                </div>
            </DialogContent>
        </Dialog>
    );
}

const ProfileSkeleton = () => (
    <div className="space-y-4 md:space-y-6 py-2">
        <Skeleton className="h-6 md:h-8 w-3/4" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-16 md:h-20 w-full" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-24 md:h-32 w-full" />
    </div>
);

