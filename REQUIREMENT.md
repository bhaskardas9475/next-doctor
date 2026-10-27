# Task: Build a doctor's clinic management app (Next.js + Base UI)

Build a production-quality web app for doctors using **Next.js (App Router, latest stable), TypeScript (strict), and Base UI** (the unstyled component library from MUI; check the current npm package name, `@base-ui/react` or `@base-ui-components/react`, and use the Combobox, Dialog, Select, Field, Input, Button, etc. primitives as appropriate). Style with **Tailwind CSS**. Do not use any other component library.

## Tech stack

- Next.js App Router, React Server Components where sensible, Server Actions for mutations
- TypeScript strict mode, ESLint + Prettier
- Prisma + SQLite (easy local setup, swappable later)
- Zod for validation (shared between client forms and server actions)
- `react-hook-form` (with `useFieldArray`) + `@hookform/resolvers/zod` for forms
- `jose` for signed-cookie sessions
- `sonner` (or a Base UI Toast) for notifications

## Routes / views

| Route                       | Purpose                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                         | Login page. Predefined credentials from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), no signup. Redirect to `/dashboard` if already logged in. |
| `/dashboard`                | Tiles showing counts: Patients, Medicines, Tests, Prescriptions. Each tile links to its page.                                            |
| `/medicines`                | Create medicine + list                                                                                                                   |
| `/tests`                    | Create test + list                                                                                                                       |
| `/patients`                 | Create patient + list                                                                                                                    |
| `/prescriptions`            | Create prescription + list + print                                                                                                       |
| `/prescriptions/[id]/print` | Print-friendly prescription page (see Print section)                                                                                     |

All routes except `/` are protected via `middleware.ts` (verify the session cookie, redirect to `/` if missing or invalid). Include a shared authenticated layout with a sidebar/nav and a logout button.

## Layout of every list view (`/medicines`, `/tests`, `/patients`, `/prescriptions`)

Each page has **two sections**:

1. **Create section**: a form (inline card or Base UI Dialog opened via an "Add" button) with validation and error messages.
2. **List section**: a table with
   - **server-side search** (debounced input, synced to URL search params `?q=`)
   - **server-side pagination** (`?page=&pageSize=`, page-size selector, prev/next, total count)
   - empty state, loading state, and newest-first default ordering

Search and pagination state must live in the URL so pages are shareable and refresh-safe.

## Data models (Prisma)

- **Medicine**: id, name (unique), dosage form/strength (optional), notes, createdAt
- **Test**: id, name (unique), description, createdAt
- **Patient**: id, **code** (unique, serialized, short, e.g. `PT-0001`), name, age, gender, phone, notes, createdAt
- **Prescription**: id, **number** (serialized, e.g. `RX-0001`), patientId, diagnosis/notes, createdAt
- **PrescriptionMedicine** (join): id, prescriptionId, medicineId, dosage, frequency, duration, instructions (optional)
- **PrescriptionTest** (join): id, prescriptionId, testId, instructions (optional)
- **Counter**: key, value (for generating serial codes)

### Serial code generation

Generate unique, short, serialized codes for patients (`PT-0001`, `PT-0002`, ...) and prescriptions (`RX-0001`, ...). Implement using the `Counter` table inside a **single database transaction** with the insert so concurrent creates never produce duplicates. Zero-pad to at least 4 digits. Show the patient code in the patient list and in patient dropdowns. Make the code searchable.

## Prescription form

- **Patient**: single-select **searchable dropdown** (Base UI Combobox), searches by name or code, with async loading from a server endpoint or action.
- **Medicines (repeatable rows)**:
  - Use `useFieldArray`. Each row has a **single-select searchable Combobox** for the medicine, plus inputs for dosage, frequency, duration, and optional instructions.
  - An **"Add medicine"** button appends a new row; each row has a **remove** button. Start with one empty row.
  - Prevent selecting the same medicine in two rows (disable or flag already-selected options, and validate on the server).
- **Tests (repeatable rows)**:
  - Same pattern: each row has a **single-select searchable Combobox** for the test plus an optional instructions input, with **"Add test"** and per-row remove.
  - Prevent duplicate tests across rows.
