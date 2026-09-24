# Dummy transcoder Lambda. Same shape as the eventual prod image (Node 20 base, SQS-driven
# entrypoint, S3 read/write, direct Postgres write) — just no real transcoding. Replace
# handler.js's writePlaceholderOutputs() with a real FFmpeg or MediaConvert call when going
# to prod. See apps/documentation/docs/backend/media/dummy-lambda-transcoder.md.
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Production deps only: S3 client + Postgres client. No FFmpeg / big binaries — this Lambda's
# entire job is: read S3 key from event, write a placeholder to output bucket, UPDATE the row.
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY handler.js ./

# Lambda entrypoint: file.exportedFunction — matches CMD used by public.ecr.aws/lambda/nodejs.
CMD ["handler.handler"]
