import Login from "@/components/form.log-in";
import SignUp from "@/components/form.sign-up";
import { Metadata, ResolvingMetadata } from "next";

export default function Home() {
    return (
        <main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "20vh", flexDirection: "column", justifyContent: "top" }}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Log in
            </h1>
            <Login />
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
        title: "Log In",
        description: "Log In Page for NyarlaThotep",
    };
};