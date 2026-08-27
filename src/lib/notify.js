// notify.js — the Notification API wrapper, so no component touches the global
// directly. Everything here degrades to a no-op where the API is absent (iOS
// Safari, jsdom), leaving callers guard-free.

// One tag for every block-end popup: a second block replaces the first rather
// than stacking another unread notification behind it.
const TAG = 'paradone-block-end'

function supported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission() {
  return supported() ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission() {
  if (!supported()) return 'unsupported'
  return Notification.requestPermission()
}

export function showNotification(title, body) {
  if (notificationPermission() !== 'granted') return
  const notification = new Notification(title, { body, tag: TAG })
  // The popup only fires while the tab is hidden, so its one useful action is
  // bringing the user back to the block-end choice.
  notification.onclick = () => window.focus()
}
