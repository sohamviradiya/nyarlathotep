import SignUp from "@/components/sign-up.form";
import { Metadata, ResolvingMetadata } from "next";

export default function Home() {
    return (
        <main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "20vh", flexDirection: "column", justifyContent: "top" }}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Sign Up
            </h1>
            <SignUp />
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
        title: "Sign Up",
        description: "Sign Up Page for NyarlaThotep",
    };
};