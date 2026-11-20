// Offline "brain dump" organiser. Rule-based, so it works with no model and never invents deadlines.
import { addDays, daysUntil, iso, today } from './dates'

const MONTHS = { jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11 }
const WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const MON = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?'
const LEAD = '(?:(?:by|before|due|on|until|till)\\s+)?'

const monthIdx = (w) => MONTHS[w] ?? MONTHS[w.slice(0, 3)]

function fromMonthDay(m, d) {
  const now = new Date()
  let y = now.getFullYear()
  let date = new Date(y, m, d)
  if (iso(date) < today()) date = new Date(y + 1, m, d)
  return iso(date)
}

/** Returns { date, match } or null. */
export function findDeadline(text) {
  const s = text.toLowerCase()
  let m
  if ((m = s.match(new RegExp(LEAD + '\\b(today|tonight)\\b')))) return { date: today(), match: m[0] }
  if ((m = s.match(new RegExp(LEAD + '\\btomorrow\\b')))) return { date: addDays(today(), 1), match: m[0] }
  if ((m = s.match(/\bin (\d+) (day|days|week|weeks)\b/))) return { date: addDays(today(), +m[1] * (m[2].startsWith('week') ? 7 : 1)), match: m[0] }
  if ((m = s.match(new RegExp(LEAD + '(?:next |this )?\\b(' + WEEK.join('|') + ')\\b')))) {
    const target = WEEK.indexOf(m[1])
    let diff = (target - new Date().getDay() + 7) % 7
    if (diff === 0) diff = 7
    return { date: addDays(today(), diff), match: m[0] }
  }
  if ((m = s.match(new RegExp(LEAD + '\\b(' + MON + ')\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b')))) return { date: fromMonthDay(monthIdx(m[1]), +m[2]), match: m[0] }
  if ((m = s.match(new RegExp(LEAD + '\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(' + MON + ')\\b')))) return { date: fromMonthDay(monthIdx(m[2]), +m[1]), match: m[0] }
  if ((m = s.match(new RegExp(LEAD + '\\bnext week\\b')))) return { date: addDays(today(), 7), match: m[0] }
  if ((m = s.match(new RegExp(LEAD + '\\b(?:this )?weekend\\b')))) {
    const diff = (6 - new Date().getDay() + 7) % 7 || 7
    return { date: addDays(today(), diff), match: m[0] }
  }
  return null
}

function findMinutes(text) {
  const m = text.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/)
  if (!m) return null
  return Math.round(parseFloat(m[1]) * (m[2].startsWith('h') ? 60 : 1))
}

export function catFor(text) {
  const s = text.toLowerCase()
  const has = (re) => re.test(s)
  if (has(/\b(exam|exams|study|assignments?|homework|essays?|lecture|revise|quiz|class|lab|thesis|finals?|midterm|course|chapter|read)\b/)) return 'Study'
  if (has(/\b(projects?|code|coding|build|app|program|java|react|bug|deploy|website|ui|design|github|repo|feature)\b/)) return 'Project'
  if (has(/\b(clean|laundry|groceries|grocery|cook|errand|bills?|pay|rent|tidy|organi[sz]e|desk|buy|shop|repair)\b/)) return 'Home'
  if (has(/\b(gym|workout|doctor|dentist|sleep|run|walk|meditat\w*|yoga|exercise|stretch|appointment)\b/)) return 'Health'
  if (has(/\b(call|text|birthday|meet|friend|family|party|mom|dad|grandma|visit|gift)\b/)) return 'People'
  return 'General'
}

