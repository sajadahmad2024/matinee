# Dart style

Applies to every `.dart` file, source and test alike. The analyzer enforces most of it; hooks run `dart format` and `dart analyze` on every edit and feed findings back. Warnings are failures. Never suppress with `// ignore:`; fix the code.

## Comments

- Two delimiters only: `//` for inline comments, `///` for doc comments. No `/* */`, no `/** */`, no banner separators such as `// --- section ---` or `// ====`.
- Doc comments on public API (top-level functions, classes, public methods) use the Flutter style: a blank `///` line above and below a body of a few lines. Names carry the *what*; comments carry the non-obvious *why*. If the name says it all, write no comment.
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
- Concrete classes by default. An abstract interface appears only when a second implementation exists now. Classes that tests mock (repositories, services, clients, cubits) are plain `class`, not `final class`, because `implements` across libraries is illegal on a `final` class.
- Freezed for every data class and every state that carries data. `AppStartupState` is the one hand-written sealed class.
- Programming errors (null dereference, bad cast, `StateError`) are never caught into a state. They reach Sentry.
