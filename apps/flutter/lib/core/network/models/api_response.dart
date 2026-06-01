/// Generic API response wrapper for state management
///
/// Usage Example:
/// ```dart
/// // In your Bloc/Provider state
/// class UserState {
///   final ApiResponse<User> userResponse;
///
///   UserState({
///     this.userResponse = const ApiResponse.loading(),
///   });
/// }
///
/// // In your repository
/// Future<ApiResponse<User>> getUser(String id) async {
///   try {
///     final response = await apiClient.get('/users/$id');
///     final user = User.fromJson(response.data);
///     return ApiResponse.success(user);
///   } catch (e) {
///     return ApiResponse.error(e.toString());
///   }
/// }
///
/// // In your Bloc
/// emit(state.copyWith(userResponse: ApiResponse.loading()));
/// final result = await repository.getUser(userId);
/// emit(state.copyWith(userResponse: result));
///
/// // In your UI
/// if (state.userResponse.isLoading) {
///   return CircularProgressIndicator();
/// }
///
/// if (state.userResponse.isError) {
///   return Text('Error: ${state.userResponse.message}');
/// }
///
/// if (state.userResponse.isSuccess) {
///   final user = state.userResponse.data!;
///   return Text('Hello ${user.name}');
/// }
/// ```
class ApiResponse<T> {
  final ApiResponseStatus status;
  final T? data;
  final String? message;

  const ApiResponse._({required this.status, this.data, this.message});

  /// Loading state - Request is in progress
  ///
  /// Use this when starting an API call
  const factory ApiResponse.loading({String? message}) = _LoadingApiResponse<T>;

  /// Success state - Request completed successfully with data
  ///
  /// Use this when API call succeeds and returns data
  const factory ApiResponse.success(T data, {String? message}) =
      _SuccessApiResponse<T>;

  /// Error state - Request failed
  ///
  /// Use this when API call fails or throws an exception
  const factory ApiResponse.error(String message) = _ErrorApiResponse<T>;

  /// Empty state - Request succeeded but returned no data
  ///
  /// Use this when API call succeeds but the list/data is empty
  const factory ApiResponse.empty({String? message}) = _EmptyApiResponse<T>;

  /// Check if currently in loading state
  bool get isLoading => status == ApiResponseStatus.loading;

  /// Check if request was successful
  bool get isSuccess => status == ApiResponseStatus.success;

  /// Check if request failed
  bool get isError => status == ApiResponseStatus.error;

  /// Check if request succeeded but returned no data
  bool get isEmpty => status == ApiResponseStatus.empty;

  @override
  String toString() {
    return 'ApiResponse{status: $status, data: $data, message: $message}';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is ApiResponse<T> &&
        other.status == status &&
        other.data == data &&
        other.message == message;
  }

  @override
  int get hashCode => status.hashCode ^ data.hashCode ^ message.hashCode;
}

/// Loading state implementation
class _LoadingApiResponse<T> extends ApiResponse<T> {
  const _LoadingApiResponse({String? message})
    : super._(
        status: ApiResponseStatus.loading,
        message: message ?? 'Loading...',
      );
}

/// Success state implementation
class _SuccessApiResponse<T> extends ApiResponse<T> {
  const _SuccessApiResponse(T data, {String? message})
    : super._(status: ApiResponseStatus.success, data: data, message: message);
}

/// Error state implementation
class _ErrorApiResponse<T> extends ApiResponse<T> {
  const _ErrorApiResponse(String message)
    : super._(status: ApiResponseStatus.error, message: message);
}

/// Empty state implementation
class _EmptyApiResponse<T> extends ApiResponse<T> {
  const _EmptyApiResponse({String? message})
    : super._(
        status: ApiResponseStatus.empty,
        message: message ?? 'No data available',
      );
}

/// API Response status enum
///
/// Represents the current state of an API request
enum ApiResponseStatus {
  /// Request is in progress
  loading,

  /// Request completed successfully
  success,

  /// Request failed with error
  error,

  /// Request succeeded but returned no data
  empty,
}
