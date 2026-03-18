import React from 'react'
import { Report } from '../types'
import { formatDistanceToNow } from 'date-fns'
import styles from './ReportCard.module.css'

interface ReportCardProps {
  report: Report
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const timeAgo = formatDistanceToNow(new Date(report.created_at), { addSuffix: true })

  const tempSettingFormat = {
    'delicates': "Delicates",
    'no': "No Heat",
    'low': "Low Heat",
    'med': "Medium Heat",
    'high': "High Heat"
  }

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.time}>{timeAgo}</div>
        <div className={`${styles.status} ${report.is_broken ? styles.broken : styles.working}`}>
          {report.is_broken ? 'Broken' : 'Working'}
        </div>
      </div>

      <div className={styles.content}>
        {report.temperature_setting && (
          <div className={styles.row}>
            <span className={styles.label}>Temperature Setting:</span>
            <span className={styles.value}>{tempSettingFormat[report.temperature_setting]}</span>
          </div>
        )}

        {(report.reran_count !== null && report.reran_count !== undefined) && (
          <div className={styles.row}>
            <span className={styles.label}>Reran Machine:</span>
            <span className={styles.value}>{report.reran_count} time{report.reran_count !== 1 ? 's' : ''}</span>
          </div>
        )}

        {report.load_weight_kg && (
          <div className={styles.row}>
            <span className={styles.label}>Load Weight:</span>
            <span className={styles.value}>{report.load_weight_kg} kg</span>
          </div>
        )}

        {report.load_type && (
          <div className={styles.row}>
            <span className={styles.label}>Load Type:</span>
            <span className={styles.value}>{capitalizeFirstLetter(report.load_type)}</span>
          </div>
        )}

        {report.comments && (
          <div className={styles.comments}>
            <span className={styles.label}>Comments:</span>
            <p className={styles.value}>{report.comments}</p>
          </div>
        )}
      </div>
    </div>
  )
}
