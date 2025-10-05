import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      data-slot="skeleton"
      className={cn(
        "bg-accent rounded-md motion-safe:animate-pulse motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
