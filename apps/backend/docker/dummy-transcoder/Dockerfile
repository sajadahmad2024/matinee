# Transcoder Lambda image. Runs the DUMMY handler (placeholder HLS) by default; the same image
# carries the MediaConvert templates (prod-handler.js / prod-completion-handler.js) — switching
# is a CMD change. See apps/documentation/docs/backend/media/dummy-lambda-transcoder.md.
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Reproducible installs: npm ci against the committed lockfile, production deps only.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY lib.js handler.js prod-handler.js prod-completion-handler.js ./

CMD ["handler.handler"]
