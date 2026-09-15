import analysis from '../../../data/examples/2026-09-15-market-analysis.json';

export async function GET() {
  return Response.json(analysis);
}
