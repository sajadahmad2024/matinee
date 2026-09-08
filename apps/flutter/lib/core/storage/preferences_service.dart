import 'package:shared_preferences/shared_preferences.dart';

///
/// Non-sensitive preferences: theme, locale, onboarding flags. Tokens and
/// personal data never go here; use SecureStorageService.
///
class PreferencesService {
  PreferencesService([SharedPreferencesAsync? prefs]) : _prefs = prefs ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _prefs;

  Future<String?> getString(String key) => _prefs.getString(key);

  Future<void> setString(String key, String value) => _prefs.setString(key, value);

  Future<bool?> getBool(String key) => _prefs.getBool(key);

  Future<void> setBool(String key, {required bool value}) => _prefs.setBool(key, value);

  Future<void> remove(String key) => _prefs.remove(key);
}
