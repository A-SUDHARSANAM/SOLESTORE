function GradientBackground({ children, className = '', ...props }) {
  return (
    <div className={`gradient-dashboard relative isolate overflow-hidden ${className}`} {...props}>
      <div className="gradient-blob gradient-blob-orange" />
      <div className="gradient-blob gradient-blob-beige" />
      <div className="gradient-blob gradient-blob-white" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default GradientBackground
