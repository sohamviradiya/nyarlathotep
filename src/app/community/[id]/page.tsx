import styles from "@/app/page.module.css";

export default function User({ params }: { params: { id: string } }) {
    return (
        <main className={styles.main}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem" }}>
                {decodeURIComponent(params.id)}
            </h1>
        </main>
    )
}