- Diagnosis/notes textarea.
- Validation (Zod, client and server): a patient is required; at least one complete medicine row or test row; ignore fully empty rows on submit; partially filled rows show field-level errors.
- Comboboxes load results asynchronously (debounced) from `api/lookup/[entity]`, and must show the currently selected item's label correctly when editing or re-rendering.
- Optional: allow editing an existing prescription using the same form.

## Prescription list and detail

- Table columns: Prescription # , patient (name + code), medicine count, test count, date, actions (View, Print).
- Row click or "View" opens a Base UI Dialog with the full prescription details and a **Print** button.

## Print option

- Provide a **Print** action in the prescription list (row action), in the detail dialog, and right after a prescription is created (toast or button: "Print now").
- Implement a dedicated route `/prescriptions/[id]/print` rendering a clean, print-optimized layout, with a **Print** button calling `window.print()` (hidden when printing) and a Back link. Opening it from the list should open in a new tab, or auto-trigger print via `?autoprint=1`.
- Print layout contents:
  - Clinic/doctor header (name, qualification, registration number, address, phone), configurable via env or a `config/clinic.ts` file
  - Prescription number and date
  - Patient name, code, age, gender
  - Diagnosis/notes
  - Medicines table: #, name, dosage, frequency, duration, instructions
  - Tests list with instructions
  - Signature line for the doctor at the bottom
- Use `@media print` / Tailwind `print:` utilities: A4 page size, sensible margins, hide sidebar/nav/buttons, black-on-white, avoid page breaks inside table rows (`break-inside: avoid`), and repeat nothing unnecessary.
- The print page must be protected by the same session middleware.

## Project structure (follow this, adjust only if there's a good reason)

```
src/
  app/
    (public)/page.tsx                       # login
    (app)/layout.tsx                        # authenticated shell
    (app)/dashboard/page.tsx
    (app)/medicines/page.tsx
    (app)/tests/page.tsx
    (app)/patients/page.tsx
    (app)/prescriptions/page.tsx
    (print)/prescriptions/[id]/print/page.tsx   # minimal layout, no sidebar
    api/lookup/[entity]/route.ts            # search endpoints for comboboxes
  components/
    ui/                                     # Base UI wrappers: Button, Input, Field, Dialog, Combobox, Table, Pagination, Tile, Toast
    layout/                                 # Sidebar, Topbar
    features/{medicines,tests,patients,prescriptions}/   # forms, tables, columns, PrescriptionPrintView
  config/
    clinic.ts                               # doctor/clinic details for print header
  lib/
    auth/                                   # session create/verify, credentials check
    db.ts                                   # Prisma client singleton
    validations/                            # Zod schemas per entity
    utils/                                  # pagination helpers, formatters, code generators
  server/
    actions/                                # server actions per entity
    queries/                                # data-fetching functions (search + pagination)
  types/
prisma/schema.prisma
prisma/seed.ts
middleware.ts
.env.example
```

Keep business logic out of page components. Keep UI primitives reusable and generic; build one reusable `DataTable` + `Pagination` + `SearchInput` used by all four list views, and one reusable async `SearchableCombobox` used for the patient, medicine, and test selectors.

## Quality requirements

- Accessible (labels, keyboard navigation, focus management; rely on Base UI's a11y)
- Responsive layout (usable on tablet)
- No `any`; handle errors from server actions and return typed results
- Server-side validation for every mutation, never trust the client
- Prescription creation (header plus medicine rows plus test rows) must happen in a **single transaction**
- Session cookie: httpOnly, secure in production, sameSite=lax, signed with `SESSION_SECRET`
- Never expose credentials to the client
- Add a `seed.ts` with sample medicines, tests, patients, and one sample prescription
- Include a `README.md` with setup steps (install, env, `prisma migrate dev`, seed, run), the default credentials, how to customize the print header, and a short architecture overview

## Process

1. Briefly state your plan, then scaffold the project.
2. Build in this order: foundation (config, Prisma, UI primitives, reusable Combobox/DataTable) → auth → dashboard → medicines → tests → patients → prescriptions (form with repeatable rows) → print view.
3. Run lint, type-check, and `next build` at the end and fix all errors.
4. Manually verify: add multiple medicine and test rows, remove rows, duplicate prevention, create, view, and print preview (A4) of a prescription.
5. Finish with a short summary of what was built and how to run it.
