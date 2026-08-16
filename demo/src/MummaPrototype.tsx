import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'

type PageName = 'Welcome' | 'About you' | 'Baby Profile' | 'Sleep Coach' | 'Plan confirmation' | 'Today' | 'Sleep monitor' | 'Sleep Reminders' | 'Baby Journal' | 'More' | 'Sleep Research' | 'Data & Backup'
type NavPage = 'Today' | 'Sleep Coach' | 'Sleep Reminders' | 'Baby Journal' | 'More'

const protocol = 'mission-surface-prototype'
const version = 2
const prototypeKey = 'mumma-current'

const schedule = [
  ['7:00 am', 'Wake', 'Start the day with milk and natural light.'],
  ['9:15 am', 'Nap', 'Aim for 60–90 minutes.'],
  ['1:00 pm', 'Nap', 'Offer a calm wind-down before sleep.'],
  ['4:30 pm', 'Catnap', 'Keep this short to protect bedtime.'],
  ['7:30 pm', 'Bedtime', 'Milk, book, cuddle, then into bed.'],
]

export default function MummaPrototype() {
  const [page, setPage] = useState<PageName>('Welcome')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [baby, setBaby] = useState('')
  const [dob, setDob] = useState('')
  const [proposal, setProposal] = useState(false)
  const [planVersion, setPlanVersion] = useState(1)
  const [monitoring, setMonitoring] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [logs, setLogs] = useState<Array<{ type: string; quality: string; time: string }>>([])
  const [journalOpen, setJournalOpen] = useState(false)
  const [journal, setJournal] = useState('')
  const [saved, setSaved] = useState(false)
  const [dark, setDark] = useState(false)
  const viewport = useRef<HTMLElement>(null)

  const bridge = useMemo(() => {
    const query = new URLSearchParams(window.location.search)
    if (query.get('msProtocol') !== protocol || query.get('msVersion') !== String(version) || query.get('msPrototype') !== prototypeKey || !query.get('msChannel') || !query.get('msParentOrigin')) return null
    const parentOrigin = new URL(query.get('msParentOrigin')!).origin
    if (parentOrigin !== 'https://missionsurface.com' && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(parentOrigin)) return null
    return { channel: query.get('msChannel'), parentOrigin }
  }, [])

  useEffect(() => {
    if (!bridge) return
    const send = (type: 'ready' | 'page') => window.parent.postMessage({ protocol, version, channel: bridge.channel, prototypeKey, type, page }, bridge.parentOrigin)
    send('ready'); send('page')
    const timers = [250, 1000].map(delay => window.setTimeout(() => send('ready'), delay))
    return () => timers.forEach(window.clearTimeout)
  }, [bridge, page])

  useEffect(() => {
    if (!bridge || !viewport.current) return
    const element = viewport.current
    let frame: number | null = null
    const post = () => { frame = null; window.parent.postMessage({ protocol, version, channel: bridge.channel, prototypeKey, type: 'viewport', page, scrollX: element.scrollLeft, scrollY: element.scrollTop, viewportWidth: element.clientWidth, viewportHeight: element.clientHeight, documentWidth: element.scrollWidth, documentHeight: element.scrollHeight }, bridge.parentOrigin) }
    const schedulePost = () => { if (frame === null) frame = requestAnimationFrame(post) }
    element.addEventListener('scroll', schedulePost, { passive: true }); window.addEventListener('resize', schedulePost); schedulePost()
    return () => { element.removeEventListener('scroll', schedulePost); window.removeEventListener('resize', schedulePost); if (frame !== null) cancelAnimationFrame(frame) }
  }, [bridge, page])

  const go = (next: PageName) => { setPage(next); viewport.current?.scrollTo(0, 0) }
  const navPage: NavPage | null = page === 'Plan confirmation' || page === 'Baby Profile' || page === 'About you' || page === 'Welcome' || page === 'Sleep monitor' || page === 'Sleep Research' || page === 'Data & Backup' ? null : page

  return <main className={`mumma-stage ${dark ? 'mumma-dark' : ''}`}>
    <div className="mumma-disclosure"><strong>Simulated experience</strong><span>Fixture data · Nothing is saved</span></div>
    <article className="mumma-phone">
      <section className="mumma-scroll" ref={viewport}>
        {page === 'Welcome' && <RegistrationShell progress={1}>
          <h1>Welcome</h1><p className="mumma-lead">Start with your email address. This prototype stores it only on this device.</p>
          <form className="mumma-form" onSubmit={e => { e.preventDefault(); if (email) go('About you') }}><label>Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label><button>Continue</button></form>
          <p className="mumma-privacy">No password or email verification is required in this prototype.</p>
        </RegistrationShell>}

        {page === 'About you' && <RegistrationShell progress={2}>
          <button className="mumma-back" onClick={() => go('Welcome')}>← Back</button><h1>Tell us about you</h1><p className="mumma-lead">This helps the Coach address you naturally. It is kept locally.</p>
          <form className="mumma-form" onSubmit={e => { e.preventDefault(); if (name) go('Baby Profile') }}><label>Email address<input disabled value={email} /></label><label>Your preferred name<input required value={name} onChange={e => setName(e.target.value)} placeholder="For example, Alex" /></label><label>Your relationship to the baby<select><option>Parent</option><option>Guardian</option><option>Grandparent</option><option>Other caregiver</option></select></label><div className="mumma-captured"><span>Timezone</span><strong>Australia / Sydney</strong><small>Captured automatically for schedules and reminders.</small></div><button>Continue to Baby Profile</button></form>
        </RegistrationShell>}

        {page === 'Baby Profile' && <Page eyebrow="A few useful details" title="Let’s get to know your baby"><p className="mumma-lead">Only information that materially affects sleep recommendations is collected.</p><form className="mumma-card mumma-form" onSubmit={e => { e.preventDefault(); if (baby && dob) go('Sleep Coach') }}><label>Baby’s name<input required value={baby} onChange={e => setBaby(e.target.value)} /></label><label>Date of birth<input required type="date" value={dob} onChange={e => setDob(e.target.value)} /></label><label>Usual morning wake<input required type="time" defaultValue="07:00" /></label><label>Feeding context<select defaultValue="mixed"><option value="breast">Breast</option><option value="formula">Formula</option><option value="mixed">Mixed</option><option value="other">Other</option></select></label><button>Continue with Sleep Coach</button></form></Page>}

        {page === 'Sleep Coach' && <Page eyebrow="Sleep Coach" title="Sleep Coach"><Safety /><div className="mumma-chat"><CoachMessage>{proposal ? `I’ve prepared a gentle day plan for ${baby || 'your baby'}. Review the timing below—nothing changes until you confirm it.` : `Hi ${name || 'there'}. I’ll help you build a practical sleep plan for ${baby || 'your baby'}. What would you most like to improve about sleep right now?`}</CoachMessage>{!proposal && <div className="mumma-message-action"><button className="mumma-text" onClick={() => setProposal(true)}>Rebuild plan</button></div>}{proposal && <><section className="mumma-card mumma-proposal"><span className="mumma-eyebrow">Proposed Sleep Plan</span><h2>A calmer, age-aware rhythm</h2>{schedule.slice(0, 4).map(([time, label]) => <div className="mumma-mini-event" key={time}><time>{time}</time><strong>{label}</strong></div>)}</section><button className="mumma-secondary mumma-full" onClick={() => go('Plan confirmation')}>Review proposed update</button></>}</div><form className="mumma-composer" onSubmit={e => { e.preventDefault(); setProposal(true) }}><textarea aria-label="Message Sleep Coach" placeholder="Tell the Coach what’s happening…" /><button aria-label="Send message">↑</button></form></Page>}

        {page === 'Plan confirmation' && <Page eyebrow="Review before changing" title="Update your Sleep Plan?"><Safety /><section className="mumma-card mumma-confirm"><span className="mumma-eyebrow">Proposed Sleep Plan</span><h2>A calmer, age-aware rhythm</h2><p>This update adjusts nap timing and protects a consistent 7:30 pm bedtime.</p>{schedule.map(([time, label, copy]) => <div className="mumma-plan-row" key={time}><time>{time}</time><div><strong>{label}</strong><small>{copy}</small></div></div>)}<div className="mumma-note"><strong>Nothing changes until you confirm.</strong><span>You can keep your current plan and continue the conversation.</span></div><button onClick={() => { setPlanVersion(v => v + 1); go('Today') }}>Update Sleep Plan</button><button className="mumma-secondary" onClick={() => go('Sleep Coach')}>Keep current plan</button></section></Page>}

        {page === 'Today' && <Page eyebrow="Today" title={`Good ${greeting()}, ${baby || 'Mia'}’s family`}><section className="mumma-next"><span className="mumma-eyebrow">Next in your plan</span><div><strong>Nap</strong><b>in 45 min</b></div><p>Begin a calm wind-down with dim light and a short cuddle.</p></section><section className="mumma-card"><div className="mumma-section-head"><h2>Today’s Sleep Plan</h2><span>Plan {planVersion}</span></div><div className="mumma-plan-meta"><div><strong>Plan {planVersion}</strong><small>Current version</small></div><div><strong>16 Aug</strong><small>Updated</small></div><div><strong>19 weeks</strong><small>{baby || 'Baby'}’s age</small></div></div><div className="mumma-timeline">{schedule.map(([time, label, copy], i) => <div className={i === 1 ? 'current' : ''} key={time}><time>{time}</time><i /><section><strong>{label}</strong><p>{copy}</p>{i === 1 && <span>NOW</span>}</section></div>)}</div></section><button className="mumma-coach-button" onClick={() => go('Sleep Coach')}>✦ Talk to Sleep Coach</button>{monitoring ? <section className="mumma-monitor-active"><span className="mumma-eyebrow">Sleep monitor active</span><strong>23h 48m</strong><small>remaining in this 24-hour monitor</small></section> : <section className="mumma-card mumma-monitor-start"><span className="mumma-eyebrow">Sleep monitor</span><h2>Track a day of sleep</h2><p>Sleep data can support and improve AI-assisted sleep consultant recommendations.</p><button className="mumma-secondary" onClick={() => { setMonitoring(true); go('Sleep monitor') }}>Start Sleep monitor</button></section>}</Page>}

        {page === 'Sleep monitor' && <Page eyebrow="Today" title="Sleep monitor active"><button className="mumma-back" onClick={() => go('Today')}>← Back to Today</button><section className="mumma-monitor-active large"><strong>23h 48m</strong><small>remaining in this 24-hour monitor</small></section><section className="mumma-card"><h2>Log sleep patterns here</h2><p>Use the + button whenever your baby sleeps or wakes.</p>{logs.map((log, i) => <div className="mumma-log" key={i}><span>{log.time}</span><strong>{log.type}</strong><small>Quality: {log.quality}</small></div>)}</section><button className="mumma-add" aria-label="Log sleep pattern" onClick={() => setShowLog(true)}>+</button>{showLog && <LogDialog onClose={() => setShowLog(false)} onSave={log => { setLogs(v => [...v, log]); setShowLog(false) }} />}</Page>}

        {page === 'Sleep Reminders' && <Page eyebrow="Scheduled on this device" title="Sleep Reminders"><p className="mumma-lead">Choose how the current Sleep Plan reminds you. Reminders continue without an internet connection.</p><form className="mumma-card mumma-form" onSubmit={e => { e.preventDefault(); setSaved(true) }}><Switch title="Reminders enabled" note="Scheduled locally on this device" checked /><Switch title="Vibration" checked /><Switch title="Sound" /><label>Wind-down reminder<select defaultValue="10"><option value="0">At start time</option><option value="5">5 minutes before</option><option value="10">10 minutes before</option><option value="15">15 minutes before</option></select></label><Switch title="Wake targets" /><button>{saved ? 'Saved' : 'Save reminders'}</button></form></Page>}

        {page === 'Baby Journal' && <Page eyebrow="Observed, not diagnosed" title="Baby Journal"><button className="mumma-full" onClick={() => setJournalOpen(v => !v)}>＋ Add observation</button>{journalOpen && <form className="mumma-card mumma-form" onSubmit={e => { e.preventDefault(); setJournalOpen(false) }}><label>What did you notice?<textarea value={journal} onChange={e => setJournal(e.target.value)} placeholder="Keep it brief—you can add detail later." /></label><label>Category<select><option>settling</option><option>nap</option><option>night waking</option><option>mood</option><option>feeding</option></select></label><button>Save to Journal</button></form>}<h2 className="mumma-day">16 Aug 2026</h2>{logs.length > 0 && <section className="mumma-card"><span className="mumma-eyebrow">Sleep monitor</span>{logs.map((log, i) => <div className="mumma-log" key={i}><span>{log.time}</span><strong>{log.type}</strong><small>Quality: {log.quality}</small></div>)}</section>}{journal && !journalOpen && <article className="mumma-journal-entry"><time>8:15 pm</time><div><span>settling</span><p>{journal}</p></div></article>}</Page>}

        {page === 'More' && <Page eyebrow="Settings" title="More"><div className="mumma-settings"><SettingsLink title="Account Profile" detail={`${name || 'Alex'} · ${email || 'alex@example.com'}`} onClick={() => go('About you')} /><SettingsLink title="Family Preferences" detail="Timing, routines and constraints" /><SettingsLink title="Baby Profile" detail={`${baby || 'Mia'} · ${dob || '2026-04-01'}`} onClick={() => go('Baby Profile')} /><SettingsLink title="Sleep Research" detail="Chronological sources used by plans" onClick={() => go('Sleep Research')} /><SettingsLink title="AI Call History" detail="Review the last 7 days of Coach calls" /><SettingsLink title="Data & Backup" detail="Encrypted export, restore and deletion" onClick={() => go('Data & Backup')} /></div><section className="mumma-card"><h2>Appearance</h2><Switch title="Dark mode" note="Use the calm night palette throughout the app" checked={dark} onChange={setDark} /></section><section className="mumma-card mumma-tool"><h2>Prototype tools</h2><p>Clear the Baby Profile and restore the deterministic demo plan.</p><button className="mumma-secondary">Reset demo data</button></section><p className="mumma-version">Mumma Sleep Coach · Prototype 1.0</p></Page>}

        {page === 'Sleep Research' && <Page eyebrow="Evidence behind the plan" title="Sleep Research"><button className="mumma-back" onClick={() => go('More')}>← Back to More</button><p className="mumma-lead">Research is shown in chronological order with the sources used by your current plan.</p>{['Infant sleep duration recommendations', 'Responsive settling and sleep development', 'Safe sleeping advice for babies'].map((title, i) => <article className="mumma-card mumma-research" key={title}><span className="mumma-eyebrow">{i === 2 ? 'Safe sleep' : 'Sleep development'}</span><h2>{title}</h2><p>Plain-language guidance used to support the current fixture plan.</p><b>Used in current plan</b><a href="#" onClick={e => e.preventDefault()}>Read published source ↗</a></article>)}</Page>}

        {page === 'Data & Backup' && <Page eyebrow="Your information" title="Data & Backup"><button className="mumma-back" onClick={() => go('More')}>← Back to More</button><section className="mumma-card"><h2>Encrypted backup</h2><p>Browser data is provided for development and this simulated prototype does not create a file.</p><button>Export encrypted backup</button><button className="mumma-secondary">Restore from backup</button></section><section className="mumma-card mumma-danger"><h2>Delete local data</h2><p>Remove account, profile, journal, conversations and sleep plans from this device.</p><button>Delete all local data</button></section></Page>}
      </section>
      {navPage && <BottomNav current={navPage} go={go} />}
    </article>
  </main>
}

