import SignUp from "@/components/form.sign-up";
import { Metadata, } from "next";

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

export const metadata: Metadata = {
        title: "Sign Up",
        description: "Sign Up Page for NyarlaThotep",
};