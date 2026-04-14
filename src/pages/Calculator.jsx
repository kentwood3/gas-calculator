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
  fillType: 'dollars',
  fillAmount: '',
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
    const { G1, G2, D1, D2, MPG, R, fillType, fillAmount } = values
    const nums = { G1, G2, D1, D2, MPG, fillAmount }

    for (const [key, val] of Object.entries(nums)) {
      if (val === '' || isNaN(Number(val)) || Number(val) <= 0) {
        setError(`Please enter a valid value for ${key}.`)
        return
      }
    }

    const g1 = Number(G1)
    const g2 = Number(G2)
    const d1 = Number(D1)
    const d2 = Number(D2)
    const mpg = Number(MPG)
    const r = Number(R)
    const fill = Number(fillAmount)

    if (d2 <= d1) { setError('Further station must be farther than the closer one.'); return }

    // Gallons pumped at each station
    const gallonsPumpedCloser = fillType === 'dollars' ? fill / g1 : fill
    const gallonsPumpedFurther = fillType === 'dollars' ? fill / g2 : fill

    // Fuel burned driving to each station (one way)
    const fuelToCloser = d1 / mpg
    const fuelToFurther = d2 / mpg

    // Fuel burned driving home (dedicated trip only)
    const fuelHomeCloser = r === 2 ? d1 / mpg : 0
    const fuelHomeFurther = r === 2 ? d2 / mpg : 0

    if (gallonsPumpedCloser - fuelToCloser <= 0) {
      setError("You'd burn more fuel getting to the closer station than you'd buy. Check your inputs.")
      return
    }
    if (gallonsPumpedFurther - fuelToFurther <= 0) {
      setError("You'd burn more fuel getting to the further station than you'd buy. Check your inputs.")
      return
    }

    // Gallons actually in tank when you get home
    const gallonsHomeCloser = gallonsPumpedCloser - fuelToCloser - fuelHomeCloser
    const gallonsHomeFurther = gallonsPumpedFurther - fuelToFurther - fuelHomeFurther

    if (gallonsHomeCloser <= 0) {
      setError("You'd burn all your gas before getting home from the closer station. Check your inputs.")
      return
    }
    if (gallonsHomeFurther <= 0) {
      setError("You'd burn all your gas before getting home from the further station. Check your inputs.")
      return
    }

    // Dollar cost at each station
    // For gallon input: cost = gallons pumped x price
    // For dollar input on one way: cost = (gallons pumped - fuel to get there) x price
    // For dollar input on dedicated trip: always equals fill amount (math cancels) so compare gallons home instead
    let costCloser, costFurther
    if (fillType === 'gallons') {
      costCloser = gallonsPumpedCloser * g1
      costFurther = gallonsPumpedFurther * g2
    } else {
      // one way: effective cost is what you spent minus what you burned getting there
      costCloser = (gallonsPumpedCloser - fuelToCloser) * g1
      costFurther = (gallonsPumpedFurther - fuelToFurther) * g2
    }

    const dollarSavings = costCloser - costFurther
    const gallonDiff = gallonsHomeFurther - gallonsHomeCloser

    // Determine primary comparison metric
    // Dollar input + dedicated trip = gallons home is the meaningful metric
    // Everything else = dollar comparison is meaningful
    const useDedicatedDollar = fillType === 'dollars' && r === 2

    setResult({
      costCloser: costCloser.toFixed(2),
      costFurther: costFurther.toFixed(2),
      gallonsHomeCloser: gallonsHomeCloser.toFixed(2),
      gallonsHomeFurther: gallonsHomeFurther.toFixed(2),
      dollarSavings: dollarSavings.toFixed(2),
      gallonDiff: gallonDiff.toFixed(3),
      useDedicatedDollar,
      fillType,
      r,
    })
    setError('')
  }

  const reset = () => {
    setValues(defaultState)
    setResult(null)
    setError('')
  }

  return (
    <div className={styles.page}>
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
                : 'Making a special trip — drive home cost included.'}
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
        {result && <ResultCard result={result} />}

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

function ResultCard({ result }) {
  const {
    costCloser, costFurther,
    gallonsHomeCloser, gallonsHomeFurther,
    dollarSavings, gallonDiff,
    useDedicatedDollar,
  } = result

  const furtherWinsDollars = Number(dollarSavings) > 0
  const furtherWinsGallons = Number(gallonDiff) > 0

  // For dedicated dollar trips, winner is determined by gallons home
  const furtherWins = useDedicatedDollar ? furtherWinsGallons : furtherWinsDollars

  return (
    <div className={`${styles.result} ${furtherWins ? styles.resultGood : styles.resultBad}`}>

      <div className={styles.resultVerdict}>
        {furtherWins ? '✓ FURTHER STATION WINS' : '✗ CLOSER STATION WINS'}
      </div>

      {/* Primary metric */}
      {useDedicatedDollar ? (
        <div className={styles.resultSavings}>
          {furtherWins
            ? `+${gallonDiff} gal more at home`
            : `${Math.abs(Number(gallonDiff)).toFixed(3)} gal less at home`}
        </div>
      ) : (
        <div className={styles.resultSavings}>
          {furtherWins
            ? `You save $${dollarSavings}`
            : `You lose $${Math.abs(Number(dollarSavings)).toFixed(2)}`}
        </div>
      )}

      {/* Breakdown */}
      <div className={styles.resultBreakdown}>

        <div className={styles.breakdownHeader}>CLOSER STATION</div>
        <div className={styles.breakdownItem}>
          <span>Total cost</span>
          <span>${costCloser}</span>
        </div>
        <div className={styles.breakdownItem}>
          <span>Gallons when home</span>
          <span>{gallonsHomeCloser} gal</span>
        </div>

        <div className={styles.breakdownDivider} />

        <div className={styles.breakdownHeader}>FURTHER STATION</div>
        <div className={styles.breakdownItem}>
          <span>Total cost</span>
          <span>${costFurther}</span>
        </div>
        <div className={styles.breakdownItem}>
          <span>Gallons when home</span>
          <span>{gallonsHomeFurther} gal</span>
        </div>

      </div>

      <p className={styles.resultNote}>
        {useDedicatedDollar
          ? 'Dollar cost is the same either way on a dedicated trip — gallons home is what matters.'
          : 'Totals include fuel burned driving to each station.'}
      </p>
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
