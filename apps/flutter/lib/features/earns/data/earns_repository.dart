import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/earns/data/models/earn_detail.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/features/earns/data/services/earns_api_service.dart';

class EarnsRepository {
  const EarnsRepository(this._service);

  final EarnsApiService _service;

  Future<EarnsOverview> fetchOverview() => guardApi(_service.fetchOverview);

  Future<EarnDetail> fetchDetail(EarnSourceKind kind) => guardApi(() => _service.fetchDetail(kind));
}
