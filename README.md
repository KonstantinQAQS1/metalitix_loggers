# metalitix-js-logger
Metalitix® data logging scripts for Javascript-based 3D engines. Unlock spatial analytics for your 3D scene.

## Development Environment

Copy `.env.sample` to `.env` and configure the `STREAM_SECRET_KEY` and `STREAM_ENCRYPTION_ALGORITHM`.
These credentials are required to initialize the Kinesis data stream.

## Build MetalitixLogger

```bash
npm install

npm run build         # for production
npm run build:staging # for staging
npm run build:dev     # for development
```