const STEPS = [
  [/\b(exam|test|quiz|revise|study|finals?|midterm)\b/, ['List the topics that will be covered', 'Review notes and summarise each topic', 'Practise past questions', 'Take a timed mock test', 'Review mistakes and revisit weak spots']],
  [/\b(assignment|essay|report|homework|write|thesis|paper)\b/, ['Read the requirements carefully', 'Gather notes and sources', 'Outline the main sections', 'Draft the easiest section first', 'Finish the draft and proofread']],
  [/\b(project|build|code|app|ui|website|program|feature|bug)\b/, ['Decide what “done” looks like', 'Break it into small features', 'Build the simplest working version', 'Test it and fix rough edges', 'Polish and finish']],
  [/\b(clean|organi[sz]e|tidy|desk|laundry)\b/, ['Set a 10-minute timer', 'Clear one surface', 'Sort into keep / donate / bin', 'Put things back in their homes']],
  [/\b(call|email|text|message|reply)\b/, ['Decide what you want to say', 'Jot down 2–3 key points', 'Send it or make the call']],
  [/\b(buy|groceries|grocery|shop|errand)\b/, ['Write the list', 'Check your budget', 'Go or order online', 'Put everything away']],
  [/\b(trip|travel|book|plan|holiday|weekend)\b/, ['Pick dates', 'Set a budget', 'Research options', 'Book the essentials']],
]
export function suggestSteps(title) {
  const s = title.toLowerCase()
  for (const [re, steps] of STEPS) if (re.test(s)) return steps
  return ['Clarify what “finished” looks like', 'Do the smallest first step (just 5 minutes)', 'Keep going for one focused session', 'Review and wrap up']
}

export const DIFFICULT_STEPS = ['Skim the topic to see its shape', 'Write down the 3 main requirements', 'Find one clear explanation or example', 'Split the work into sections', 'Start with the easiest section']

const VERBS = /^(finish|complete|write|study|prepare|revise|read|call|email|text|buy|pay|clean|submit|send|fix|build|plan|book|schedule|practi[sc]e|review|organi[sz]e|cook|make|do|start|learn|research|create|design|update|ask|visit|return|pick|renew|apply|register|wash|go|get|find|check|take|water|meet|help|prep|revisit|work|print|finalise|finalize|set|sort|call|attend|join|watch|try|clear|pack|move|book|reply|follow)\b/i
const FILLER = /^(?:(?:so|and|also|then|plus|oh and|but)\s+)*(?:i\s+(?:really\s+|also\s+)?(?:have to|need to|must|should|gotta|got to|want to|ought to|have|need|am going to|will)|i'?ll|i'?m going to|we need to|need to|have to|gotta|must|should|remember to|don'?t forget to|don'?t forget)\s+/i
const TASK_NOUN = /\b(assignments?|homework|essay|report|project|presentation|lab|thesis|paper)\b/i
const EXAM_NOUN = /\b(exams?|tests?|quiz(?:zes)?|finals?|midterms?)\b/i
const OBSTACLE = /(can'?t|cannot|don'?t know how|do not know how|stuck|struggl|overwhelm|too (?:hard|difficult|much|big)|no idea|confus|not sure how|afraid|anxious|worried)/i
const QUESTION = /(\?\s*$|^(?:how|what|when|where|why|should|can|could|do|does|is|are|which)\b)/i
const INFO = /^(?:it'?s|it is|i am|i'?m|my [\w ]+ is|there is|there'?s|today is|the [\w ]+ is)\b/i
const LOW = /(maybe|someday|eventually|when i have time|if i can|at some point|sometime|no rush)/i
const HIGH = /(urgent|asap|important|critical|exam|due soon|really need)/i

const clean = (s) => s.replace(/\s+/g, ' ').replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '')
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)

function shapeTitle(frag) {
  let f = frag.replace(/^(?:a|an|some)\s+/i, '')
  if (VERBS.test(f)) return cap(f)
  if (EXAM_NOUN.test(f)) return 'Prepare for ' + f.replace(/^(?:my|the)\s+/i, '')
  if (TASK_NOUN.test(f)) return 'Work on ' + f.replace(/^(?:the)\s+/i, '')
  return 'Take care of ' + f.replace(/^(?:the)\s+/i, '')
}

