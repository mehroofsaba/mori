// Rule-based problem-solving companion: offers ideas, never decides for the user.
import { suggestSteps, DIFFICULT_STEPS } from './parser'
import { sequence } from './planner'
import { isDone } from './meta'

const findTask = (msg, tasks) => {
  const m = msg.toLowerCase()
  return tasks.filter((t) => !isDone(t)).find((t) => t.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3).some((w) => m.includes(w)))
}

export function respond(message, tasks) {
  const m = message.toLowerCase()
  const task = findTask(m, tasks)
  const top = sequence(tasks.filter((t) => !isDone(t)), tasks).slice(0, 3)

  if (/overwhelm|too much|so many|panic|anxious|stress|can'?t cope|drowning/.test(m)) {
    return {
      text: "That sounds like a lot, and it's okay to feel that way. Nothing here needs to be solved all at once. Let's shrink the garden for today: pick just one or two of the plants below, and let everything else wait.",
      picks: top.map((t) => t.title),
      steps: null,
      hint: 'Try the Daily Plan with “gentle mode” on in Settings. It caps the day at three tasks.',
    }
  }
  if (/too (big|large|huge)|where (do i|to) (start|begin)|don'?t know where|huge|break (it|this) down|so big/.test(m)) {
    return {
      text: task
        ? `“${task.title}” can feel big because it's really several small things in a trench coat. Here's one way to cut it down. Change anything that doesn't fit.`
        : "Big tasks get easier once they're cut into pieces you could finish in one sitting. Here's a flexible starting split. Reword it to match your task.",
      steps: suggestSteps(task ? task.title : message),
      taskId: task?.id,
    }
  }
  if (/hard|difficult|confus|don'?t understand|do not understand|topic|complicated|lost/.test(m)) {
    return {
      text: "When a topic feels too difficult, it often helps to make it smaller and more concrete before you try to understand it. A few ideas to try:",
      steps: DIFFICULT_STEPS,
      taskId: task?.id,
    }
  }
  if (/can'?t (start|begin|focus|concentrate)|procrastinat|motivat|lazy|tired|bored|avoid|put(ting)? off|stuck/.test(m)) {
    return {
      text: "Starting is usually the hardest part, and that's very human. Try the five-minute seed rule: promise yourself just five minutes on the smallest piece. You're allowed to stop afterwards, and most of the time you won't want to.",
      steps: task ? suggestSteps(task.title).slice(0, 2) : ['Pick the smallest task', 'Set a five-minute timer', 'Work until it rings, then decide'],
      taskId: task?.id,
    }
  }
  return {
    text: "I'd like to understand this a bit better. What feels like the sticking point: the size of the task, not knowing how to begin, or having too many things at once? In the meantime, here's a gentle default.",
    steps: suggestSteps(task ? task.title : message).slice(0, 4),
    taskId: task?.id,
  }
}
