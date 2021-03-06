import * as Prismic from '@prismicio/client'
import { HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';

;
export function getPrismicClient(req?: unknown) {
  const prismic = Prismic.createClient(process.env.PRISMIC_ENTRY_POINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}