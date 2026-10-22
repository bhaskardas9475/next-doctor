import { getPatients } from "@/lib/db";
import styles from "./page.module.css";

export default function Home() {
  const patients = getPatients();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Next Doctor · SQLite</p>
        <h1>Patients</h1>
        <p className={styles.subtitle}>
          These records were retrieved on the server from a local SQLite database.
        </p>

        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Diagnosis</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.diagnosis}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        patient.status === "Stable"
                          ? styles.stable
                          : styles.review
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
