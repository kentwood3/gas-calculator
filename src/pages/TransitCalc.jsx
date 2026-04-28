import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './TransitCalc.module.css'

const defaultState = {
  // Drive inputs
  miles: '',
  mpg: '',
  gasPrice: '',
  parking: '',
  tolls: '',
  driveTime: '',
  driveTimeUnit: 'minutes',
  // Transit inputs
  transitTime: '',
  transitTimeUnit: 'minutes',
  transfers: '',
  // Shared
  hourlyValue: '',
  tickets: [{ id: 1, label: 'Ticket', cost: '' }],
}

export default function TransitCalc() {
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

  const handleUnit = (field, val) => {
    setValues((prev) => ({ ...prev, [field]: val }))
    setResult(null)
  }

  const addTicket = () => {
    setValues((prev) => ({
      ...prev,
      tickets: [...prev.tickets, { id: Date.now(), label: '', cost: '' }],
    }))
    setResult(null)
  }

  const removeTicket = (id) => {
    setValues((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((t) => t.id !== id),
    }))
    setResult(null)
  }

  const updateTicket = (id, field, value) => {
    setValues((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => t.id === id ? { ...t, [field]: value } : t),
    }))
    setResult(null)
  }

  const toHours = (value, unit) => unit === 'minutes' ? Number(value) / 60 : Number(value)

  const calculate = () => {
    const { miles, mpg, gasPrice, parking, tolls, driveTime, driveTimeUnit,
      transitTime, transitTimeUnit, transfers, hourlyValue, tickets } = values

    const required = { miles, mpg, gasPrice, driveTime, transitTime, hourlyValue }
    for (const [key, val] of Object.entries(required)) {
      if (val === '' || isNaN(Number(val)) || Number(val) < 0) {
        setError(`Please enter a valid value for ${key}.`)
        return
      }
    }

    if (tickets.some(t => t.cost === '' || isNaN(Number(t.cost)) || Number(t.cost) < 0)) {
      setError('Please enter valid costs for all ticket legs.')
      return
    }

    if (Number(mpg) === 0) { setError('MPG cannot be zero.'); return }

    const m = Number(miles)
    const mpgN = Number(mpg)
    const gp = Number(gasPrice)
    const park = Number(parking) || 0
    const toll = Number(tolls) || 0
    const driveHrs = toHours(driveTime, driveTimeUnit)
    const transitHrs = toHours(transitTime, transitTimeUnit)
    const hrVal = Number(hourlyValue)
    const transferCount = Number(transfers) || 0
    const totalTickets = tickets.reduce((sum, t) => sum + Number(t.cost), 0)

    // Gas cost for drive
    const gasCost = (m / mpgN) * gp

    // Drive effective cost = gas + parking + tolls + time cost (time lost)
    const driveTimeCost = driveHrs * hrVal
    const driveTotalCost = gasCost + park + toll + driveTimeCost

    // Transit effective cost = tickets - time value gained + transfer friction
    // Each transfer adds some friction — we use 15 min per transfer as friction cost
    const transferFriction = transferCount * (15 / 60) * hrVal
    const transitTimeValue = transitHrs * hrVal
    const transitTotalCost = totalTickets - transitTimeValue + transferFriction

    const savings = driveTotalCost - transitTotalCost // positive = transit wins

    const transitWins = savings > 0

    setResult({
      // Drive breakdown
      gasCost: gasCost.toFixed(2),
      driveTimeCost: driveTimeCost.toFixed(2),
      driveTotalCost: driveTotalCost.toFixed(2),
      driveHrs: driveHrs.toFixed(1),
      park: park.toFixed(2),
      toll: toll.toFixed(2),
      // Transit breakdown
      totalTickets: totalTickets.toFixed(2),
      transitTimeValue: transitTimeValue.toFixed(2),
      transitTotalCost: transitTotalCost.toFixed(2),
      transitHrs: transitHrs.toFixed(1),
      transferFriction: transferFriction.toFixed(2),
      // Comparison
      savings: Math.abs(savings).toFixed(2),
      transitWins,
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
          <div className={styles.tag}>DRIVE OPTIMIZER</div>
          <h1 className={styles.title}>DRIVE<br />VS<br />TRANSIT</h1>
          <p className={styles.subtitle}>What's your time actually worth?</p>
        </header>

        <div className={styles.form}>

          {/* Drive Section */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>🚗 DRIVING</div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>ROUTE</div>
              <div className={styles.row}>
                <InputField label="Miles" name="miles" value={values.miles} onChange={handleChange} suffix="mi" placeholder="45" />
                <InputField label="Your MPG" name="mpg" value={values.mpg} onChange={handleChange} suffix="mpg" placeholder="28" />
              </div>
              <InputField label="Gas Price" name="gasPrice" value={values.gasPrice} onChange={handleChange} prefix="$" placeholder="3.99" wide />
            </div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>EXTRA COSTS <span>/ optional</span></div>
              <div className={styles.row}>
                <InputField label="Parking" name="parking" value={values.parking} onChange={handleChange} prefix="$" placeholder="0" />
                <InputField label="Tolls" name="tolls" value={values.tolls} onChange={handleChange} prefix="$" placeholder="0" />
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>DRIVE TIME</div>
              <div className={styles.toggle}>
                <button className={`${styles.toggleBtn} ${values.driveTimeUnit === 'minutes' ? styles.toggleActive : ''}`} onClick={() => handleUnit('driveTimeUnit', 'minutes')}>Minutes</button>
                <button className={`${styles.toggleBtn} ${values.driveTimeUnit === 'hours' ? styles.toggleActive : ''}`} onClick={() => handleUnit('driveTimeUnit', 'hours')}>Hours</button>
              </div>
              <InputField
                label={`How long is the drive? (${values.driveTimeUnit})`}
                name="driveTime"
                value={values.driveTime}
                onChange={handleChange}
                suffix={values.driveTimeUnit === 'minutes' ? 'min' : 'hrs'}
                placeholder={values.driveTimeUnit === 'minutes' ? '45' : '1.5'}
                wide
              />
            </div>
          </div>

          {/* Transit Section */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>🚌 TRANSIT</div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>TICKET LEGS</div>
              {values.tickets.map((ticket, index) => (
                <div key={ticket.id} className={styles.ticketRow}>
                  <input
                    className={styles.ticketLabel}
                    type="text"
                    placeholder={`Leg ${index + 1} (e.g. Bus, Train)`}
                    value={ticket.label}
                    onChange={(e) => updateTicket(ticket.id, 'label', e.target.value)}
                  />
                  <div className={styles.ticketCostWrap}>
                    <span className={styles.inputAffix}>$</span>
                    <input
                      className={styles.ticketCost}
                      type="number"
                      placeholder="0.00"
                      value={ticket.cost}
                      min="0"
                      step="any"
                      onChange={(e) => updateTicket(ticket.id, 'cost', e.target.value)}
                    />
                  </div>
                  {values.tickets.length > 1 && (
                    <button className={styles.removeBtn} onClick={() => removeTicket(ticket.id)}>✕</button>
                  )}
                </div>
              ))}
              <button className={styles.addBtn} onClick={addTicket}>+ Add Leg</button>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>TRANSIT TIME <span>/ free time you gain</span></div>
              <div className={styles.toggle}>
                <button className={`${styles.toggleBtn} ${values.transitTimeUnit === 'minutes' ? styles.toggleActive : ''}`} onClick={() => handleUnit('transitTimeUnit', 'minutes')}>Minutes</button>
                <button className={`${styles.toggleBtn} ${values.transitTimeUnit === 'hours' ? styles.toggleActive : ''}`} onClick={() => handleUnit('transitTimeUnit', 'hours')}>Hours</button>
              </div>
              <InputField
                label={`How long is the transit trip? (${values.transitTimeUnit})`}
                name="transitTime"
                value={values.transitTime}
                onChange={handleChange}
                suffix={values.transitTimeUnit === 'minutes' ? 'min' : 'hrs'}
                placeholder={values.transitTimeUnit === 'minutes' ? '60' : '1'}
                wide
              />
            </div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>TRANSFERS <span>/ optional</span></div>
              <InputField label="Number of transfers or layovers" name="transfers" value={values.transfers} onChange={handleChange} suffix="stops" placeholder="0" wide />
              <p className={styles.toggleHint}>Each transfer adds ~15 min of friction to transit cost.</p>
            </div>
          </div>

          {/* Shared */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>YOUR TIME VALUE</div>
            <InputField label="What's your free time worth per hour?" name="hourlyValue" value={values.hourlyValue} onChange={handleChange} prefix="$" suffix="/hr" placeholder="15" wide />
            <p className={styles.toggleHint}>This is used to calculate what you gain by not driving. Even minimum wage works.</p>
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
            <div className={styles.choiceLabel}>WHAT ARE YOU DOING?</div>
            <div className={styles.choiceRow}>

              {/* Drive Card */}
              <button
                className={`${styles.choiceBtn} ${choice === 'drive' ? styles.choiceSelected : ''}`}
                onClick={() => setChoice('drive')}
              >
                <div className={`${styles.choiceName} ${result.transitWins ? styles.loser : styles.winner}`}>
                  🚗 Drive
                </div>
                <div className={styles.choiceStats}>
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Gas cost</span>
                    <span className={styles.choiceStatValue}>${result.gasCost}</span>
                  </div>
                  {Number(result.park) > 0 && (
                    <div className={styles.choiceStat}>
                      <span className={styles.choiceStatLabel}>Parking</span>
                      <span className={styles.choiceStatValue}>${result.park}</span>
                    </div>
                  )}
                  {Number(result.toll) > 0 && (
                    <div className={styles.choiceStat}>
                      <span className={styles.choiceStatLabel}>Tolls</span>
                      <span className={styles.choiceStatValue}>${result.toll}</span>
                    </div>
                  )}
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Time lost</span>
                    <span className={styles.choiceStatValue}>{result.driveHrs} hrs</span>
                  </div>
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Time cost</span>
                    <span className={styles.choiceStatValue}>${result.driveTimeCost}</span>
                  </div>
                  <div className={styles.choiceDivider} />
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Effective cost</span>
                    <span className={styles.choiceStatValue}>${result.driveTotalCost}</span>
                  </div>
                  {!result.transitWins && (
                    <div className={styles.choiceDiff}>✓ ${result.savings} cheaper</div>
                  )}
                </div>
              </button>

              {/* Transit Card */}
              <button
                className={`${styles.choiceBtn} ${choice === 'transit' ? styles.choiceSelected : ''}`}
                onClick={() => setChoice('transit')}
              >
                <div className={`${styles.choiceName} ${result.transitWins ? styles.winner : styles.loser}`}>
                  🚌 Transit
                </div>
                <div className={styles.choiceStats}>
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Ticket cost</span>
                    <span className={styles.choiceStatValue}>${result.totalTickets}</span>
                  </div>
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Free time gained</span>
                    <span className={styles.choiceStatValue}>{result.transitHrs} hrs</span>
                  </div>
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Time value</span>
                    <span className={styles.choiceStatValue}>-${result.transitTimeValue}</span>
                  </div>
                  {Number(result.transferFriction) > 0 && (
                    <div className={styles.choiceStat}>
                      <span className={styles.choiceStatLabel}>Transfer friction</span>
                      <span className={styles.choiceStatValue}>+${result.transferFriction}</span>
                    </div>
                  )}
                  <div className={styles.choiceDivider} />
                  <div className={styles.choiceStat}>
                    <span className={styles.choiceStatLabel}>Effective cost</span>
                    <span className={styles.choiceStatValue}>${result.transitTotalCost}</span>
                  </div>
                  {result.transitWins && (
                    <div className={styles.choiceDiff}>✓ ${result.savings} cheaper</div>
                  )}
                </div>
              </button>

            </div>

            {choice && (
              <p className={styles.choiceConfirm}>
                {choice === 'drive' ? '🚗 Hitting the road.' : '🚌 Taking transit — enjoy the free time.'}
              </p>
            )}

            <p className={styles.resultNote}>
              Effective cost includes the dollar value of your time. Transit time is subtracted because you get it back.
            </p>
          </div>
        )}

        <footer className={styles.footer}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>← Gas Calc</button>
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
