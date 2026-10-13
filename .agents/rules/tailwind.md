# Tailwind CSS Guidelines

## Styling Principles
- Use utility classes directly rather than writing custom CSS files.
- Adopt a mobile-first responsive approach (`sm:`, `md:`, `lg:`, `xl:`).
- Group related utilities logically (layout -> sizing -> typography -> background/colors -> states).
- Use `@apply` sparingly, only for recurring high-frequency patterns when components cannot be abstracted.
- Leverage Shadcn UI conventions where applicable for reusable primitive components.

## Colors & Theming
- Use semantic color tokens (e.g., `bg-background`, `text-foreground`, `border-muted`) over hardcoded hex values.
- Ensure proper color contrast for accessibility (WCAG AA compliant).
- Use dark mode classes (`dark:...`) with clean theme switching.

## Layout & Components
- Prefer Flexbox and CSS Grid utilities over absolute positioning.
- Use consistent spacing scale (`gap-4`, `p-6`, `m-2`).
- Include subtle transitions and hover/focus states (`transition-colors`, `hover:opacity-90`, `focus-visible:ring-2`).
