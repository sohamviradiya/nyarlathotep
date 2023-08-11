import UserInfo from "@/components/user/info.user";
import SkeletonBundle from "@/components/skeleton-bundle";
import { User_Public } from "@/server/user/user.module";
import { useEffect, useState } from "react";
import ThemeHydrator from "@/components/mui/theme";

function UserComponent({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<User_Public>({} as User_Public);
    useEffect(() => {
        fetchUser({ id: params.id }).then((user) => setUser(user));
    }, [params.id]);
    return (<main style={{ height: "100vh", display: "flex", gap: "10vh", flexDirection: "column", justifyContent: "top", alignItems: "center" }} >
        <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "50%" }}>
            {`${decodeURIComponent(params.id)}'s Profile Page`}
        </h1>
        {(user.email) ? (
            <UserInfo user={user} />
        ) : (
            <SkeletonBundle size={3} />
        )}
    </main>
    );
}

export async function fetchUser({ id }: { id: string }): Promise<User_Public> {
    const res = await fetch(`/api/user/${id}`);
    const user = (await res.json()).payload.user;
    return user;
}

export default function ContactList({ params }: { params: { id: string } }) {
    return (
        <ThemeHydrator>
            <UserComponent params={params} />
        </ThemeHydrator>
    );
};