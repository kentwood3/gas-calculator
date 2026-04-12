import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Calculator.module.css'

const defaultState = {
  G1: '',
  G2: '',
  D1: '',
  D2: '',
  MPG: '',
  R: '1',
  filltype: 'dollars',
  fillamount: '',
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
    const { G1, G2, D1, D2, MPG, R, filltype, fillamount } = values
    const nums = { G1, G2, D1, D2, MPG, fillamount }

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

    const fill = Number(fillAmount)
    const gallonsAtCloser = fillType === 'dollars' ? fill / g1 : fill
    const gallonsAtFurther = fillType === 'dollars' ? fill / g2 : fill

    let P1, P2

    if (r === 1) {
     // One way
     P1 = (gallonsAtCloser - (d1 / mpg)) * g1
     P2 = (gallonsAtFurther - (d2 / mpg)) * g2
}   else {
      // Dedicated round trip
     P1 = (gallonsAtCloser - (d1 / mpg)) * g1 + (d1 / mpg) * g1
     P2 = (gallonsAtFurther - (d2 / mpg)) * g2 + (d2 / mpg) * g2
}

    if (gallonsAtCloser - (d1 / mpg) <= 0) {
      setError("You'd burn more fuel getting to the closer station than you'd buy. Check your inputs.")
      return
    }

    if (gallonsAtFurther - (d2 / mpg) <= 0) {
      setError("You'd burn more fuel getting to the further station than you'd buy. Check your inputs.")
      return
    }

    const savings = P1 - P2 // positive = further is cheaper
    const gallonsHomeCloser = r === 1 ? gallonsAtCloser - (d1 / mpg) : gallonsAtCloser - (d2 / mpg)
    const gallonsHomeFurther = r === 1 ? gallonsAtFurther - (d2 / mpg) : gallonsAtFurther - (d2 / mpg)

    setResult({ 
      P1: P1.toFixed(2), 
     P2: P2.toFixed(2), 
     savings: savings.toFixed(2),
     gallonsHomeCloser: gallonsHomeCloser.toFixed(2),
     gallonsHomeFurther: gallonsHomeFurther.toFixed(2),
}) 
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

          {/* Fill Amount */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>FILL AMOUNT</div>
            <div className={styles.toggle}>
              <button
             className={`${styles.toggleBtn} ${values.fillType === 'dollars' ? styles.toggleActive : ''}`}
            onClick={() => setValues(prev => ({ ...prev, fillType: 'dollars', fillAmount: '' }))}
    >
               Dollar Amount
              </button>
              <button
               className={`${styles.toggleBtn} ${values.fillType === 'gallons' ? styles.toggleActive : ''}`}
               onClick={() => setValues(prev => ({ ...prev, fillType: 'gallons', fillAmount: '' }))}
    >
               Gallon Amount
              </button>
  </div>
  <InputField
    label={values.fillType === 'dollars' ? 'How much are you spending?' : 'How many gallons?'}
    name="fillAmount"
    value={values.fillAmount}
    onChange={handleChange}
    prefix={values.fillType === 'dollars' ? '$' : undefined}
    suffix={values.fillType === 'gallons' ? 'gal' : undefined}
    placeholder={values.fillType === 'dollars' ? '20.00' : '10'}
    wide
  />
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
           <div className={styles.resultBreakdown}>
             <div className={styles.breakdownItem}>
              <span>Closer station total</span>
              <span>${result.P1}</span>
           </div>
           <div className={styles.breakdownItem}>
             <span>Closer station gallons home</span>
             <span>{result.gallonsHomeCloser} gal</span>
           </div>
           <div className={styles.breakdownItem}>
             <span>Further station total</span>
             <span>${result.P2}</span>
  </div>
  <div className={styles.breakdownItem}>
    <span>Further station gallons home</span>
    <span>{result.gallonsHomeFurther} gal</span>
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
