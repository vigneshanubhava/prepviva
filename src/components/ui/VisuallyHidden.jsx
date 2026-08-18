/** Visible to screen readers only. */
export default function VisuallyHidden({ as: Tag = 'span', children, ...rest }) {
  return (
    <Tag
      {...rest}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Tag>
  )
}
