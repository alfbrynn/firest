// src/app/page.tsx
import Link from "next/link";
import { Leaf } from "lucide-react";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.iconWrapper}>
        <Leaf className={styles.icon} />
      </div>
      <h1 className={styles.title}>
        Selamat Datang di <span className={styles.brand}>Firest</span>
      </h1>
      <p className={styles.description}>
        Gamifikasi finansial yang mengubah setiap transaksimu menjadi hutan virtual yang menenangkan.
      </p>
      <Link href="/login" className={styles.ctaButton}>
        Mulai Perjalananmu
      </Link>
    </div>
  );
}