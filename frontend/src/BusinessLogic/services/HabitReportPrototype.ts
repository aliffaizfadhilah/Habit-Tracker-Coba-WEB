export type SectionType = 'badge' | 'summary_text' | 'stats' | 'progress_bar' | 'day_analysis' | 'calendar' | 'streak_info'
export type ReportType  = 'ongoing' | 'final'

export class HabitReport {
  type:     ReportType   = 'ongoing'
  sections: SectionType[] = []

  clone(): HabitReport {
    const copy     = new HabitReport()
    copy.type      = this.type
    copy.sections  = [...this.sections]
    return copy
  }
}

const ongoingPrototype    = new HabitReport()
ongoingPrototype.type     = 'ongoing'
ongoingPrototype.sections = ['stats', 'progress_bar', 'day_analysis', 'calendar', 'streak_info']

const finalPrototype    = new HabitReport()
finalPrototype.type     = 'final'
finalPrototype.sections = ['badge', 'summary_text', 'stats', 'progress_bar', 'day_analysis', 'calendar', 'streak_info']

export function createReport(isFinal: boolean): HabitReport {
  return isFinal ? finalPrototype.clone() : ongoingPrototype.clone()
}
