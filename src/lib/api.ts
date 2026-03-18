import { supabase } from './supabase'
import { Report, MachineStats, FormData } from '../types'
import { subDays, startOfDay, parseISO } from 'date-fns'

const RECENT_REPORTS_WINDOW = 5

export async function submitReport(data: FormData): Promise<Report | null> {
  const { data: report, error } = await supabase
    .from('reports')
    .insert([
      {
        machine_id: data.machine_id,
        is_broken: data.is_broken,
        broken_reason: data.broken_reason ?? null,
        temperature_setting: data.temperature_setting,
        reran_count: data.reran_count,
        load_weight_kg: data.load_weight_kg,
        load_type: data.load_type,
        comments: data.comments,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error submitting report:', error)
    return null
  }

  return report
}

export async function getReportsForMachine(machineId: number): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('machine_id', machineId)
    .order('created_at', { ascending: false })

  console.log(data);

  if (error) {
    console.error('Error fetching reports:', error)
    return []
  }

  return data || []
}

export async function getMachineStats(machineId: number): Promise<MachineStats | null> {
  const reports = await getReportsForMachine(machineId)
  
  if (reports.length === 0) {
    return {
      machine_id: machineId,
      recent_reports_total: 0,
      recent_reports_broken: 0,
      broken_today: 0,
      total_today: 0,
      broken_last_7_days: 0,
      total_last_7_days: 0,
      latest_report: undefined
    }
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const sevenDaysAgo = subDays(now, 7)

  const recentReports = reports.slice(0, RECENT_REPORTS_WINDOW)
  const recentBrokenCount = recentReports.filter(report => report.is_broken).length
  let brokenToday = 0
  let totalToday = 0
  let brokenLast7 = 0
  let totalLast7 = 0

  reports.forEach(report => {
    const reportDate = parseISO(report.created_at)

    // Count today
    if (reportDate >= todayStart) {
      totalToday++
      if (report.is_broken) {
        brokenToday++
      }
    }

    // Count last 7 days
    if (reportDate >= sevenDaysAgo) {
      totalLast7++
      if (report.is_broken) {
        brokenLast7++
      }
    }
  })

  return {
    machine_id: machineId,
    recent_reports_total: recentReports.length,
    recent_reports_broken: recentBrokenCount,
    broken_today: brokenToday,
    total_today: totalToday,
    broken_last_7_days: brokenLast7,
    total_last_7_days: totalLast7,
    latest_report: reports[0]
  }
}

export async function getAllMachinesStats(): Promise<MachineStats[]> {
  const stats: MachineStats[] = []
  for (let i = 0; i < 4; i++) {
    const machineStats = await getMachineStats(i + 325);
    if (machineStats) {
      stats.push(machineStats)
    }
  }
  return stats
}
