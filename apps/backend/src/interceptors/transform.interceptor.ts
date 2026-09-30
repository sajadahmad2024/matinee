import { ApiResponse } from '@common/dto/api-response';
import { RouteNames } from '@common/route-names';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    // Check if the request is an HTTP request
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();

      // Exclude specific routes
      // Match the first path segment only — a query like `?metrics=views` must still be wrapped.
      const firstSegment = String(request.url ?? '').split('?')[0]!.split('/').filter(Boolean)[0] ?? '';
      if (firstSegment.startsWith(RouteNames.METRICS) || firstSegment.startsWith(RouteNames.HEALTH)) {
        return next.handle();
      }

      return next.handle().pipe(
        map(data => {
          // Streams/files (e.g. the local CDN route) are raw bodies — never wrap them in the JSON
          // envelope (serializing a stream throws "Converting circular structure to JSON").
          if (data instanceof StreamableFile) {
            return data as unknown as ApiResponse<T>;
          }
          const response = context.switchToHttp().getResponse();
          return {
            statusCode: data?.statusCode || response?.statusCode || 200,
            status: data?.status || 'Success',
            message: data?.message || 'Request successful',
            data: data?.data || data,
            error: data?.error || null,
          };
        })
      );
    }

    if (context.getType().toString() === 'graphql') {
      return next.handle().pipe(
        map(data => ({
          statusCode: 200,
          status: 'Success',
          message: 'Request successful',
          data: data,
          error: '',
        }))
      );
    }

    return next.handle(); // For other contexts, pass through without modification
  }
}
