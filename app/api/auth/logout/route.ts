import { noContent } from '@/lib/utils/apiResponse';

export async function POST() {
  // Stateless JWT: client clears token; server has nothing to invalidate here.
  return noContent();
}
