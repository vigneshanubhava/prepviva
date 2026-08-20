import { useState } from 'react'
import {
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  ChipGroup,
  ChoiceCards,
  EmptyState,
  FileDrop,
  Icon,
  iconNames,
  Input,
  Modal,
  RadioGroup,
  SegmentedControl,
  Select,
  Skeleton,
  Spinner,
  StepProgress,
  Switch,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  TState,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Toast,
  useToast,
} from '../components/ui/index.js'
import { useTheme } from '../theme/ThemeProvider.jsx'
import styles from './KitchenSink.module.css'

const SECTIONS = [
  ['button', 'Button'],
  ['input', 'Input'],
  ['select', 'Select'],
  ['checkbox', 'Checkbox'],
  ['switch', 'Switch'],
  ['radio', 'Radio'],
  ['choicecards', 'ChoiceCards'],
  ['chipgroup', 'ChipGroup'],
  ['filedrop', 'FileDrop'],
  ['stepprogress', 'StepProgress'],
  ['badge', 'Badge'],
  ['card', 'Card'],
  ['banner', 'Banner'],
  ['table', 'Table'],
  ['tabs', 'Tabs'],
  ['segmented', 'SegmentedControl'],
  ['modal', 'Modal'],
  ['toast', 'Toast'],
  ['skeleton', 'Skeleton'],
  ['empty', 'EmptyState'],
  ['icon', 'Icon'],
]

const BUTTON_STATES = ['default', 'hover', 'active', 'focus', 'disabled', 'loading']
const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger']

function Section({ id, title, note, children }) {
  return (
    <section className={styles.section} id={id}>
      <h2 className={styles.h2}>{title}</h2>
      {note ? <p className={styles.note}>{note}</p> : null}
      {children}
    </section>
  )
}

function ForcedNote({ children }) {
  return <p className={styles.forcedNote}>{children}</p>
}

