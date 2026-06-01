library;

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../domain/entities/home_item.dart';
import '../../domain/repositories/home_repository.dart';
import '../datasources/home_remote_datasource.dart';
import '../models/home_item_model.dart';

/// Implementation of [HomeRepository].
///
/// Bridges the home domain layer with remote data sources and
/// converts low-level exceptions into domain [Failure]s.
class HomeRepositoryImpl implements HomeRepository {
  final HomeRemoteDataSource _remoteDataSource;

  HomeRepositoryImpl(this._remoteDataSource);

  Failure _mapExceptionToFailure(AppException exception) {
    return UnknownFailure(exception.message);
  }

  @override
  Future<List<HomeItem>> loadHomeItems() async {
    try {
      final List<HomeItemModel> models = await _remoteDataSource
          .loadHomeItems();
      return models.map((HomeItemModel m) => m.toEntity()).toList();
    } on AppException catch (e) {
      throw _mapExceptionToFailure(e);
    } catch (e) {
      throw UnknownFailure('Unexpected error: ${e.toString()}');
    }
  }
}
