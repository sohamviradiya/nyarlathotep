"use client";
import { Community_Public } from "@/server/community/community.module";
import Link from "next/link";

export default function CommunityList({ communities } : { communities: Community_Public[] } ) {
    return (
        <>
            <ul>
                {(communities).map((community: Community_Public) => (
                    <li key={community.id}>
                        <Link href={`/community/${community.id}`}>
                            {community.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
};
