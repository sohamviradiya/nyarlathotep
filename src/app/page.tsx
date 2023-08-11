import { Metadata, ResolvingMetadata } from "next";

export default function Home() {
    return (
        <main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "10vh", flexDirection: "column", justifyContent: "top" }}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Welcome To NyarlaThotep
            </h1>
            <h2 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Join Various Communities
            </h2>
            <h2 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Connect With Other Users
            </h2>
        </main>
    )
}


export const metadata: Metadata = {
    title: "NyarlaThotep",
    description: "A social media platform",
};

