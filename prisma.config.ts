import { defineConfig } from 'prisma/config'

const directUrl = 'postgresql://postgres.oxhqzkpopnzojvefymiv:8%3AuQB-4ebsHyUbi@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: directUrl,
  },
})