export default function KitchenSink() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [text, setText] = useState('')
  const [filled, setFilled] = useState('sam.okafor@nhs.net')
  const [selectValue, setSelectValue] = useState('')
  const [selectFilled, setSelectFilled] = useState('nhs')
  const [checked, setChecked] = useState(true)
  const [reminders, setReminders] = useState(true)
  const [track, setTrack] = useState('nhs')
  const [tab, setTab] = useState('overview')
  const [pillTab, setPillTab] = useState('invoices')
  const [cycle, setCycle] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [dangerModalOpen, setDangerModalOpen] = useState(false)
  const [sortDir, setSortDir] = useState('asc')
  const [choice, setChoice] = useState('nhs')
  const [dateChoice, setDateChoice] = useState('has-date')
  const [worries, setWorries] = useState(['Freezing up'])
  const [cv, setCv] = useState(null)
  const [cvError, setCvError] = useState(null)
  const [wizardStep, setWizardStep] = useState(2)

  const trackOptions = [
    { value: 'nhs', label: 'NHS', description: 'Clinical and non-clinical posts' },
    { value: 'uni', label: 'University', description: 'Medical school interviews' },
    { value: 'pg', label: 'Postgraduate', description: 'Specialty and fellowship' },
    { value: 'none', label: 'Not sure yet', description: 'Pick a track later', disabled: true },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <span className={styles.brand}>PrepViva</span>
        <span className={styles.topNote}>Component library</span>
        <div className={styles.spacer} />
        <SegmentedControl
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </header>

      <div className={styles.wrap}>
        <h1 className={styles.h1}>Kitchen sink</h1>
        <p className={styles.lede}>
          Every component in every state, built from semantic tokens only — no hex values, no
          primitives, no raw px font sizes. Flip the theme above: nothing in the markup changes.
        </p>

        <nav className={styles.toc} aria-label="Components">
          {SECTIONS.map(([id, label]) => (
            <a key={id} className={styles.tocLink} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>

        {/* ------------------------------------------------------------ Button */}
        <Section
          id="button"
          title="Button"
          note="Four variants across six states. Hover, active and focus are shown statically via a data-force hook that mirrors the real CSS selectors — the live states still work on the default column."
        >
          <div className={styles.panel}>
            <div className={styles.matrix}>
              <span />
              {BUTTON_STATES.map((state) => (
                <span key={state} className={styles.matrixHead}>
                  {state}
                </span>
              ))}

              {BUTTON_VARIANTS.map((variant) => (
                <Row key={variant} variant={variant} />
              ))}
            </div>

            <ForcedNote>
              The <code>hover</code>, <code>active</code> and <code>focus</code> columns are forced
              for review. Interact with the <code>default</code> column to confirm the live states
              match.
            </ForcedNote>

            <p className={styles.eyebrow}>Sizes</p>
            <div className={styles.row}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>

            <p className={styles.eyebrow}>With icons and full width</p>
            <div className={styles.stack}>
              <div className={styles.row}>
                <Button iconLeft={<Icon name="plus" />}>Add a top-up</Button>
                <Button variant="secondary" iconRight={<Icon name="chevronRight" />}>
                  Continue
                </Button>
                <Button variant="ghost" iconLeft={<Icon name="search" />}>
                  Search
                </Button>
              </div>
              <Button fullWidth>Start 14-day trial</Button>
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Input */}
        <Section
          id="input"
          title="Input"
          note="Label, hint and error are wired through a shared Field so aria-describedby and aria-invalid are never hand-written. Errors use role=alert so they are announced."
        >
          <div className={styles.panel}>
            <div className={styles.grid}>
              <Input
                label="Email address"
                hint="You'll sign in with this"
                placeholder="you@example.com"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Input label="Filled" value={filled} onChange={(e) => setFilled(e.target.value)} />
              <Input label="Hover" placeholder="Hovered" forceState="hover" readOnly />
              <Input label="Focus" placeholder="Focused" forceState="focus" readOnly />
              <Input
                label="Error"
                defaultValue="not-an-email"
                error="Enter a valid email address"
              />
              <Input label="Disabled" placeholder="Unavailable" disabled />
              <Input label="Read-only" value="Core Prep" readOnly />
              <Input label="Required" placeholder="Required field" required />
              <Input label="With prefix" prefix="£" placeholder="59" inputMode="decimal" />
              <Input label="With suffix" suffix={<Icon name="search" />} placeholder="Search sessions" />
            </div>

            <p className={styles.eyebrow}>Sizes</p>
            <div className={styles.grid}>
              <Input label="Small" size="sm" placeholder="Small" />
              <Input label="Medium" size="md" placeholder="Medium" />
              <Input label="Large" size="lg" placeholder="Large" />
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Select */}
        <Section
          id="select"
          title="Select"
          note="Wraps the native select rather than reimplementing a listbox — keyboard and screen-reader behaviour comes for free, and the token layer is applied to the wrapper."
        >
          <div className={styles.panel}>
            <div className={styles.grid}>
              <Select
                label="Interview track"
                placeholder="Choose a track"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={trackOptions}
              />
              <Select
                label="Filled"
                value={selectFilled}
                onChange={(e) => setSelectFilled(e.target.value)}
                options={trackOptions}
              />
              <Select label="Hover" forceState="hover" options={trackOptions} defaultValue="nhs" />
              <Select label="Focus" forceState="focus" options={trackOptions} defaultValue="nhs" />
              <Select
                label="Error"
                error="Choose a track to continue"
                placeholder="Choose a track"
                options={trackOptions}
                defaultValue=""
              />
              <Select label="Disabled" disabled options={trackOptions} defaultValue="nhs" />
              <Select label="Small" size="sm" options={trackOptions} defaultValue="nhs" />
              <Select label="Large" size="lg" options={trackOptions} defaultValue="nhs" />
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Checkbox */}
        <Section
          id="checkbox"
          title="Checkbox"
          note="A real native input, visually hidden but still focusable, with a painted box beside it. Indeterminate is set as a DOM property."
        >
          <div className={styles.panel}>
            <div className={styles.grid}>
              <Checkbox label="Unchecked" defaultChecked={false} />
              <Checkbox label="Checked" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <Checkbox label="Indeterminate" indeterminate />
              <Checkbox label="Hover" forceState="hover" />
              <Checkbox label="Focus" forceState="focus" />
              <Checkbox label="Disabled" disabled />
              <Checkbox label="Disabled checked" disabled defaultChecked />
              <Checkbox
                label="With description"
                description="Email me a reminder the day before my trial ends"
                defaultChecked
              />
              <Checkbox label="Error" error="You must accept the agreement to continue" />
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Switch */}
        <Section
          id="switch"
          title="Switch"
          note="A checkbox with role=switch — for a preference that applies, rather than a value that is submitted. The track and knob are paint over the native control."
        >
          <div className={styles.panel}>
            <div className={styles.grid}>
              <Switch label="Off" checked={false} onChange={() => {}} />
              <Switch
                label="On"
                checked={reminders}
                onChange={(event) => setReminders(event.target.checked)}
              />
              <Switch label="Hover" forceState="hover" checked={false} onChange={() => {}} />
              <Switch label="Focus" forceState="focus" checked={false} onChange={() => {}} />
              <Switch label="Small" size="sm" checked onChange={() => {}} />
              <Switch label="Disabled" disabled checked={false} onChange={() => {}} />
              <Switch label="Disabled on" disabled checked onChange={() => {}} />
              <Switch
                label="With description"
                description="An hour before a session you have booked"
                checked
                onChange={() => {}}
              />
              <Switch aria-label="No visible label" checked={false} onChange={() => {}} />
            </div>
          </div>
          <ForcedNote>
            Hover and focus are forced with `forceState`; the rest are live.
          </ForcedNote>
        </Section>

        {/* ------------------------------------------------------------ Radio */}
        <Section
          id="radio"
          title="Radio"
          note="Grouped in a real fieldset/legend so the group name is announced with each option. Arrow-key navigation is native browser behaviour."
        >
          <div className={styles.panel}>
            <div className={styles.grid}>
              <RadioGroup
                legend="Interview track"
                hint="You can change this later"
                name="ks-track"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                options={trackOptions}
              />
              <RadioGroup
                legend="With an error"
                name="ks-track-error"
                error="Choose a track to continue"
                options={trackOptions.slice(0, 2)}
              />
              <RadioGroup
                legend="Disabled group"
                name="ks-track-disabled"
                disabled
                options={trackOptions.slice(0, 2)}
              />
              <RadioGroup
                legend="Horizontal"
                name="ks-track-row"
                direction="row"
                options={[
                  { value: 'invoices', label: 'Invoices' },
                  { value: 'transactions', label: 'Transactions' },
                ]}
              />
            </div>
          </div>
        </Section>

        {/* ----------------------------------------------------- ChoiceCards */}
        <Section
          id="choicecards"
          title="ChoiceCards"
          note="Radios drawn as cards, for a choice that needs a glyph, a label and a line of explanation each. Native radios in a fieldset, so arrow keys and the group name come free. Each option can take an accent — the three interview tracks have their own colour in the token layer."
        >
          <div className={styles.panel}>
            <div className={styles.stack}>
              <ChoiceCards
                legend="What are you practising for?"
                name="ks-choice"
                value={choice}
                onChange={setChoice}
                options={[
                  { value: 'nhs', label: 'NHS', detail: 'A job or post in the NHS', icon: 'briefcase', accent: 'nhs' },
                  { value: 'uni', label: 'University', detail: 'Applying to study', icon: 'graduationCap', accent: 'uni' },
                  { value: 'pg', label: 'Postgraduate', detail: 'Specialty or core training', icon: 'trophy', accent: 'pg' },
                ]}
              />

              <p className={styles.eyebrow}>Row layout, no icons</p>
              <ChoiceCards
                legend="Where are you up to?"
                name="ks-choice-row"
                layout="row"
                value={dateChoice}
                onChange={setDateChoice}
                options={[
                  { value: 'has-date', label: 'I have a date' },
                  { value: 'waiting', label: 'Applied, waiting to hear' },
                  { value: 'no-date', label: 'No date yet' },
                ]}
              />

              <p className={styles.eyebrow}>With a caption, and in error</p>
              <ChoiceCards
                legend="Interviewed before?"
                caption="Sets your starting difficulty. Changeable any time."
                name="ks-choice-error"
                layout="row"
                value={null}
                onChange={() => {}}
                error="Choose one to continue."
                options={[
                  { value: 'first', label: 'First time', detail: 'Guided mode, gentle examiner' },
                  { value: 'some', label: 'Done a few', detail: 'Guided mode, realistic examiner' },
                ]}
              />

              <p className={styles.eyebrow}>Disabled</p>
              <ChoiceCards
                legend="Disabled group"
                name="ks-choice-disabled"
                disabled
                value="brand"
                onChange={() => {}}
                options={[
                  { value: 'brand', label: 'Selected', detail: 'The brand accent', icon: 'sparkle', accent: 'brand' },
                  { value: 'other', label: 'Unselected', detail: 'The default accent', icon: 'users' },
                ]}
              />
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------- ChipGroup */}
        <Section
          id="chipgroup"
          title="ChipGroup"
          note="Multi-select chips — a checkbox group drawn as pills, for short unordered answers. The tick is decorative; selection is the input's."
        >
          <div className={styles.panel}>
            <div className={styles.stack}>
              <ChipGroup
                legend="What worries you most?"
                hint="Pick as many as you like."
                name="ks-worries"
                options={['Freezing up', 'Structuring my answers', 'Clinical questions', 'Ethical scenarios', 'Running out of time']}
                value={worries}
                onChange={setWorries}
              />
              <span className={styles.caption}>Selected: {worries.length ? worries.join(', ') : 'none'}</span>

              <p className={styles.eyebrow}>In error, and disabled</p>
              <ChipGroup
                legend="Choose at least one"
                options={['Morning', 'Afternoon', 'Evening']}
                value={[]}
                onChange={() => {}}
                error="Pick a time that suits you."
              />
              <ChipGroup
                legend="Disabled"
                disabled
                options={['Morning', 'Afternoon', 'Evening']}
                value={['Afternoon']}
                onChange={() => {}}
              />
            </div>
          </div>
        </Section>

        {/* -------------------------------------------------------- FileDrop */}
        <Section
          id="filedrop"
          title="FileDrop"
          note="Attach one file. It checks the extension and the size itself and hands the message back, so the screen keeps its own voice. Only the name and size are passed on — nothing here reads the bytes."
        >
          <div className={styles.panel}>
            <div className={styles.stack}>
              <FileDrop
                label="CV or résumé"
                hint=".pdf, .doc, .docx — up to 5MB"
                accept={['.pdf', '.doc', '.docx']}
                maxMB={5}
                file={cv}
                error={cvError}
                onSelect={(meta) => {
                  setCv(meta)
                  setCvError(null)
                }}
                onReject={(message) => setCvError(message)}
              />

              <p className={styles.eyebrow}>Attached, and rejected</p>
              <FileDrop
                label="Attached"
                file={{ name: 'oliver-davies-cv.pdf', size: 240 * 1024 }}
                onSelect={() => {}}
              />
              <FileDrop
                label="Rejected"
                hint=".pdf, .doc, .docx — up to 5MB"
                accept={['.pdf']}
                maxMB={5}
                file={null}
                error="That file type is not accepted — use .pdf, .doc, .docx."
                onSelect={() => {}}
                onReject={() => {}}
              />

              <p className={styles.eyebrow}>Disabled</p>
              <FileDrop label="Disabled" hint="Nothing to add yet" disabled onSelect={() => {}} />
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------- StepProgress */}
        <Section
          id="stepprogress"
          title="StepProgress"
          note="How far through a multi-step flow you are. One progressbar for assistive tech, segments for everyone else, and the count in words beside it — a bar with no number leaves sighted users counting pips."
        >
          <div className={styles.panel}>
            <div className={styles.stack}>
              <StepProgress step={wizardStep} total={6} label="When is your interview" />
              <div className={styles.row}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setWizardStep((n) => Math.max(0, n - 1))}
                >
                  Back
                </Button>
                <Button size="sm" onClick={() => setWizardStep((n) => Math.min(5, n + 1))}>
                  Next
                </Button>
              </div>

              <p className={styles.eyebrow}>First step, last step, and without the count</p>
              <StepProgress step={0} total={6} />
              <StepProgress step={5} total={6} />
              <StepProgress step={1} total={3} showCount={false} />
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Badge */}
        <Section
          id="badge"
          title="Badge"
          note="Three variants across the status tones plus the three track tones. Purple appears only as the brand tone — never as a status, never as a track."
        >
          <div className={styles.panel}>
            {['subtle', 'solid', 'outline'].map((variant) => (
              <div key={variant}>
                <p className={styles.eyebrow}>{variant}</p>
                <div className={styles.row}>
                  {['neutral', 'brand', 'success', 'warning', 'danger', 'info'].map((tone) => (
                    <Badge key={tone} tone={tone} variant={variant}>
                      {tone}
                    </Badge>
                  ))}
                  <Badge tone="nhs" variant={variant}>
                    NHS
                  </Badge>
                  <Badge tone="uni" variant={variant}>
                    University
                  </Badge>
                  <Badge tone="pg" variant={variant}>
                    Postgraduate
                  </Badge>
                </div>
              </div>
            ))}

            <p className={styles.eyebrow}>With dot, and small</p>
            <div className={styles.row}>
              <Badge tone="success" dot>
                Active
              </Badge>
              <Badge tone="warning" dot>
                Trial — 9 days left
              </Badge>
              <Badge tone="danger" dot>
                Payment failed
              </Badge>
              <Badge tone="brand" size="sm">
                Recommended
              </Badge>
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Card */}
        <Section
          id="card"
          title="Card"
          note="Padding and elevation scales, plus an interactive variant that renders a real button and a selected state for the recommended plan."
        >
          <div className={styles.grid}>
            <Card title="Flat" subtitle="elevation=flat" elevation="flat">
              <p className={styles.caption}>No shadow — for nesting inside another surface.</p>
            </Card>
            <Card title="Small shadow" subtitle="elevation=sm">
              <p className={styles.caption}>The default resting card.</p>
            </Card>
            <Card title="Medium shadow" subtitle="elevation=md" elevation="md">
              <p className={styles.caption}>Lifted off the page.</p>
            </Card>
            <Card title="Large shadow" subtitle="elevation=lg" elevation="lg">
              <p className={styles.caption}>Reserved for the recommended plan.</p>
            </Card>
            <Card interactive title="Interactive" subtitle="renders a button">
              <p className={styles.caption}>Hover and focus me.</p>
            </Card>
            <Card forceState="hover" title="Hover (forced)" subtitle="interactive">
              <p className={styles.caption}>Border and shadow lift.</p>
            </Card>
            <Card forceState="focus" title="Focus (forced)" subtitle="interactive">
              <p className={styles.caption}>Focus ring from --shadow-focus.</p>
            </Card>
            <Card
              selected
              title="Selected"
              subtitle="brand border"
              elevation="lg"
              headerAction={<Badge tone="brand">Recommended</Badge>}
            >
              <p className={styles.caption}>Used by the middle pricing card.</p>
            </Card>
            <Card
              title="With a footer"
              padding="lg"
              footer={
                <div className={styles.row}>
                  <Button size="sm">Confirm</Button>
                  <Button size="sm" variant="ghost">
                    Cancel
                  </Button>
                </div>
              }
            >
              <p className={styles.caption}>Footer sits above a subtle divider.</p>
            </Card>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Banner */}
        <Section
          id="banner"
          title="Banner"
          note="Page-level messages. Danger banners take role=alert; the rest take role=status."
        >
          <div className={styles.stack}>
            <Banner tone="info" title="Your plan changes on 30 November">
              You'll move to Starter at the end of the current period. Nothing changes until then.
            </Banner>
            <Banner tone="success" title="Payment received">
              Your next invoice is dated 15 September for £59.
            </Banner>
            <Banner tone="warning" title="3 days left in your trial">
              Your trial ends on 1 September. You'll be charged £59 unless you cancel before then.
            </Banner>
            <Banner
              tone="danger"
              title="Payment failed — your account is read-only"
              actions={
                <>
                  <Button size="sm" variant="danger">
                    Update card
                  </Button>
                  <Button size="sm" variant="ghost">
                    Contact support
                  </Button>
                </>
              }
            >
              We couldn't take £59 on 15 August. Practice is paused until the card is updated.
            </Banner>
            <Banner tone="brand" title="Prototype only">
              This build has no backend. Every state is reachable from the prototype controls.
            </Banner>
            <Banner tone="info" title="Dismissible" onDismiss={() => {}}>
              This one carries a close affordance.
            </Banner>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Table */}
        <Section
          id="table"
          title="Table"
          note="Composed of Table / THead / TBody / Tr / Th / Td. Headers are real th elements with scope=col; sortable headers set aria-sort and render a button."
        >
          <div className={styles.stack}>
            <Table caption="Invoices">
              <THead>
                <Tr>
                  <Th sort={sortDir} onSort={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
                    Date
                  </Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th align="right">Amount</Th>
                </Tr>
              </THead>
              <TBody>
                <Tr>
                  <Td>15 Aug 2026</Td>
                  <Td>Core Prep — monthly</Td>
                  <Td>
                    <Badge tone="success" dot>
                      Paid
                    </Badge>
                  </Td>
                  <Td align="right">£59.00</Td>
                </Tr>
                <Tr forceState="hover">
                  <Td>15 Jul 2026</Td>
                  <Td>Core Prep — monthly (row hover, forced)</Td>
                  <Td>
                    <Badge tone="success" dot>
                      Paid
                    </Badge>
                  </Td>
                  <Td align="right">£59.00</Td>
                </Tr>
                <Tr>
                  <Td>15 Jun 2026</Td>
                  <Td>Starter — monthly</Td>
                  <Td>
                    <Badge tone="danger" dot>
                      Failed
                    </Badge>
                  </Td>
                  <Td align="right">£29.00</Td>
                </Tr>
              </TBody>
            </Table>

            <p className={styles.eyebrow}>Loading</p>
            <Table>
              <THead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th align="right">Amount</Th>
                </Tr>
              </THead>
              <TBody>
                <TState colSpan={3} loading />
              </TBody>
            </Table>

            <p className={styles.eyebrow}>Empty</p>
            <Table>
              <THead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th align="right">Amount</Th>
                </Tr>
              </THead>
              <TBody>
                <TState colSpan={3}>
                  <EmptyState
                    compact
                    icon="inbox"
                    title="No invoices yet"
                    description="Your first invoice will appear here after your trial ends."
                  />
                </TState>
              </TBody>
            </Table>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Tabs */}
        <Section
          id="tabs"
          title="Tabs"
          note="Roving tabindex with arrow, Home and End keys. Underline for page-level navigation, pill for compact switching."
        >
          <div className={styles.panel}>
            <Tabs value={tab} onChange={setTab} variant="underline">
              <TabList label="Session detail">
                <Tab value="overview">Overview</Tab>
                <Tab value="feedback">Feedback</Tab>
                <Tab value="transcript">Transcript</Tab>
                <Tab value="locked" disabled>
                  Locked
                </Tab>
              </TabList>
              <TabPanel value="overview">
                <p className={styles.caption}>Overview panel.</p>
              </TabPanel>
              <TabPanel value="feedback">
                <p className={styles.caption}>Feedback panel.</p>
              </TabPanel>
              <TabPanel value="transcript">
                <p className={styles.caption}>Transcript panel.</p>
              </TabPanel>
            </Tabs>

            <p className={styles.eyebrow}>Forced states — underline</p>
            <Tabs value="none" onChange={() => {}} variant="underline">
              <TabList label="Underline states">
                <Tab value="a">Default</Tab>
                <Tab value="b" forceState="hover">
                  Hover
                </Tab>
                <Tab value="c" forceState="selected">
                  Selected
                </Tab>
                <Tab value="d" forceState="focus">
                  Focus
                </Tab>
                <Tab value="e" disabled>
                  Disabled
                </Tab>
              </TabList>
            </Tabs>

            <p className={styles.eyebrow}>Pill</p>
            <Tabs value={pillTab} onChange={setPillTab} variant="pill">
              <TabList label="Billing records">
                <Tab value="invoices">Invoices</Tab>
                <Tab value="transactions">Transactions</Tab>
              </TabList>
            </Tabs>
          </div>
        </Section>

        {/* ------------------------------------------------------ Segmented */}
        <Section
          id="segmented"
          title="SegmentedControl"
          note="Switches the data in place rather than swapping panels, so it is a radiogroup, not tabs — and each segment can carry an inline note."
        >
          <div className={styles.panel}>
            <div className={styles.stack}>
              <div className={styles.row}>
                <SegmentedControl
                  label="Invoice status"
                  value={cycle}
                  onChange={setCycle}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'unpaid', label: 'Unpaid', note: '1' },
                  ]}
                />
                <span className={styles.caption}>Selected: {cycle}</span>
              </div>

              <p className={styles.eyebrow}>Forced states</p>
              <div className={styles.row}>
                <SegmentedControl
                  label="Forced states"
                  value="a"
                  onChange={() => {}}
                  forceStates={{ b: 'hover', c: 'focus' }}
                  options={[
                    { value: 'a', label: 'Selected' },
                    { value: 'b', label: 'Hover' },
                    { value: 'c', label: 'Focus' },
                    { value: 'd', label: 'Disabled', disabled: true },
                  ]}
                />
                <SegmentedControl
                  label="Large"
                  size="lg"
                  value="all"
                  onChange={() => {}}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'unpaid', label: 'Unpaid', note: '1' },
                  ]}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------ Modal */}
        <Section
          id="modal"
          title="Modal"
          note="Traps focus, restores it on close, closes on Escape or scrim click, and locks background scroll. Rendered through a portal."
        >
          <div className={styles.panel}>
            <div className={styles.row}>
              <Button onClick={() => setModalOpen(true)}>Open modal</Button>
              <Button variant="danger" onClick={() => setDangerModalOpen(true)}>
                Open destructive modal
              </Button>
            </div>
          </div>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Downgrade to Starter"
            description="Starter, from the end of the month you have paid for."
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>Confirm switch</Button>
              </>
            }
          >
            <p>
              You keep Core Prep and its 30 credits until 15 September 2026. After that Starter
              takes over at £29 a month.
            </p>
            <p>Tab moves between the buttons and stays inside the dialog. Escape closes it.</p>
          </Modal>

          <Modal
            open={dangerModalOpen}
            onClose={() => setDangerModalOpen(false)}
            size="sm"
            title="Cancel your subscription?"
            description="Your practice history stays available until 15 September 2026."
            footer={
              <>
                <Button variant="ghost" onClick={() => setDangerModalOpen(false)}>
                  Keep my plan
                </Button>
                <Button variant="danger" onClick={() => setDangerModalOpen(false)}>
                  Cancel subscription
                </Button>
              </>
            }
          />
        </Section>

        {/* ------------------------------------------------------------ Toast */}
        <Section
          id="toast"
          title="Toast"
          note="Fired through useToast() into a portalled aria-live region. The static examples below show each tone without waiting for a timer."
        >
          <div className={styles.panel}>
            <div className={styles.row}>
              <Button
                size="sm"
                onClick={() => toast({ tone: 'success', title: 'Plan updated', body: 'You are on Core Prep.' })}
              >
                Fire success
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => toast({ tone: 'info', title: 'Saved', body: 'Your changes are saved.' })}
              >
                Fire info
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  toast({ tone: 'warning', title: 'Trial ends soon', body: 'You will be charged £59 on 1 Sep.' })
                }
              >
                Fire warning
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => toast({ tone: 'danger', title: 'Payment failed', body: 'Update your card to continue.' })}
              >
                Fire danger
              </Button>
            </div>

            <p className={styles.eyebrow}>Static — every tone</p>
            <div className={`${styles.stack} ${styles.toastColumn}`}>
              <Toast tone="info" title="Saved" onDismiss={() => {}}>
                Your changes are saved.
              </Toast>
              <Toast tone="success" title="Plan updated" onDismiss={() => {}}>
                You are on Core Prep — 30 credits a month.
              </Toast>
              <Toast tone="warning" title="Trial ends soon" onDismiss={() => {}}>
                You'll be charged £59 on 1 September 2026.
              </Toast>
              <Toast tone="danger" title="Payment failed" onDismiss={() => {}}>
                Update your card to keep practising.
              </Toast>
            </div>
          </div>
        </Section>

        {/* --------------------------------------------------------- Skeleton */}
        <Section
          id="skeleton"
          title="Skeleton"
          note="Shimmer built from surface tokens, so it stays legible in both themes. Honours prefers-reduced-motion."
        >
          <div className={styles.panel}>
            <div className={styles.grid}>
              <div className={styles.stack}>
                <span className={styles.caption}>text — single</span>
                <Skeleton variant="text" width="70%" />
              </div>
              <div className={styles.stack}>
                <span className={styles.caption}>text — 3 lines</span>
                <Skeleton variant="text" lines={3} />
              </div>
              <div className={styles.stack}>
                <span className={styles.caption}>circle</span>
                <Skeleton variant="circle" width="var(--space-12)" />
              </div>
              <div className={styles.stack}>
                <span className={styles.caption}>rect</span>
                <Skeleton variant="rect" height="var(--space-20)" />
              </div>
            </div>

            <p className={styles.eyebrow}>In place — a loading card</p>
            <Card>
              <div className={styles.stack}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" lines={2} />
                <Skeleton variant="rect" height="var(--space-10)" width="50%" />
              </div>
            </Card>
          </div>
        </Section>

        {/* ------------------------------------------------------- EmptyState */}
        <Section id="empty" title="EmptyState" note="Icon, title, description and up to two actions.">
          <div className={styles.grid}>
            <Card padding="none">
              <EmptyState
                icon="inbox"
                title="No sessions yet"
                description="Your practice sessions will appear here once you've completed your first interview."
                primaryAction={<Button size="sm">Start practising</Button>}
                secondaryAction={
                  <Button size="sm" variant="ghost">
                    Browse questions
                  </Button>
                }
              />
            </Card>
            <Card padding="none">
              <EmptyState
                icon="award"
                title="No feedback to show"
                description="Complete a session to see scores on communication, structure, evidence and judgement."
              />
            </Card>
            <Card padding="none">
              <EmptyState compact icon="search" title="No results" description="Try a different search term." />
            </Card>
          </div>
        </Section>

        {/* ------------------------------------------------------------- Icon */}
        <Section
          id="icon"
          title="Icon"
          note="Inline SVG drawn in currentColor and sized in em, so icons inherit colour and scale from surrounding text. No icon library — an external one would ship its own colours."
        >
          <div className={styles.panel}>
            <div className={styles.iconGrid}>
              {iconNames.map((name) => (
                <div key={name} className={styles.iconCell}>
                  <Icon name={name} size="1.5rem" />
                  {name}
                </div>
              ))}
            </div>

            <p className={styles.eyebrow}>Spinner</p>
            <div className={styles.row}>
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

/** One row of the Button state matrix. */
function Row({ variant }) {
  return (
    <>
      <span className={styles.matrixLabel}>{variant}</span>
      {BUTTON_STATES.map((state) => (
        <span key={state}>
          <Button
            variant={variant}
            forceState={state === 'default' || state === 'loading' ? undefined : state}
            disabled={state === 'disabled'}
            loading={state === 'loading'}
          >
            Button
          </Button>
        </span>
      ))}
    </>
  )
}
