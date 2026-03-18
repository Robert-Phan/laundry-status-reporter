import React, { useState } from 'react'
import { FormData } from '../types'
import styles from './ReportForm.module.css'

interface ReportFormProps {
  onSubmit: (data: FormData) => void
  isLoading: boolean
  defaultMachineId: number
}

export const ReportForm: React.FC<ReportFormProps> = ({ 
  onSubmit, 
  isLoading, 
  defaultMachineId
}) => {
  const [formData, setFormData] = useState<FormData>({
    machine_id: defaultMachineId,
    is_broken: false,
    broken_reason: undefined,
    temperature_setting: 'med',
    reran_count: 0,
    load_weight_kg: undefined,
    load_type: undefined,
    comments: ''
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.currentTarget

    if (type === 'checkbox') {
      const checked = (e.currentTarget as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'radio') {
      if (name === 'is_broken') {
        const isBroken = value === 'true'
        setFormData(prev => ({
          ...prev,
          is_broken: isBroken,
          broken_reason: isBroken ? (prev.broken_reason ?? 'not_correct') : undefined
        }))
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseFloat(value)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.is_broken) {
      onSubmit({
        ...formData,
        broken_reason: undefined
      })
      return
    }

    if (formData.broken_reason === 'cant_start') {
      onSubmit({
        ...formData,
        temperature_setting: undefined,
        reran_count: undefined,
        load_weight_kg: undefined,
        load_type: undefined
      })
      return
    }

    onSubmit(formData)
  }

  const showDryingDetails = !(formData.is_broken && formData.broken_reason === 'cant_start')

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="machine_id">Machine Number</label>
        <select
          id="machine_id"
          name="machine_id"
          value={formData.machine_id}
          onChange={handleChange}
        >
          <option value={325}>325</option>
          <option value={326}>326</option>
          <option value={327}>327</option>
          <option value={328}>328</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Is it broken?</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="is_broken"
              value="false"
              onChange={handleChange}
              checked={!formData.is_broken}
            />
            <span>No</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="is_broken"
              value="true"
              checked={formData.is_broken}
              onChange={handleChange}
            />
            <span>Yes</span>
          </label>
        </div>
      </div>

      {formData.is_broken && (
        <div className={styles.formGroup}>
          <label>Why is it broken?</label>
          <div className={styles.reasonRadioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="broken_reason"
                value="not_correct"
                checked={formData.broken_reason === 'not_correct'}
                onChange={handleChange}
              />
              <span>Used the machine but doesn't function correctly</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="broken_reason"
                value="cant_start"
                checked={formData.broken_reason === 'cant_start'}
                onChange={handleChange}
              />
              <span>Can't start the machine</span>
            </label>
          </div>
        </div>
      )}

      {showDryingDetails && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="temperature_setting">What did you use for temperature setting?</label>
            <select
              id="temperature_setting"
              name="temperature_setting"
              value={formData.temperature_setting ?? 'med'}
              onChange={handleChange}
              defaultValue={'med'}
            >
              <option value="delicates">Delicates</option>
              <option value="no">No Heat</option>
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reran_count">Did you rerun the dryer at all? How many times?</label>
            <input
              id="reran_count"
              type="number"
              name="reran_count"
              min="0"
              value={formData.reran_count ?? 0}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="load_weight_kg">How much did your load weigh (in lbs)? (optional)</label>
            <input
              id="load_weight_kg"
              type="number"
              name="load_weight_kg"
              step="0.1"
              min="0"
              placeholder="e.g., 2.5lbs"
              value={formData.load_weight_kg ?? ''}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="load_type">What kind of load was it? (optional)</label>
            <select
              id="load_type"
              name="load_type"
              value={formData.load_type ?? ''}
              onChange={handleChange}
            >
              <option value="">Not specified</option>
              <option value="clothes">Clothes</option>
              <option value="blankets">Blankets</option>
              <option value="towels">Towels</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="comments">Comments (optional)</label>
        <textarea
          id="comments"
          name="comments"
          placeholder="Add any additional details..."
          value={formData.comments ?? ''}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}