function RegistrationShell({ progress, children }: { progress: 1 | 2; children: ReactNode }) { return <div className="mumma-registration"><div className="mumma-brand">☾</div><p className="mumma-eyebrow">Mumma Sleep Coach</p><div className="mumma-progress"><i /><i className={progress === 2 ? 'active' : ''} /></div>{children}</div> }
function Page({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) { return <div className="mumma-page"><p className="mumma-eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</div> }
function Safety() { return <aside className="mumma-safety"><strong>Sleep coaching, not medical care.</strong><p>For health or safety concerns, seek appropriate professional medical advice.</p></aside> }
function CoachMessage({ children }: { children: ReactNode }) { return <div className="mumma-coach-message"><span>✦</span><p>{children}</p></div> }
function Switch({ title, note, checked = false, onChange }: { title: string; note?: string; checked?: boolean; onChange?: (value: boolean) => void }) { const [value, setValue] = useState(checked); useEffect(() => setValue(checked), [checked]); return <label className="mumma-switch"><span><strong>{title}</strong>{note && <small>{note}</small>}</span><input type="checkbox" role="switch" checked={value} onChange={e => { setValue(e.target.checked); onChange?.(e.target.checked) }} /></label> }
function SettingsLink({ title, detail, onClick }: { title: string; detail: string; onClick?: () => void }) { return <button onClick={onClick}><span className="mumma-settings-icon">◇</span><div><strong>{title}</strong><small>{detail}</small></div><b>›</b></button> }
function BottomNav({ current, go }: { current: NavPage; go: (page: PageName) => void }) { const items: Array<[NavPage, string]> = [['Today', '⌂'], ['Sleep Coach', '✦'], ['Sleep Reminders', '♢'], ['Baby Journal', '▤'], ['More', '•••']]; return <nav className="mumma-nav" aria-label="Primary navigation">{items.map(([page, icon]) => <button className={current === page ? 'active' : ''} onClick={() => go(page)} key={page}><span>{icon}</span><small>{page === 'Sleep Coach' ? 'Coach' : page === 'Sleep Reminders' ? 'Reminders' : page === 'Baby Journal' ? 'Journal' : page}</small></button>)}</nav> }
function LogDialog({ onClose, onSave }: { onClose: () => void; onSave: (log: { type: string; quality: string; time: string }) => void }) { const [type, setType] = useState('Sleep'); const [quality, setQuality] = useState('Okay'); const submit = (e: FormEvent) => { e.preventDefault(); onSave({ type, quality, time: new Intl.DateTimeFormat('en-AU', { hour: 'numeric', minute: '2-digit' }).format(new Date()) }) }; return <div className="mumma-modal"><section role="dialog" aria-modal="true" aria-label="Log sleep pattern"><div className="mumma-section-head"><h2>Log sleep pattern</h2><button aria-label="Close" onClick={onClose}>×</button></div><form className="mumma-form" onSubmit={submit}><fieldset><legend>Plan event</legend><label><input type="radio" checked={type === 'Sleep'} onChange={() => setType('Sleep')} /> Sleep</label><label><input type="radio" checked={type === 'Wake'} onChange={() => setType('Wake')} /> Wake</label></fieldset><label>How did it go?<select value={quality} onChange={e => setQuality(e.target.value)}><option>Bad</option><option>Difficult</option><option>Okay</option><option>Good</option><option>Very good</option></select></label><label>Comments (optional)<textarea placeholder="Add anything you noticed." /></label><button>Go</button></form></section></div> }
function greeting() { const hour = new Date().getHours(); return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening' }
