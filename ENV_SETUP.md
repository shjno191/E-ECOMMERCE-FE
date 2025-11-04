# Environment Configuration

## Môi trường Development

Chạy lệnh:
```bash
npm run dev
```

Sử dụng file: `.env.dev`
- Backend API: `http://localhost:3000/api`

## Môi trường Production

Build production:
```bash
npm run build
```

Sử dụng file: `.env`
- Backend API: URL production của bạn

## Setup

1. Copy file `.env.example` thành `.env.dev` và `.env`
2. Cập nhật các giá trị phù hợp
3. **Không commit** các file `.env` và `.env.dev` vào git

## Scripts

- `npm run dev` - Chạy development server (sử dụng .env.dev)
- `npm run build` - Build production (sử dụng .env)
- `npm run build:dev` - Build development (sử dụng .env.dev)
- `npm run preview` - Preview production build