export function parseBrainDump(raw) {
  const tasks = []
  const notes = []
  const sentences = raw.split(/(?<=[.!?])\s+|\n+/).map(clean).filter(Boolean)
  let nid = 0
  for (const sentence of sentences) {
    const isQ = QUESTION.test(sentence)
    const isObs = OBSTACLE.test(sentence)
    if (isQ || isObs) {
      notes.push({ id: 'n' + nid++, type: isObs ? 'obstacle' : 'question', text: sentence })
      if (isObs && TASK_NOUN.test(sentence)) {
        const noun = sentence.match(TASK_NOUN)[1].toLowerCase()
        addTask(`Work on ${noun}`, sentence)
      }
      continue
    }
    const frags = sentence.split(/\s*[,;]\s*(?:and\s+|then\s+)?|\s+and\s+|\s+then\s+|\s+also\s+/i).map(clean).filter((f) => f.length > 2)
    for (const frag of frags) {
      const stripped = clean(frag.replace(FILLER, ''))
      if (!stripped || /^(um|uh|and|so|then|also)$/i.test(stripped)) continue
      if (INFO.test(stripped) && !VERBS.test(stripped) && !/\bdue\b|deadline/i.test(stripped) && !TASK_NOUN.test(stripped) && !EXAM_NOUN.test(stripped)) {
        notes.push({ id: 'n' + nid++, type: 'info', text: cap(stripped) })
        continue
      }
      addTask(stripped, frag)
    }
  }

  function addTask(text, source) {
    const dl = findDeadline(source)
    const minutes = findMinutes(source)
    let t = text
    if (dl) t = clean(t.replace(new RegExp(dl.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ''))
    t = clean(t.replace(/\b(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i, ''))
    t = clean(t.replace(/\b(by|before|due|on|for|in|is|are)$/i, ''))
    const subj = t.match(/^(.*?)\s+(?:is|are)\s+due\b/i)
    if (subj) t = clean(subj[1].replace(/^(?:the|my)\s+/i, ''))
    if (!t) return
    const title = shapeTitle(t)
    const lc = title.toLowerCase()
    const twin = tasks.find((x) => x.title.toLowerCase().includes(lc) || lc.includes(x.title.toLowerCase()))
    if (twin) {
      if (!twin.deadline && dl) { twin.deadline = dl.date; twin.missing = [] }
      return
    }
    const n = dl ? daysUntil(dl.date) : null
    let priority = 'medium'
    if (HIGH.test(source) || (n !== null && n <= 3)) priority = 'high'
    else if (LOW.test(source)) priority = 'low'
    const category = catFor(title + ' ' + source)
    let est = minutes
    if (!est) {
      if (/\b(call|email|text|pay|reply|buy)\b/i.test(title)) est = 20
      else if (/\b(exam|project|build|study)\b/i.test(title)) est = 120
      else if (/\b(assignment|essay|report|thesis)\b/i.test(title)) est = 90
      else est = 45
    }
    tasks.push({
      key: 't' + tasks.length,
      include: true,
      title,
      category,
      priority,
      deadline: dl ? dl.date : '',
      minutes: est,
      steps: [],
      withSteps: false,
      dependsOnKey: null,
      missing: dl ? [] : ['deadline'],
    })
  }

  // light dependency guess: "submit/send/present X" waits for an earlier task that shares a keyword
  tasks.forEach((t, i) => {
    if (!/^(submit|send|present|publish|hand in|deliver)\b/i.test(t.title)) return
    const words = t.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !VERBS.test(w))
    const dep = tasks.find((o, j) => j !== i && !/^(submit|send|present|publish)\b/i.test(o.title) && words.some((w) => o.title.toLowerCase().includes(w)))
    if (dep) t.dependsOnKey = dep.key
  })
  tasks.forEach((t) => (t.steps = suggestSteps(t.title)))
  return { tasks, notes }
}
