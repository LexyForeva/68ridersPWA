export default function GlassCard({ children, className = '', as: Component = 'div', ...props }) {
  return (
    <Component className={`glass ${className}`} {...props}>
      {children}
    </Component>
  )
}
