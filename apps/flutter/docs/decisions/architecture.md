# Decision record: application architecture

Rationale for the Stack and Invariants in `CLAUDE.md`. No code here; the executable shapes live in `.claude/skills/bootstrap/references/` and `.claude/skills/create-feature/references/` until `lib/features/example` exists, and in that folder afterwards. Grounded in the Flutter team's app-architecture guide (2026), the `get_it` documentation, and the Very Good Ventures architecture; where this record diverges from one of them it says so.

## Stance: two layers, an optional third

The UI layer is a view plus a view model; the data layer is a repository plus a service. A domain layer of use-cases is added only when logic merges several repositories, is genuinely complex, or is reused across view models. The Flutter guide marks use-cases conditional, and VGV ships without a use-case layer. Textbook clean architecture was rejected because mandatory use-cases, entities and mappers make cross-feature sharing expensive, which is the pain this template exists to remove.

Two disciplines stay strict and carry most of the value:

1. Dependencies point downward only: view → view model → (use-case) → repository → service. Never upward, never sideways between features at the UI level.
2. Repositories never know each other. Data from two repositories is combined in the view model or a use-case. This is the official rule and the one that keeps "flexible" from decaying into "spaghetti".

## Stack binding

In this stack the Cubit or Bloc is the view model.

**Cubit by default, Bloc for event-driven features.** Cubit is method → `emit`; about 80 percent of features need nothing more. Bloc pays for itself only when events are first-class: debounced search with an `EventTransformer`, strict sequential processing, an audit trail, or pagination with `droppable`. The rigid, greppable shape is also what makes generated code consistent and lets `bloc_test` assert state sequences.

**Freezed for data classes and states.** One mechanism for immutability, value equality, `copyWith` and exhaustive `switch`. States need value equality because the Cubit drops an equal state before `BlocBuilder` sees it and `bloc_test` compares with `==`. Alternatives considered: `Equatable` everywhere (rejected, hand-written `fromJson` and `copyWith` are the most error-prone part of the data layer); a Freezed-models plus Equatable-states split (rejected, two equality mechanisms for no benefit). The one exception is `AppStartupState`, hand-written because two of its variants carry no fields and boot should not depend on `build_runner` output.

**One state union per cubit: `initial / loading / success(data) / failure(AppException)`.** Four variants because each maps to a distinct render: nothing yet, a progress indicator, content, or an `ErrorView` with retry. `initial` stays separate from `loading` so a screen that has not asked for data does not show a spinner, and so a cubit test can assert the transition out of it. One shape everywhere is what lets a generator emit the switch and the tests without judgement calls.

**Cubit methods return `Future<void>` and callers use `unawaited`.** Returning the future keeps `bloc_test` able to await the whole method; `unawaited` at the call site satisfies `discarded_futures` without the `// ignore:` the earlier templates carried. The alternative, `void` methods wrapping a private async body, doubles every method for no benefit.

**`get_it`, manual, one composition root.** Repositories, services and clients live in `get_it`; Cubits never do, because `BlocProvider` owns the lifecycle and calls `close()`. A Cubit in a `get_it` factory never disposes, and one registered as a singleton leaks state across screens. `injectable` stays out: manual registration is one appendable line per feature, and annotation-scattered wiring is harder for a skill to edit deterministically. Pure `RepositoryProvider` DI (VGV style) was rejected because context-bound repositories make composite and swap-at-root patterns awkward.

**Typed exceptions, not a `Result` type.** Repositories throw a sealed `AppException`; the cubit catches `on AppException` and emits a failure state. This is idiomatic Bloc and the team's convention; a `Result` or `Either` would be a foreign body in a try/catch codebase. The sealed hierarchy plus a mandatory typed catch recovers most of what `Result` enforces at compile time. Programming errors are never caught into states; they reach the global net so they are loud in development and reported in production.

**`bloc_test` and `mocktail`.** Mock the repository at the boundary, assert the state sequence. The failure-path test is mandatory because it is the test humans forget and the one that turns a swallowed exception into a visible bug.

## Folder structure

Feature-first, because layer-first collapses at around five features. `core/` holds framework-level code with no business knowledge (theme, responsive, router, network plumbing, error types) — and, in `core/widgets/`, every widget more than one feature draws, because a widget carries no business knowledge whatever domain it is named after. `shared/` holds business logic that two or more features need (a session repository, feature flags). Something moves from a feature to `shared/` the moment a second feature needs it, not before; premature sharing costs as much as duplication. The fastest sharing check: deleting any one `features/x/` folder must never break another feature's compile.

## Concrete unless a second implementation exists

Register the concrete class. An abstract interface appears only when more than one implementation exists now (prod and fake, or several providers). Over-abstraction hurts navigation and adds ceremony; extracting an interface later takes two minutes. `mocktail` mocks concrete classes, so tests do not need interfaces either. The official guide prefers always-abstract repositories; this record deliberately diverges.

`package:` imports everywhere under `lib/` because a class reached through two different import forms has, in some Dart versions and still for `test/` importing `lib/` relatively, been treated as two types, which makes a `get_it` lookup fail silently.

## Service patterns beyond the default

Most services are a single concrete class. The other shapes are standard and are reached for only when the request names the situation:

- **Contract with one bound implementation** when several implementations exist and exactly one is chosen at the composition root by flavor, platform or flag. The swap point is one line; it is also a test seam.
- **Composite** when every implementation runs (multi-sink logging, write-through caches); consumers stay unaware. `get_it`'s multiple-registration `getAll` is for open plugin sets where order does not matter.
- **Registry or strategy** when one of several is chosen per call by data (payment providers). A registry centralises availability and fallback logic and pairs an enum discriminator with exhaustive switching.
- **Facade or use-case** when the UI needs one entry point over several repositories. Reach for a use-case first; promote to a named facade only if it is reused widely.

A stateful disposable native resource (player, camera, socket) is a concrete service that owns creation and disposal, is bounded, and is disposed by its owning Bloc or screen. It is a per-project concern and is not part of the template.

## Models: DTO and domain

The OpenAPI spec is the DTO. A separate domain model is introduced only when the API shape genuinely diverges from what a screen needs, the same "earned" discipline as use-cases. DTO-to-domain mappers for identical shapes are the lasagna this architecture avoids.

## Error handling

One mapping from `DioException` to `AppException`, by status code, in `core/network`. Repositories wrap each call in `guardApi()` and contain no try/catch of their own. This replaced the earlier per-repository mapping, which duplicated the same three lines and the same test in every feature and flattened status codes into a message string. The UI turns an `AppException` into a sentence through one localisation extension, so screens never compose error text.

## Testing: what to test where

- Cubit: the state sequence for each method's success and failure path. Highest value; always emitted.
- Error mapper: the status-code table, once, in `core/network`.
- Widgets: only non-trivial rendering, with a mocked cubit. No golden per screen.
- Goldens: reusable design-system components only.
- Integration: a handful of end-to-end flows once the app has them; not part of the template.

## Cross-feature sharing

Share through the data and domain layers, never the UI layer. Session-wide state lives in a repository observed as a stream by many cubits; it is never duplicated per feature. Combining data from two features is a use-case in the consuming feature or in `shared/`. Many-to-many is expected: a cubit may use several repositories and a repository may serve many cubits.
