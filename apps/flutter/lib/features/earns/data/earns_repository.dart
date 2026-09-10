import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/features/earns/data/services/earns_api_service.dart';

class EarnsRepository {
  const EarnsRepository(this._service);

  final EarnsApiService _service;

  Future<EarnsOverview> fetchOverview() => guardApi(_service.fetchOverview);
}
