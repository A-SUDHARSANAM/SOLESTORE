const parseList = (value) =>
  value
    ? value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : []

export const adminEmailsFromEnv = parseList(import.meta.env.VITE_ADMIN_EMAILS)
export const adminUidsFromEnv = parseList(import.meta.env.VITE_ADMIN_UIDS)

export function isAdminUser(user, storeSettings) {
  if (!user) return false

  const email = user.email?.toLowerCase()
  const uid = user.uid
  const settingEmails = (storeSettings?.adminEmails ?? []).map((entry) => entry.toLowerCase())
  const settingUids = storeSettings?.adminUids ?? []

  return (
    (email && adminEmailsFromEnv.includes(email)) ||
    (uid && adminUidsFromEnv.includes(uid)) ||
    (email && settingEmails.includes(email)) ||
    (uid && settingUids.includes(uid))
  )
}
