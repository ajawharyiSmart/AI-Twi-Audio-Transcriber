import { cn } from "../../lib/utils"

const Button = ({ className, variant = "default", size = "default", ...props }) => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export { Button }
