# Decision record: app initialization

Rationale for the three-phase startup invariant. The code shapes live in `.claude/skills/bootstrap/references/startup.md`, `router.md` and `phase-policy.md`.

## Three phases, three shapes

Initialization is not one class. Pre-init has no widget tree and is the thing that builds the injector, so it cannot be injected or be a Bloc; it is a function. Post-init must never gate the UI, so it cannot be a blocking state; it is fire-and-forget. Only main-init drives a screen, so only main-init is a Cubit. Forcing all three into a single `StartupBloc` was the central mistake this design avoids.

| Phase | Shape | Relationship to UI |
|---|---|---|
| Pre-init | `bootstrap(Env)` function | none exists yet |
| Main-init | `AppStartupCubit` | drives the splash: progress, error with retry, done |
| Post-init | `runPostInit()` function | none; must never block |

## The criticality question

Services are sorted by criticality, not by clock position: "if this service is broken or slow, what should the user see?" Crash before any UI can exist means pre-init. A retryable splash means main-init. Nothing, degrade silently, means post-init. The question assigns the phase, the `get_it` registration method and the failure policy at once. When in doubt, post-init; never block the user for a non-critical service.

## Registration method is phase assignment

`registerSingletonAsync` makes a service part of `allReady()`, which the splash awaits, so async-registering a non-critical service silently makes it a startup blocker. Only services the first screen cannot render without are registered async. Everything else is `registerLazySingleton`, and non-critical async work is a guarded line in post-init with no async registration at all.

## Pre-init is minimal and wrapped

Every millisecond before `runApp` delays first paint. Pre-init does the binding, the bloc observer and synchronous DI registration, then hands off. Registration only registers; even `registerSingletonAsync` returns immediately. If `bootstrap()` awaits real work, that work is main-init in disguise. An uncaught throw here is a white screen, so registration is wrapped and falls back to a minimal error app with no DI, router, theme or localisation.

## Main-init is a thin orchestrator

`AppStartupCubit.start()` awaits `allReady()` with a timeout and maps the outcome to a state. It contains no init logic itself; a startup cubit that opens a database is the smell, because that logic belongs in the database service where it is testable. `retry()` re-runs `start()`, and `start()` registers the main-init services in a fresh get_it scope on every attempt, because get_it caches `allReady()` and never re-runs a factory that threw; without the scope the retry button would be a lie. The timeout turns a hung network call into a failure state instead of an infinite splash.

Startup is one of two places an `on Object catch` is acceptable, because the user-visible failure screen is the policy. Feature code catches `on AppException` only.

## Gating through the router, not a listener

An earlier design put a `/splash` route with a `BlocConsumer` whose listener navigated to home by name on success. It contradicted the navigation rules (string route names) and lost cold-start deep links, because success always went to home. The current design is a top-level go_router `redirect` driven by a `refreshListenable` over the cubit's stream: every route redirects to `/splash` while startup is incomplete, carrying the requested location as a query parameter, and `/splash` redirects back to that location once startup succeeds. The same redirect is where a project's auth guard plugs in. go_router removed its own stream-to-listenable adapter in 2022, so the adapter is the app's own.

## Post-init is a function

Post-init runs once startup succeeds; its tasks are never awaited and each is guarded, so a failure is reported and ignored. It was a class registered in `get_it` in an earlier design; it has no state, so it is now a top-level function.

## The global net belongs to Sentry

`SentryFlutter.init` installs `FlutterError.onError` and `PlatformDispatcher.onError` itself on Flutter 3.3 and later, so the template installs neither by hand. On web Sentry still wraps the app runner in a zone because `PlatformDispatcher.onError` is unsupported there; web is secondary and the DSN is production-only, so the zone-mismatch warning that produces is accepted and noted rather than worked around. In the app's own code `runZonedGuarded` is gone: the current Flutter error-handling guidance no longer recommends it, and the earlier template's placement of `ensureInitialized` outside the zone and `runApp` inside it produced the zone-mismatch warning and let errors slip past. Without a DSN (dev builds) Flutter's defaults print uncaught errors to the console. `report()` exists for errors the app catches on purpose: the post-init guard, the startup failure, and the bloc observer.

## Native splash

`flutter_native_splash` is not part of the template. The splash route renders immediately, and holding the native splash is a per-project choice.
