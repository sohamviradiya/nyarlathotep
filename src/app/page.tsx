import styles from "@/app/page.module.css";
import { UserSearch } from "@/components/usersearch.main";

export default function Home() {
    return (
        <main className={styles.main}>
            <h1 style={{backgroundColor: "darkblue", padding: "2rem"}}>
                Welcome To NyarlaThotep 
            </h1>
            <UserSearch />
        </main>
    )
}
