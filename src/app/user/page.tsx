import { CommunitySearch } from "@/components/search.community";
import { UserSearch } from "@/components/search.user";
import { Metadata, ResolvingMetadata } from "next";

export default function Home() {
    return (
        <main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "20vh", flexDirection: "column", justifyContent: "top" }}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Find Users
            </h1>
            <UserSearch />
        </main>
    )
}

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent?: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: "Search for Users",
        description: "Search for Users",
    };
};