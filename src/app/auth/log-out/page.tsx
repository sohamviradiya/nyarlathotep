import { useRouter } from "next/navigation";
import { Metadata } from "next";
import ThemeHydrator from "@/components/mui/theme";

function LogoutComponent() {
    const router = useRouter();
    return (
        <div>
            <h1>Are you sure you want to log out?</h1>
            <button onClick={() => {
                localStorage.removeItem("email");
                localStorage.removeItem("token");
                router.push("/");
            }}>Yes</button>
            <button onClick={() => {
                router.push("/");
            }}>No</button>
        </div>
    )
};


export const metadata: Metadata = {
    title: "Log In",
    description: "Log In Page for NyarlaThotep",
};

export default function Logout() {
    return (
        <ThemeHydrator>
            <LogoutComponent />
        </ThemeHydrator>
    );
}