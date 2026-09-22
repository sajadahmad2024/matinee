# Dart style

Applies to every `.dart` file, source and test alike. The analyzer enforces most of it; hooks run `dart format` and `dart analyze` on every edit and feed findings back. Warnings are failures. Never suppress with `// ignore:`; fix the code.

## Comments

- Two delimiters only: `//` for inline comments, `///` for doc comments. No `/* */`, no `/** */`, no banner separators such as `// --- section ---` or `// ====`.
- **Two lines is the cap, one is the target.** One paragraph runs to at most two lines; a doc comment is one or more such paragraphs separated by a blank `///`. A block of three or more consecutive lines is a review finding. Fenced code samples in a doc comment are exempt.
- One comment per thing it explains: a paragraph covering three constructor arguments is three comments, each on the line above its own argument. Sitting there it need not name its subject, which is most of what keeps it to a line or two.
- Doc comments on public API (top-level functions, classes, public methods) use the Flutter style: a blank `///` line above and below the body. A one-line body takes a plain `///` instead, because the banner turns one line into three.
- Names carry the *what*; comments carry the non-obvious *why*. If the name says it all, write no comment, and never restate the line below — `// The alert role interrupts` over `role: SemanticsRole.alert` earns nothing.
- Comments describe the code as it stands: not the implementation it replaced, not the measurement behind a value already visible beside them, not a bug that is fixed. Keep the reason the code is the way it is; drop the story of how it got there.
- Inline comments go on their own line directly above the code they explain. Never suffix a comment to a line of code.
- Never cite doc sections, ticket numbers, or decision IDs in comments or test names. Explain what the code does and why in plain prose.
- Several short comments next to the code beat one header comment for a file. A class-level `///` states purpose and contract, not a method-by-method walkthrough.

```dart
///
/// Brief description of what this does and any non-obvious constraint.
///
Future<void> load() async {
  emit(const ProfileLoading());
  try {
    final data = await _repo.fetch();
    emit(ProfileSuccess(data));
  } on AppException catch (e) {
    // Only domain errors land here; programming errors propagate to the global net.
    emit(ProfileFailure(e));
  }
}
```

One paragraph explaining several arguments is the usual way a comment grows past two lines. Split it and each half fits:

```dart
// Wrong: one block above the call, naming each argument in turn.
// The tab-bar role, so a screen reader says which of how many rather than
// reading four unrelated buttons. `explicitChildNodes`, because the role
// requires every child of this node to be a tab, and without it the items'
// nodes can be folded into this one.
return Semantics(
  role: SemanticsRole.tabBar,
  explicitChildNodes: true,

// Right: one comment per argument, on the line above it.
return Semantics(
  // So a screen reader says which tab of how many, not four loose buttons.
  role: SemanticsRole.tabBar,
  // The role requires every child to be a tab; without this the items'
  // nodes can be folded into this one.
  explicitChildNodes: true,
```

## Rules that shape how code is written

`analysis_options.yaml` enables `strict-casts`, `strict-inference`, `strict-raw-types` and a large lint set. These change code the most:

- `always_use_package_imports`: `package:` imports everywhere under `lib/`. Mixing with relative imports breaks `get_it` type identity. Test files import `test/helpers` relatively.
- `avoid_catches_without_on_clauses`: every `catch` has an `on` type. Feature code catches `on AppException` only. `on Object catch` is allowed in exactly two places: `bootstrap()` and `AppStartupCubit.start()`, because a user-facing failure screen is the policy there.
- `discarded_futures` and `unawaited_futures`: every `Future` is awaited or wrapped in `unawaited()`. Cubit methods return `Future<void>`; widgets call them as `unawaited(context.read<X>().load())` or pass the tear-off to `onPressed`. `BlocProvider.create` uses a closure that creates the cubit, calls `unawaited(cubit.load())`, and returns it. A cascade `..load()` is a lint failure.
- `avoid_void_async`: never `void f() async`. Return `Future<void>`.
- `curly_braces_in_flow_control_structures`: braces on every `if`, `for`, `while` body, even one-liners. Prefer a `switch` expression over an `if` chain when mapping values.
- `avoid_positional_boolean_parameters`: booleans are named parameters, `required` when there is no sensible default.
- `require_trailing_commas` with `page_width: 120`: trailing commas on multi-line argument lists; the formatter preserves them.
- `omit_local_variable_types` and `specify_nonobvious_property_types`: infer locals; annotate fields and top-level variables whose type is not obvious from the initializer (a static getter, a method call).
- `sort_constructors_first`, `always_put_required_named_parameters_first`, `directives_ordering`, `sort_pub_dependencies`: order matters and the analyzer checks it.
- `no_leading_underscores_for_local_identifiers`: locals and test constants have no underscore prefix. Private top-level and static members do.
- `unreachable_from_main` applies only to libraries with a `main()`; `unused_element` catches dead private members everywhere. Remove dead code rather than leaving it.
- `public_member_api_docs` is off. Document public API only where the name does not carry the meaning.

## Shapes the analyzer cannot check

- Repositories throw only `AppException`, through `guardApi()`. Nothing outside `core/network` catches `DioException`.
- Cubits and Blocs are created by `BlocProvider`, never registered in `get_it`.
- Cubits extend `SafeCubit`, never `Cubit` directly.
- `close()` must cancel every `StreamSubscription`, `Timer` and Dio `CancelToken` the cubit owns; `SafeCubit` covers the unawaited-await case only.
- Concrete classes by default. An abstract interface appears only when a second implementation exists now. Classes that tests mock (repositories, services, clients, cubits) are plain `class`, not `final class`, because `implements` across libraries is illegal on a `final` class.
- Freezed for every data class and every state that carries data. `AppStartupState` is the one hand-written sealed class.
- Programming errors (null dereference, bad cast, `StateError`) are never caught into a state. They reach Sentry.
