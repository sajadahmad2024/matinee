# Phase policy

Initialization is three phases with three code shapes, because each has a different relationship to the UI. Pre-init has no widget tree and builds the injector, so it is a function. Post-init must never gate the UI, so it is fire-and-forget. Only main-init drives a screen, so only main-init is a Cubit.

## The criticality question

Sort services by criticality, not by clock position. One question assigns the phase, the registration method and the failure policy at once:

> If this service is broken or slow, what should the user see?

| Answer | Phase | Registration | Failure surfaces as |
|---|---|---|---|
| Nothing can render without it | Pre-init | Synchronous, inside `bootstrap()` | `BootstrapErrorApp` |
| A retryable splash | Main-init | `registerSingletonAsync` (+ `dependsOn`) | `StartupFailure` state with retry |
| Nothing; degrade silently | Post-init | `registerLazySingleton`, called from `runPostInit()` | Logged through `report()`, invisible |

When in doubt, post-init. Never block the user for a non-critical service.

## Registration method is phase assignment

`getIt.allReady()` awaits every `registerSingletonAsync` registration. Async-registering a non-critical service silently makes it a startup blocker. Register async only when the first screen genuinely cannot render without it. Non-critical async work gets no async registration at all; it is a guarded line inside `runPostInit()`.

`registerLazySingleton` is the default for repositories and services: created on first use, never a startup gate. `registerSingleton` is for cheap always-needed values such as `Env`. `registerFactory` is for stateful short-lived helpers, never Cubits.

## Error policy per phase

| Phase | Caught where | Recovery |
|---|---|---|
| Pre-init | `on Object catch` in `bootstrap()` | `runApp(BootstrapErrorApp())` |
| Main-init | `on Object catch` in `AppStartupCubit.start()` | Retry button calls `retry()`, which re-registers main-init in a fresh scope and runs `start()` again |
| Post-init | `guardPostInit` around each task | None; `report()` and carry on |

Cross-cutting rules:

- Uncaught errors anywhere are captured by Sentry's integrations when a DSN is set, and printed by Flutter's defaults otherwise. The template installs no handler of its own.
- Every awaited init in main-init has a timeout so a hung network call becomes `StartupFailure`, not an infinite splash.
- The two startup catches are the only places an `on Object catch` is acceptable, because the user-visible failure screen is the policy. Feature code catches `on AppException` only, so programming errors stay loud.

## Call order

```
main_<flavor>()
  bootstrap(Env)                              pre-init
    ensureInitialized, Bloc.observer
    registerDependencies(env)   on throw →    runApp(BootstrapErrorApp)
    SentryFlutter.init(appRunner: runApp(App)) or runApp(App)
      App: BlocProvider(create: AppStartupCubit + unawaited(start)), BlocProvider(ThemeCubit)
        router redirect → /splash until StartupSuccess
        start(): fresh 'startup' scope, registerStartupDependencies, allReady(timeout)   main-init
          success → redirect returns to the requested location
                    BlocListener fires runPostInit()   post-init
          failure → SplashScreen shows ErrorView → retry()
```
