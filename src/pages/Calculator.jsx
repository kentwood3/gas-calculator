import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Calculator.module.css'

const defaultState = {
  G1: '',
  G2: '',
  D1: '',
  D2: '',
  Th: '',
  Tc: '',
  MPG: '',
  R: '1',
}

export default function Calculator() {
  const [values, setValues] = useState(defaultState)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setResult(null)
    setError('')
  }

  const handleTrip = (val) => {
    setValues((prev) => ({ ...prev, R: val }))
    setResult(null)
  }

  const calculate = () => {
    const { G1, G2, D1, D2, Th, Tc, MPG, R } = values
    const nums = { G1, G2, D1, D2, Th, Tc, MPG }

    for (const [key, val] of Object.entries(nums)) {
      if (val === '' || isNaN(Number(val)) || Number(val) < 0) {
        setError(`Please enter a valid value for ${key}.`)
        return
      }
    }

    const g1 = Number(G1)
    const g2 = Number(G2)
    const d1 = Number(D1)
    const d2 = Number(D2)
    const th = Number(Th)
    const tc = Number(Tc)
    const mpg = Number(MPG)
    const r = Number(R)

    if (mpg === 0) { setError('MPG cannot be zero.'); return }
    if (tc >= th) { setError('Current fuel must be less than tank capacity.'); return }
    if (d2 <= d1) { setError('Further station must be farther than the closer one.'); return }

    const gallonsNeeded = th - tc

let P1, P2

if (r === 1) {
  // One way — subtract fuel burned getting there
  P1 = (gallonsNeeded - (d1 / mpg)) * g1
  P2 = (gallonsNeeded - (d2 / mpg)) * g2
} else {
  // Dedicated round trip — buy back fuel burned getting there, subtract cost of drive home
  P1 = (gallonsNeeded - (d1 / mpg)) * g1 - (d1 / mpg) * g1
  P2 = (gallonsNeeded - (d2 / mpg)) * g2 - (d2 / mpg) * g2
}

    if (gallonsNeeded - (d1 / mpg) <= 0) {
      setError("You'd burn more fuel getting to the closer station than you'd buy. Check your inputs.")
      return
    }

    if (gallonsNeeded - (d2 / mpg) <= 0) {
      setError("You'd burn more fuel getting to the further station than you'd buy. Check your inputs.")
      return
    }

    const savings = P1 - P2 // positive = further is cheaper

    setResult({ P1: P1.toFixed(2), P2: P2.toFixed(2), savings: savings.toFixed(2) })
    setError('')
  }

  const reset = () => {
    setValues(defaultState)
    setResult(null)
    setError('')
  }

  const hasSavings = result && Number(result.savings) > 0

  return (
    <div className={styles.page}>
      {/* Noise texture overlay */}
      <div className={styles.noise} />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.tag}>FUEL OPTIMIZER</div>
          <h1 className={styles.title}>GAS<br />CALC</h1>
          <p className={styles.subtitle}>Is the drive worth it?</p>
        </header>

        {/* Form */}
        <div className={styles.form}>

          {/* Gas Prices */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>GAS PRICES <span>/ per gallon</span></div>
            <div className={styles.row}>
              <InputField
                label="Closer Station"
                name="G1"
                value={values.G1}
                onChange={handleChange}
                prefix="$"
                placeholder="3.49"
              />
              <InputField
                label="Further Station"
                name="G2"
                value={values.G2}
                onChange={handleChange}
                prefix="$"
                placeholder="3.29"
              />
            </div>
          </div>

          {/* Distances */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>DISTANCE <span>/ miles</span></div>
            <div className={styles.row}>
              <InputField
                label="To Closer Station"
                name="D1"
                value={values.D1}
                onChange={handleChange}
                suffix="mi"
                placeholder="1.2"
              />
              <InputField
                label="To Further Station"
                name="D2"
                value={values.D2}
                onChange={handleChange}
                suffix="mi"
                placeholder="4.5"
              />
            </div>
          </div>

          {/* Tank */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>YOUR TANK <span>/ gallons</span></div>
            <div className={styles.row}>
              <InputField
                label="Tank Capacity"
                name="Th"
                value={values.Th}
                onChange={handleChange}
                suffix="gal"
                placeholder="14"
              />
              <InputField
                label="Current Fuel"
                name="Tc"
                value={values.Tc}
                onChange={handleChange}
                suffix="gal"
                placeholder="3"
              />
            </div>
          </div>

          {/* MPG */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>YOUR CAR</div>
            <InputField
              label="Miles Per Gallon"
              name="MPG"
              value={values.MPG}
              onChange={handleChange}
              suffix="mpg"
              placeholder="28"
              wide
            />
          </div>

          {/* Trip Type */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>TRIP TYPE</div>
            <div className={styles.toggle}>
              <button
                className={`${styles.toggleBtn} ${values.R === '1' ? styles.toggleActive : ''}`}
                onClick={() => handleTrip('1')}
              >
                On My Way
              </button>
              <button
                className={`${styles.toggleBtn} ${values.R === '2' ? styles.toggleActive : ''}`}
                onClick={() => handleTrip('2')}
              >
                Dedicated Trip
              </button>
            </div>
            <p className={styles.toggleHint}>
              {values.R === '1'
                ? 'Station is on your route — one-way distance used.'
                : 'Making a special trip — distance is doubled.'}
            </p>
          </div>

          {/* Error */}
          {error && <div className={styles.error}>{error}</div>}

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.calcBtn} onClick={calculate}>
              Calculate
            </button>
            <button className={styles.resetBtn} onClick={reset}>
              Reset
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`${styles.result} ${hasSavings ? styles.resultGood : styles.resultBad}`}>
            <div className={styles.resultVerdict}>
              {hasSavings ? '✓ WORTH THE DRIVE' : '✗ STAY CLOSER'}
            </div>
            <div className={styles.resultSavings}>
              {hasSavings
                ? `You save $${result.savings}`
                : `You lose $${Math.abs(Number(result.savings)).toFixed(2)}`}
            </div>
            <div className={styles.resultBreakdown}>
              <div className={styles.breakdownItem}>
                <span>Closer station total</span>
                <span>${result.P1}</span>
              </div>
              <div className={styles.breakdownItem}>
                <span>Further station total</span>
                <span>${result.P2}</span>
              </div>
            </div>
            <p className={styles.resultNote}>
              Totals include fuel burned driving to each station.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          <button className={styles.aboutBtn} onClick={() => navigate('/about')}>
            About
          </button>
        </footer>
      </div>
    </div>
  )
}

function InputField({ label, name, value, onChange, prefix, suffix, placeholder, wide }) {
  return (
    <div className={`${styles.inputWrap} ${wide ? styles.inputWide : ''}`}>
      <label className={styles.inputLabel}>{label}</label>
      <div className={styles.inputInner}>
        {prefix && <span className={styles.inputAffix}>{prefix}</span>}
        <input
          className={styles.input}
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min="0"
          step="any"
        />
        {suffix && <span className={styles.inputAffix}>{suffix}</span>}
      </div>
    </div>
  )
}
