import { CommunitySearch } from "@/components/community/search.community";
import { Metadata } from "next";

export default function Home() {
    return (
        <main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "20vh", flexDirection: "column", justifyContent: "top" }}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Find Communities
            </h1>
            <CommunitySearch />
        </main>
    )
}
export const metadata: Metadata = {
    title: "NyarlaThotep Community Search",
    description: "A social media platform",
};
