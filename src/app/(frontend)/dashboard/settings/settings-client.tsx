'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient, signOut } from '@/lib/auth-client'

export function SettingsClient({
  userName,
  userEmail,
}: {
  userName: string
  userEmail: string
}) {
  const router = useRouter()
  const [name, setName] = useState(userName)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [deleting, setDeleting] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveMessage('')
    try {
      await authClient.updateUser({ name: name.trim() })
      setSaveMessage('Profile updated')
      router.refresh()
    } catch {
      setSaveMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setPasswordSaving(true)
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      setPasswordMessage('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError('Failed to change password. Check your current password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone. All your presets will be permanently deleted.')) {
      return
    }
    setDeleting(true)
    try {
      await authClient.deleteUser()
      await signOut()
      window.location.href = '/'
    } catch {
      alert('Failed to delete account. Please try again.')
      setDeleting(false)
    }
  }

  const inputClasses = 'w-full rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] px-4 py-2.5 text-sm text-[var(--lp-text)] placeholder:text-[var(--lp-text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-colors'
  const buttonClasses = 'rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50'

  return (
    <div className="flex flex-col gap-10">
      {/* Profile Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--lp-text)] mb-4">Profile</h2>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[var(--lp-text-muted)] mb-1.5">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--lp-text-muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className={`${inputClasses} opacity-50 cursor-not-allowed`}
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className={buttonClasses}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saveMessage && (
              <span className="text-xs text-[var(--lp-text-muted)]">{saveMessage}</span>
            )}
          </div>
        </form>
      </section>

      {/* Change Password Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--lp-text)] mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[var(--lp-text-muted)] mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--lp-text-muted)] mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClasses}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--lp-text-muted)] mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
              required
              minLength={8}
            />
          </div>
          {passwordError && (
            <p className="text-xs text-red-500">{passwordError}</p>
          )}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={passwordSaving} className={buttonClasses}>
              {passwordSaving ? 'Changing...' : 'Change Password'}
            </button>
            {passwordMessage && (
              <span className="text-xs text-[var(--lp-text-muted)]">{passwordMessage}</span>
            )}
          </div>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="rounded-lg border border-red-500/20 p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-[var(--lp-text-muted)] mb-4">
          Permanently delete your account and all of your presets. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="rounded-lg bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </section>
    </div>
  )
}
