/**
 * What the question mark answers.
 *
 * There is no help centre to link to and no support inbox behind this
 * prototype, so the menu does not pretend there is. What it can honestly do is
 * answer the four questions this product actually raises — and each answer
 * quotes the figure from the module that owns it rather than repeating it, so
 * the help text cannot drift away from the app it describes.
 *
 * Every destination here is a screen that exists.
 */
import { MINUTES_PER_CREDIT, TRIAL_CREDITS, TRIAL_DAYS } from './trial.js'

export const HELP_TOPICS = [
  {
    id: 'credits',
    icon: 'sparkle',
    title: 'How credits work',
    body: `One credit is about ${MINUTES_PER_CREDIT} minutes of interview, so a session is priced by its length. The trial gives you ${TRIAL_CREDITS}.`,
    to: '/billing',
    linkLabel: 'Your balance and plan',
  },
  {
    id: 'scoring',
    icon: 'trophy',
    title: 'How sessions are scored',
    body: 'Each track is marked against its own rubric on its own scale, so scores are never averaged across tracks. Quality is per track; volume is global.',
    to: '/performance',
    linkLabel: 'See your scores',
  },
  {
    id: 'profile',
    icon: 'graduationCap',
    title: 'Change your track, date or CV',
    body: 'The answers first-run setup collected decide which track your dashboard opens on and what a new session is weighted towards. They are all editable.',
    to: '/settings/interview',
    linkLabel: 'Interview profile',
  },
  {
    id: 'devices',
    icon: 'microphone',
    title: 'Camera and microphone trouble',
    body: 'Pick your input devices and run the four checks — microphone, camera, connection, browser — before a session rather than during one.',
    to: '/settings/devices',
    linkLabel: 'Devices and diagnostics',
  },
]

/** Things you can do from here, rather than read about. */
export const HELP_ACTIONS = [
  { id: 'setup', icon: 'userCheck', label: 'Run first-run setup again', to: '/welcome/setup' },
  { id: 'settings', icon: 'settings', label: 'All settings', to: '/settings' },
]

/**
 * The line that stops the menu implying a support team. It says what the
 * prototype is instead of offering a channel that would go nowhere.
 */
export const HELP_NOTE = `This is a prototype — ${TRIAL_DAYS}-day trial, plans and reports all run in your browser, and there is no live chat or support inbox behind this menu.`
