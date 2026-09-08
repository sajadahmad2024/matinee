# Run-and-compare loop

Looking at the running app next to the design is the step that turns a plausible screen into a matching one. The Dart MCP server (`.mcp.json`, `dart mcp-server`) launches and reloads the app; screenshots come from the platform tool available in the session.

## Launch

1. `list_devices` from the Dart MCP server; pick an iPhone simulator for the compact layout and macOS for the expanded one.
2. `launch_app` with the package root, target `lib/main_dev.dart` and the chosen device. The server connects to the app's tooling daemon itself. When launching from a shell instead, pass `--print-dtd` to `flutter run` so the server can attach.
3. Navigate to the screen. The typed route's path is the argument; in dev a quick way is a temporary `initialLocation` override in `createRouter`, removed before commit.

## Compare

1. Screenshot the device. On the iOS simulator, use the simulator control tool's screenshot; on macOS or when no simulator tool exists, `widget_inspector` gives the tree and `get_app_logs` the logs, and the screenshot comes from the OS.
2. Put the app screenshot and `get_screenshot` from Figma side by side. List differences in this order: structure (missing or extra elements), spacing and alignment, typography (role, weight, line height), colour (role), state (loading, empty, error).
3. Fix in the widget tree. Reference theme roles; never patch a colour or size inline to make one screenshot match.
4. `hot_reload`, screenshot again, repeat.

Stop when the remaining differences are sub-pixel or come from the platform (font rendering, status bar). Record them in the report.

## Checks before finishing

- `get_runtime_errors` returns nothing after visiting the screen and interacting with it.
- Text scale 1.3 (device accessibility setting, or `MediaQuery` override in a test) does not clip or overflow.
- The expanded layout on macOS has no stretched content: `ContentContainer` or an explicit two-pane branch.
- Dark mode (`ThemeCubit.setThemeMode(ThemeMode.dark)` from a dev toggle, or the OS setting) reads correctly; no hard-coded light colours.
- `stop_app` when done.
