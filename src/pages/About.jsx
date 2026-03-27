import { useNavigate } from 'react-router-dom'
import styles from './About.module.css'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.noise} />
      <div className={styles.container}>

        <button className={styles.back} onClick={() => navigate('/')}>
          ← Back
        </button>

        <header className={styles.header}>
          <div className={styles.tag}>ABOUT</div>
          <h1 className={styles.title}>THE<br />CREATOR</h1>
        </header>

        <div className={styles.bio}>
          <p>
            {/* ✏️ Replace this with your own bio */}
            Hey, I'm [Your Name]. I make content about math, money, and the stuff
            nobody bothers to calculate. This calculator came out of a YouTube video
            where I did the actual math on whether driving for cheaper gas is worth it.
          </p>
        </div>

        <div className={styles.links}>

          {/* ✏️ Replace href with your YouTube channel URL */}
          <a
            className={styles.linkCard}
            href="https://youtube.com/@yourchannel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.linkIcon}>▶</div>
            <div className={styles.linkText}>
              <div className={styles.linkTitle}>YouTube</div>
              <div className={styles.linkSub}>Watch the video that built this</div>
            </div>
            <div className={styles.linkArrow}>↗</div>
          </a>

          {/* ✏️ Replace href with your portfolio URL — or remove this card if not ready yet */}
          <a
            className={styles.linkCard}
            href="https://yourportfolio.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.linkIcon}>◈</div>
            <div className={styles.linkText}>
              <div className={styles.linkTitle}>Portfolio</div>
              <div className={styles.linkSub}>More of my work</div>
            </div>
            <div className={styles.linkArrow}>↗</div>
          </a>

          {/* ✏️ Add more cards here if needed — copy the pattern above */}

        </div>

        <div className={styles.formula}>
          <div className={styles.formulaLabel}>THE MATH</div>
          <div className={styles.formulaLine}>P₁ = (Tₕ − T꜀ − R·D₁/MPG) × G₁</div>
          <div className={styles.formulaLine}>P₂ = (Tₕ − T꜀ − R·D₂/MPG) × G₂</div>
          <div className={styles.formulaLine}>Savings = P₁ − P₂</div>
        </div>

        <footer className={styles.footer}>
          <p>Built from a whiteboard. No subscriptions. No ads.</p>
        </footer>

      </div>
    </div>
  )
}
