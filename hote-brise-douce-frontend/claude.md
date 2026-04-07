# Brice Douce — Angular Refactor Guide

## 1. Project Structure

```
src/app/
├── app.module.ts                      # Root module
├── app-routing.module.ts              # Root router (lazy loads all feature modules)
├── app.component.ts/html/css          # Shell (only <router-outlet>)
│
├── shared/                            # Cross-cutting shared elements
│   └── shared.module.ts               # FormsModule, CommonModule, etc.
│
└── components/
    ├── landing/                        # index.html → Landing page
    │   ├── landing.module.ts
    │   ├── landing-routing.module.ts
    │   ├── landing-navbar/
    │   ├── landing-hero/
    │   ├── landing-stats/
    │   ├── landing-about/
    │   ├── landing-rooms/
    │   ├── landing-services/
    │   ├── landing-contact/
    │   ├── landing-footer/
    │   ├── auth-modal/
    │   └── landing-page/               # Page host component
    │
    ├── client/                         # front-office-client.html → Client portal
    │   ├── client.module.ts
    │   ├── client-routing.module.ts
    │   ├── client-topbar/
    │   ├── client-nav/
    │   ├── client-home/
    │   ├── client-booking/
    │   ├── client-reservations/
    │   ├── client-complaint/
    │   └── client-page/
    │
    ├── personnel/                      # front-office-personnel.html → Staff portal
    │   ├── personnel.module.ts
    │   ├── personnel-routing.module.ts
    │   ├── personnel-topbar/
    │   ├── personnel-nav/
    │   ├── personnel-tasks/
    │   ├── personnel-history/
    │   ├── personnel-profile/
    │   ├── personnel-task-modal/
    │   └── personnel-page/
    │
    └── admin/                          # back-office.html → Admin back-office
        ├── admin.module.ts
        ├── admin-routing.module.ts
        ├── admin-sidebar/
        ├── admin-header/
        ├── admin-dashboard/
        ├── admin-clients/
        ├── admin-rooms/
        ├── admin-reservations/
        ├── admin-cleaning/
        ├── admin-personnel/
        ├── admin-complaints/
        ├── admin-users/
        └── admin-page/
```

---

## 2. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Feature folder | kebab-case | `landing/`, `admin/` |
| Component folder | `[feature]-[role]` | `landing-navbar/`, `admin-sidebar/` |
| Component class | PascalCase | `LandingNavbarComponent` |
| Selector | `app-[feature]-[role]` | `app-landing-navbar` |
| Module | `[Feature]Module` | `LandingModule` |
| Route path | kebab-case | `/admin`, `/client`, `/personnel` |
| CSS variables | kebab-case custom props | `--navy`, `--gold` |

---

## 3. HTML → Angular Component Mapping

### `index.html` → `landing/`
| HTML section | Angular component |
|---|---|
| `<nav>` | `landing-navbar` |
| Hero section | `landing-hero` |
| Stats bar | `landing-stats` |
| Hotel info | `landing-about` |
| Chambres section | `landing-rooms` |
| Services section | `landing-services` |
| Contact section | `landing-contact` |
| `<footer>` | `landing-footer` |
| Modal login/register | `auth-modal` |
| Page host | `landing-page` |

### `back-office.html` → `admin/`
| HTML section | Angular component |
|---|---|
| `<aside>` sidebar | `admin-sidebar` |
| Top header bar | `admin-header` |
| `#s-dashboard` | `admin-dashboard` |
| `#s-clients` | `admin-clients` |
| `#s-chambres` | `admin-rooms` |
| `#s-reservations` | `admin-reservations` |
| `#s-nettoyage` + modal | `admin-cleaning` |
| `#s-personnel` | `admin-personnel` |
| `#s-reclamations` | `admin-complaints` |
| `#s-utilisateurs` | `admin-users` |
| Layout host | `admin-page` |

### `front-office-client.html` → `client/`
| HTML section | Angular component |
|---|---|
| Top bar | `client-topbar` |
| Tab navigation | `client-nav` |
| `#p-accueil` | `client-home` |
| `#p-reservation` (3-step wizard) | `client-booking` |
| `#p-mes-reservations` | `client-reservations` |
| `#p-reclamation` | `client-complaint` |
| Layout host | `client-page` |

### `front-office-personnel.html` → `personnel/`
| HTML section | Angular component |
|---|---|
| Top bar | `personnel-topbar` |
| Tab navigation | `personnel-nav` |
| `#s-mes-taches` | `personnel-tasks` |
| `#s-historique` | `personnel-history` |
| `#s-profil` | `personnel-profile` |
| Update-status modal | `personnel-task-modal` |
| Layout host | `personnel-page` |

---

## 4. Guidelines for Adding New Components

1. **Create the folder** inside the appropriate feature folder:
   ```
   src/app/components/[feature]/[feature]-[name]/
   ```
2. **Generate files** manually or via CLI:
   ```bash
   ng g component components/[feature]/[feature]-[name] --module components/[feature]/[feature].module
   ```
3. **Declare in the feature module** (`[feature].module.ts`).
4. **Use the component** in the feature page host or parent component template.
5. **Never declare a component in two modules** — if needed cross-feature, move to `shared/`.

---

## 5. Assumptions Made During Refactoring

- **No backend services**: All data is static/mock. Services can be added per feature later.
- **Angular 18 NgModule** architecture (not standalone), matching the existing `app.module.ts`.
- **Tailwind CSS via CDN**: The global `styles.css` loads Tailwind and Google Fonts. No PostCSS config.
- **Routing replaces tab/section switching**: The vanilla JS `showSection()` / `showPage()` logic is replaced by Angular `RouterModule` with child routes per feature.
- **Modal state**: `AuthModal` uses an `@Input()` / service signal pattern; task-update modal uses `@Output()` events.
- **FormsModule** imported in `SharedModule` for template-driven forms.
- **No lazy-loading beyond feature modules** for simplicity; each feature module is lazily loaded from `AppRoutingModule`.
- **`landing-page` is the default route** (`/`); admin at `/admin`, client at `/client`, personnel at `/personnel`.

---

## 6. How to Reuse Components

- **Shared utility components** (badges, buttons) → `src/app/shared/`
- **Cross-feature modals** → lift to `SharedModule` and import where needed
- **`landing-navbar` & `landing-footer`** are only used inside `landing-page` template
- **Topbars** (`client-topbar`, `personnel-topbar`) follow the same structure — could be unified in `shared/` if required
- To reuse a component from `FeatureModule` in another module: move it to `SharedModule`, export it, import `SharedModule` in both feature modules.

---

## 7. Splitting Logic

| Pattern | Decision |
|---|---|
| Shared nav/topbar between client & personnel | Kept separate (different user info displayed) |
| Admin sections (8 views) | Each becomes a child-routed component under `/admin` |
| 3-step booking wizard | Single `client-booking` component managing step state internally |
| Auth modal | Separate `auth-modal` component in `landing/`; opened via a service or event |
| Task update modal (personnel) | `personnel-task-modal` with `@Input task` and `@Output statusChange` |
| Cleaning task-assign modal (admin) | Embedded in `admin-cleaning` to keep assignment logic co-located |
| Stats bar & contact | Separate thin components (`landing-stats`, `landing-contact`) for clean page composition |
