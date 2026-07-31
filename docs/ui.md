# UI Components

All UI elements in this app use **shadcn/ui**. Do not create custom components.

## Rules

- **Always** use shadcn/ui components for any UI element (buttons, inputs, dialogs, cards, badges, tables, etc.).
- **Never** build custom components from scratch — if shadcn/ui has it, use it.
- If a component is not yet installed, add it via `npx shadcn@latest add <component>` before using it.
- Do not wrap shadcn/ui components in unnecessary custom wrapper components.
- Compose complex UI by combining existing shadcn/ui primitives.

## Component Reference

Browse available components at [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).

Components live in `components/ui/` after installation.
