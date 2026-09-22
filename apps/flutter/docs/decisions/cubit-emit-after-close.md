# Decision record: emits after a cubit closes are dropped

Rationale for the `SafeCubit` line in `.claude/rules/dart-style.md`. No code here.

## The asymmetry

`BlocBase.emit` throws a `StateError` when the object is already closed. `Bloc.on`'s emitter does not: it checks `isClosed` and returns. The same mistake is therefore fatal in a cubit and silent in a bloc, for no reason a caller can see.

Our cubit methods make this easy to hit. They await a repository, callers invoke them through `unawaited`, and `BlocProvider` closes the cubit when the screen is popped. A user leaving a screen inside the request window — 600 ms against the mocks, longer on a slow network — resumes the await against a closed cubit. Because nothing is awaiting the future, the throw does not surface where the call was made; it lands in the global error sink as noise that names no user-visible fault.

## Stance

Cubits extend `SafeCubit`, which drops the emit instead of throwing. Bloc's own event path already behaves this way, so matching it removes an inconsistency rather than inventing a policy. A closed cubit has no listener and no widget left to tell, so the state it would have emitted has nowhere to go: dropping it loses nothing.

Alternatives considered. An `if (isClosed)` guard at every emit site was rejected: roughly forty sites, each of which a future edit can forget, to express one invariant. Cancelling the in-flight request instead is the better answer where a `CancelToken` exists, but it does not remove the race — a response already in the microtask queue still resumes after `close()` — so it is a complement, not a replacement.

## What this deliberately hides

Dropping the emit hides a class of leak the throw used to expose. A cubit that keeps a `StreamSubscription`, a `Timer` or a Dio `CancelToken` past `close()` goes on doing work; before, its next emit was loud, and now it is quiet. `SafeCubit` treats only the unawaited-await case, which is a normal consequence of how screens are navigated, and it cannot tell that case apart from a genuine leak.

Two things compensate. The rule file makes cancelling owned resources in `close()` an explicit reviewable requirement rather than something the runtime happened to catch. And the dropped emit writes a debug-only breadcrumb naming the cubit, so a cubit that emits repeatedly after close is visible while developing without adding anything to a release build or to the error sink.
