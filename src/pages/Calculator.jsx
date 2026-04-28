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
  const [choice, setChoice] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setResult(null)
    setError('')
    setChoice(null)
  }

  const handleTrip = (val) => {
    setValues((prev) => ({ ...prev, R: val }))
    setResult(null)
    setChoice(null)
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

    // Fuel burned driving to each station
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

    // Gallons in tank when home
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

    const isDedicatedDollar = fillType === 'dollars' && r === 2

    // Dollar cost at each station
    let costCloser, costFurther
    if (isDedicatedDollar) {
      costCloser = fill
      costFurther = fill
    } else if (fillType === 'dollars') {
      costCloser = (gallonsPumpedCloser - fuelToCloser) * g1
      costFurther = (gallonsPumpedFurther - fuelToFurther) * g2
    } else {
      costCloser = gallonsPumpedCloser * g1
      costFurther = gallonsPumpedFurther * g2
    }

    const dollarSavings = costCloser - costFurther // positive = further wins
    const gallonDiff = gallonsHomeFurther - gallonsHomeCloser // positive = further wins

    // Winner
    const furtherWins = isDedicatedDollar
      ? gallonsHomeFurther > gallonsHomeCloser
      : dollarSavings > 0

    // Quantify the gallon difference in dollars using winner's price
    const winnerPrice = furtherWins ? g2 : g1
    const gallonDiffDollars = Math.abs(gallonDiff) * winnerPrice

    setResult({
      costCloser: costCloser.toFixed(2),
      costFurther: costFurther.toFixed(2),
      gallonsHomeCloser: gallonsHomeCloser.toFixed(3),
      gallonsHomeFurther: gallonsHomeFurther.toFixed(3),
      dollarSavings: Math.abs(dollarSavings).toFixed(2),
      gallonDiff: Math.abs(gallonDiff).toFixed(3),
      gallonDiffDollars: gallonDiffDollars.toFixed(2),
      furtherWins,
      isDedicatedDollar,
      isOneWay: r === 1,
    })
    setError('')
    setChoice(null)
  }

  const reset = () => {
    setValues(defaultState)
    setResult(null)
    setError('')
    setChoice(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.noise} />
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.tag}>FUEL OPTIMIZER</div>
          <h1 className={styles.title}>GAS<br />CALC</h1>
          <p className={styles.subtitle}>Is the drive worth it?</p>
        </header>

        <div className={styles.form}>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>GAS PRICES <span>/ per gallon</span></div>
            <div className={styles.row}>
              <InputField label="Closer Station" name="G1" value={values.G1} onChange={handleChange} prefix="$" placeholder="3.49" />
              <InputField label="Further Station" name="G2" value={values.G2} onChange={handleChange} prefix="$" placeholder="3.29" />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>DISTANCE <span>/ miles</span></div>
            <div className={styles.row}>
              <InputField label="To Closer Station" name="D1" value={values.D1} onChange={handleChange} suffix="mi" placeholder="1.2" />
              <InputField label="To Further Station" name="D2" value={values.D2} onChange={handleChange} suffix="mi" placeholder="4.5" />
            </div>
          </div>

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

          <div className={styles.section}>
            <div className={styles.sectionLabel}>YOUR CAR</div>
            <InputField label="Miles Per Gallon" name="MPG" value={values.MPG} onChange={handleChange} suffix="mpg" placeholder="28" wide />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>TRIP TYPE</div>
            <div className={styles.toggle}>
              <button className={`${styles.toggleBtn} ${values.R === '1' ? styles.toggleActive : ''}`} onClick={() => handleTrip('1')}>
                On My Way
              </button>
              <button className={`${styles.toggleBtn} ${values.R === '2' ? styles.toggleActive : ''}`} onClick={() => handleTrip('2')}>
                Dedicated Trip
              </button>
            </div>
            <p className={styles.toggleHint}>
              {values.R === '1' ? 'Station is on your route — one-way distance used.' : 'Making a special trip — drive home cost included.'}
            </p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button className={styles.calcBtn} onClick={calculate}>Calculate</button>
            <button className={styles.resetBtn} onClick={reset}>Reset</button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={styles.result}>

            <div className={styles.choiceLabel}>WHERE ARE YOU GOING?</div>

            <div className={styles.choiceRow}>
              {/* Closer Station Card */}
              <button
                className={`${styles.choiceBtn} ${choice === 'closer' ? styles.choiceSelected : ''}`}
                onClick={() => setChoice('closer')}
              >
                <div className={`${styles.choiceName} ${result.furtherWins ? styles.loser : styles.winner}`}>
                  Closer Station
                </div>
                <div className={styles.choiceStats}>
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Cost</span>
                    <span className={styles.choiceStatValue}>${result.costCloser}</span>
                  </div>
                  {!result.isOneWay && (
                    <div className={styles.choiceStat}>
                      <span className={styles.choiceStatLabel}>Gal home</span>
                      <span className={styles.choiceStatValue}>{result.gallonsHomeCloser}</span>
                    </div>
                  )}
                  {!result.furtherWins && (
                    <div className={styles.choiceDiff}>
                      {result.isDedicatedDollar
                        ? `+${result.gallonDiff} gal / +$${result.gallonDiffDollars} more`
                        : `$${result.dollarSavings} cheaper`}
                    </div>
                  )}
                </div>
              </button>

              {/* Further Station Card */}
              <button
                className={`${styles.choiceBtn} ${choice === 'further' ? styles.choiceSelected : ''}`}
                onClick={() => setChoice('further')}
              >
                <div className={`${styles.choiceName} ${result.furtherWins ? styles.winner : styles.loser}`}>
                  Further Station
                </div>
                <div className={styles.choiceStats}>
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Cost</span>
                    <span className={styles.choiceStatValue}>${result.costFurther}</span>
                  </div>
                  {!result.isOneWay && (
                    <div className={styles.choiceStat}>
                      <span className={styles.choiceStatLabel}>Gal home</span>
                      <span className={styles.choiceStatValue}>{result.gallonsHomeFurther}</span>
                    </div>
                  )}
                  {result.furtherWins && (
                    <div className={styles.choiceDiff}>
                      {result.isDedicatedDollar
                        ? `+${result.gallonDiff} gal / +$${result.gallonDiffDollars} more`
                        : `$${result.dollarSavings} cheaper`}
                    </div>
                  )}
                </div>
              </button>
            </div>

            {choice && (
              <p className={styles.choiceConfirm}>
                {choice === 'closer' ? '← Closer station it is.' : 'Further station it is. →'}
              </p>
            )}

            {result.isDedicatedDollar && (
              <p className={styles.resultNote}>
                Both options cost ${result.costCloser} — gallons home is what differs.
              </p>
            )}

          </div>
        )}

        <footer className={styles.footer}>
          <button className={styles.aboutBtn} onClick={() => navigate('/about')}>About</button>
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
<button className={styles.aboutBtn} onClick={() => navigate('/transit')}>
  Drive vs Transit
</button>