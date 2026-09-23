/// Connectivity source used by the shared player window.
abstract class HlsConnectivity {
  /// Whether an origin probe should run during initial synchronization.
  Future<bool> get isConnected;

  /// Emits connectivity changes.
  Stream<bool> get onConnectivityChanged;
}
