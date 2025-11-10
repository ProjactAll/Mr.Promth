'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  itemName?: string
  itemType?: string
  dangerLevel?: 'low' | 'medium' | 'high'
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemType = 'รายการ',
  dangerLevel = 'medium'
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen) return null

  const requireConfirmation = dangerLevel === 'high'
  const expectedConfirmText = 'DELETE'
  const canConfirm = !requireConfirmation || confirmText === expectedConfirmText

  const handleConfirm = async () => {
    if (!canConfirm) return

    setIsDeleting(true)
    try {
      await onConfirm()
      toast.success(`ลบ${itemType}สำเร็จ`)
      onClose()
      setConfirmText('')
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message || 'ไม่สามารถลบได้'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('')
      onClose()
    }
  }

  const getDangerColor = () => {
    switch (dangerLevel) {
      case 'low':
        return 'yellow'
      case 'high':
        return 'red'
      default:
        return 'orange'
    }
  }

  const color = getDangerColor()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Icon */}
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-${color}-100 mb-4`}>
            <svg
              className={`h-6 w-6 text-${color}-600`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className={`text-lg font-bold text-${color}-900 text-center mb-2`}>
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-4">
            {message}
          </p>

          {/* Item Name */}
          {itemName && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-500 mb-1">{itemType}ที่จะลบ:</p>
              <p className="font-semibold text-gray-900 break-all">
                "{itemName}"
              </p>
            </div>
          )}

          {/* High danger confirmation */}
          {requireConfirmation && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                พิมพ์ <span className="font-mono font-bold text-red-600">{expectedConfirmText}</span> เพื่อยืนยัน:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={expectedConfirmText}
                disabled={isDeleting}
                autoFocus
              />
            </div>
          )}

          {/* Warning */}
          <div className={`bg-${color}-50 border-l-4 border-${color}-400 p-3 mb-6`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 text-${color}-400`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm text-${color}-700`}>
                  <strong>คำเตือน:</strong> การดำเนินการนี้ไม่สามารถยกเลิกได้
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting || !canConfirm}
              className={`flex-1 px-4 py-2 bg-${color}-600 text-white font-medium rounded-lg hover:bg-${color}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  กำลังลบ...
                </>
              ) : (
                'ยืนยันการลบ'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
