"use client";

import { User_Public } from "@/server/user/user.module";
import CommunityList from "./community-list.profile";
import { Community_Public } from "@/server/community/community.module";

export default function UserInfo({ user }: { user: User_Public }) {
    return (<>
        <div style={{ backgroundColor: "darkblue", padding: "2rem", width: "70%" }}>
            <h2>{user.name}</h2>
            <h3>{user.email}</h3>
            <h3>{user.bio}</h3>
            <h4>{user.address}</h4>
            <h5> Last Online: {(new Date(user.last_online)).toLocaleString()}</h5>
        </div>
        <div style={{ backgroundColor: "darkblue", padding: "2rem", width: "70%" }}>
            <h2>Communities: </h2>
            <CommunityList communities={user.communities as Community_Public[]} />
        </div>
    </>);
}