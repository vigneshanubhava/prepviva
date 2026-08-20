/**
 * The two checks every attach in this app makes — extension and size.
 *
 * They live here rather than inside FileDrop because there is now a second
 * picker (AvatarUpload), and a second copy of the rules is a second place for
 * them to drift. Returns `null` when the file is fine, and the message the
 * screen should show when it is not.
 */
export function checkFile(file, { accept = [], maxMB } = {}) {
  const named = String(file?.name || '').toLowerCase()

  if (accept.length && !accept.some((ext) => named.endsWith(ext))) {
    return { reason: 'type', message: `That file type is not accepted — use ${accept.join(', ')}.` }
  }
  if (maxMB && file.size > maxMB * 1024 * 1024) {
    return { reason: 'size', message: `That file is over ${maxMB}MB.` }
  }
  return null
}
