import { nanoid } from 'nanoid';

import { getUuid } from '@/shared/lib/hash';

import { saveFiles } from '.';
import {
  AIConfigs,
  AIFile,
  AIGenerateParams,
  AIImage,
  AIMediaType,
  AIProvider,
  AITaskResult,
  AITaskStatus,
} from './types';

/**
 * OpenRouter configs
 * @docs https://openrouter.ai/docs
 */
export interface OpenRouterConfigs extends AIConfigs {
  apiKey: string;
  customStorage?: boolean; // use custom storage to save files
}

/**
 * OpenRouter provider for image generation
 * Supports Crooked operations: decomposition, recolor, replace, remove
 * @docs https://openrouter.ai/docs
 */
export class OpenRouterProvider implements AIProvider {
  // provider name
  readonly name = 'openrouter';
  // provider configs
  configs: OpenRouterConfigs;

  // api base url
  private baseUrl = 'https://openrouter.ai/api/v1';

  // init provider
  constructor(configs: OpenRouterConfigs) {
    this.configs = configs;
  }

  // generate task
  async generate({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const { mediaType, model, prompt, options, callbackUrl } = params;

    if (!mediaType) {
      throw new Error('mediaType is required');
    }

    if (!model) {
      throw new Error('model is required');
    }

    if (!prompt && !options?.image_input) {
      throw new Error('prompt or image_input is required');
    }

    // For Crooked operations, we need to handle the specific operation types
    const scene = options?.scene || 'text-to-image';

    // build request params based on scene type
    const input = await this.formatInput({
      mediaType,
      model,
      prompt,
      options,
      scene,
    });

    let apiUrl = `${this.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
      'HTTP-Referer': 'https://crooked.ai',
      'X-Title': 'Crooked AI Vision Editor',
    };

    console.log('[OpenRouter] Request:', { model, scene, input });

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('[OpenRouter] Error response:', { status: resp.status, body: errorText });
      throw new Error(
        `OpenRouter request failed with status: ${resp.status}, body: ${errorText}`
      );
    }

    const data = await resp.json();

    console.log('[OpenRouter] Response:', data);

    // Check if this is an async operation (returns a task ID)
    if (data.id && !data.choices) {
      return {
        taskStatus: AITaskStatus.PENDING,
        taskId: data.id,
        taskInfo: {},
        taskResult: data,
      };
    }

    // Handle synchronous response
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];

      // For Crooked decomposition, return structured layer data
      if (scene === 'image-decomposition' && choice.message?.content) {
        let layerData: any;
        const content = choice.message.content;

        console.log('[OpenRouter] Decomposition response content:', content);

        try {
          // Try to parse JSON response
          const jsonMatch =
            typeof content === 'string'
              ? content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
              : null;
          const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
          layerData = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : content;
        } catch (e) {
          console.error('[OpenRouter] Failed to parse decomposition JSON:', e);
          console.error('[OpenRouter] Raw content:', content);
          layerData = { layers: [] };
        }

        console.log('[OpenRouter] Parsed layerData:', layerData);

        // Store layer data in taskResult
        return {
          taskStatus: AITaskStatus.SUCCESS,
          taskId: data.id || nanoid(),
          taskInfo: {
            status: 'success',
            createTime: new Date(),
          },
          taskResult: { ...data, layerData },
        };
      }

      // Handle image generation (text-to-image, image-to-image, etc.)
      let imageUrl: string | undefined;
      let imageBase64: string | undefined;

      // Extract image from message content
      if (choice.message?.content) {
        const content = choice.message.content;

        // Check for base64 image data URL
        if (typeof content === 'string' && content.startsWith('data:image')) {
          imageBase64 = content;
        } else if (
          typeof content === 'string' &&
          (content.startsWith('http://') || content.startsWith('https://'))
        ) {
          imageUrl = content;
        } else if (Array.isArray(content)) {
          for (const item of content) {
            if (item.type === 'image_url') {
              imageUrl = item.image_url?.url;
              break;
            }
          }
        }
      }

      // Handle base64 image - upload to storage
      if (imageBase64 && this.configs.customStorage) {
        const { getStorageService } = await import('@/shared/services/storage');
        const storageService = await getStorageService();

        const buffer = Buffer.from(
          imageBase64.split(',')[1] || imageBase64,
          'base64'
        );
        const ext = 'png';
        const key = `openrouter/image/${getUuid()}.${ext}`;

        const uploadResult = await storageService.uploadFile({
          body: buffer,
          key,
          contentType: 'image/png',
        });

        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      // Download and save to custom storage if URL provided
      if (imageUrl && this.configs.customStorage) {
        const filesToSave: AIFile[] = [
          {
            url: imageUrl,
            contentType: 'image/png',
            key: `openrouter/image/${getUuid()}.png`,
            type: 'image',
          },
        ];

        const uploadedFiles = await saveFiles(filesToSave);
        if (uploadedFiles && uploadedFiles.length > 0) {
          imageUrl = uploadedFiles[0].url;
        }
      }

      const image: AIImage | undefined = imageUrl
        ? {
            id: nanoid(),
            createTime: new Date(),
            imageUrl,
          }
        : undefined;

      return {
        taskStatus: AITaskStatus.SUCCESS,
        taskId: data.id || nanoid(),
        taskInfo: {
          images: image ? [image] : undefined,
          status: 'success',
          createTime: new Date(),
        },
        taskResult: data,
      };
    }

    throw new Error('generate failed: no valid response');
  }

  // query task (for async operations)
  async query({
    taskId,
    model,
    mediaType,
  }: {
    taskId: string;
    model?: string;
    mediaType?: AIMediaType;
  }): Promise<AITaskResult> {
    // OpenRouter API doesn't have a dedicated query endpoint
    // For async operations, we would need to implement webhook handling
    // For now, return PENDING status
    return {
      taskId,
      taskStatus: AITaskStatus.PENDING,
      taskInfo: {
        status: 'pending',
        errorMessage: 'Async polling not implemented for OpenRouter',
      },
      taskResult: null,
    };
  }

  // format input for different Crooked operations
  private async formatInput({
    mediaType,
    model,
    prompt,
    options,
    scene,
  }: {
    mediaType: AIMediaType;
    model: string;
    prompt: string;
    options: any;
    scene: string;
  }): Promise<any> {
    const messages: any[] = [];
    const hasImageInput =
      options?.image_input && Array.isArray(options.image_input) && options.image_input.length > 0;

    // Build content array
    const content: any[] = [];

    // Add image if present
    if (hasImageInput) {
      const imageUrl = options.image_input[0];
      content.push({
        type: 'image_url',
        image_url: {
          url: imageUrl,
        },
      });
    }

    // Build prompt based on scene type
    let systemPrompt = '';
    let userPrompt = prompt || '';

    switch (scene) {
      case 'image-decomposition':
        systemPrompt =
          'You are an expert image analyzer. Analyze images and identify distinct visual components (layers) that could be separated for editing. Return ONLY a valid JSON object with a "layers" array containing objects with: name (layer name), description (what it is), and bbox (bounding box as [x, y, width, height] in normalized coordinates 0-1000).';
        if (!userPrompt) {
          userPrompt =
            options?.layer_count && options.layer_count > 0
              ? `Analyze this image and identify the ${options.layer_count} most significant distinct visual components (layers). Return JSON with: layers array containing objects with name, description, and bbox [x,y,width,height] (0-1000 scale).`
              : 'Analyze this image and identify the optimal number of distinct visual components (layers). Return JSON with: layers array containing objects with name, description, and bbox [x,y,width,height] (0-1000 scale).';
        }
        break;

      case 'image-recolor':
        systemPrompt =
          'You are an expert image editor. Change the colors of objects in images based on user instructions while maintaining the original image quality and composition.';
        if (!userPrompt) {
          userPrompt = 'Change the colors as described in the image context.';
        }
        break;

      case 'image-replace':
        systemPrompt =
          'You are an expert image editor. Replace objects in images with new ones based on user descriptions while maintaining the original scene composition and lighting.';
        if (!userPrompt) {
          userPrompt = 'Replace the selected object with a new one.';
        }
        break;

      case 'image-remove':
        systemPrompt =
          'You are an expert image editor. Remove objects from images and fill in the background naturally while maintaining the original image quality.';
        userPrompt = 'Remove the selected object and fill the background naturally.';
        break;

      default:
        systemPrompt =
          'You are an expert image editor. Generate or edit images based on user instructions.';
        break;
    }

    content.push({
      type: 'text',
      text: userPrompt,
    });

    messages.push({
      role: 'system',
      content: systemPrompt,
    });

    messages.push({
      role: 'user',
      content,
    });

    // Build request payload
    const input: any = {
      model,
      messages,
      response_format: scene === 'image-decomposition' ? { type: 'json_object' } : undefined,
      max_tokens: 4096,
    };

    return input;
  }
}
