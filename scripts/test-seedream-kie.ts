/**
 * Live test for kie.ai seedream/5-pro-layer-decomposition.
 * Usage: KIE_API_KEY=xxx npx tsx scripts/test-seedream-kie.ts
 * Submits a real decomposition task, polls to completion, prints result URLs.
 */
import { KieProvider, AITaskStatus } from '../src/extensions/ai';

async function main() {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    console.error('Set KIE_API_KEY first (get it at https://kie.ai — API Keys)');
    process.exit(1);
  }

  const provider = new KieProvider({ apiKey });
  const testImage =
    'https://static.aiquickdraw.com/tools/example/1786019968051_cKRYLHHu.png';

  console.log('[test] submitting layer decomposition task...');
  const created = await provider.generateImage({
    params: {
      mediaType: 'image' as never,
      model: 'seedream/5-pro-layer-decomposition',
      prompt: 'Separate the main elements into independent layers',
      options: { image_urls: [testImage] },
    },
  });
  console.log('[test] taskId:', created.taskId, 'status:', created.taskStatus);

  const started = Date.now();
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const result = await provider.queryImage({ taskId: created.taskId });
    const elapsed = Math.round((Date.now() - started) / 1000);
    console.log(`[test] poll #${i + 1} (${elapsed}s): ${result.taskStatus}`);
    if (result.taskStatus === AITaskStatus.SUCCESS) {
      const images = (result.taskInfo as { images?: { imageUrl: string }[] }).images || [];
      console.log(`[test] SUCCESS with ${images.length} images:`);
      images.forEach((img, idx) => console.log(`  [${idx}] ${img.imageUrl}`));
      console.log('[test] NOTE: index 0 should be the base composite, rest are layers');
      return;
    }
    if (result.taskStatus === AITaskStatus.FAILED) {
      console.error('[test] FAILED:', JSON.stringify(result.taskInfo, null, 2));
      process.exit(1);
    }
  }
  console.error('[test] timed out after 5 minutes');
  process.exit(1);
}

main();
