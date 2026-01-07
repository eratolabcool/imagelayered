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
  AIVideo,
} from './types';

/**
 * Fal configs
 * @docs https://fal.ai/
 */
export interface FalConfigs extends AIConfigs {
  apiKey: string;
  customStorage?: boolean; // use custom storage to save files
}

/**
 * Fal provider
 * @docs https://fal.ai/
 */
export class FalProvider implements AIProvider {
  // provider name
  readonly name = 'fal';
  // provider configs
  configs: FalConfigs;

  // api base url
  private baseUrl = 'https://queue.fal.run';

  // init provider
  constructor(configs: FalConfigs) {
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

    // For qwen-image-layered and qwen-image-layered/lora, prompt is optional
    // For other models, prompt is required
    if (!prompt && model !== 'fal-ai/qwen-image-layered' && model !== 'fal-ai/qwen-image-layered/lora') {
      throw new Error('prompt is required');
    }

    // build request params
    const input = this.formatInput({
      mediaType,
      model,
      prompt: prompt || '', // Use empty string if no prompt provided
      options,
    });

    let apiUrl = `${this.baseUrl}/${model}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Key ${this.configs.apiKey}`,
    };

    const isValidCallbackUrl =
      callbackUrl &&
      callbackUrl.startsWith('http') &&
      !callbackUrl.includes('localhost') &&
      !callbackUrl.includes('127.0.0.1');

    if (isValidCallbackUrl) {
      apiUrl += `?fal_webhook=${callbackUrl}`;
    }

    console.log('fal input', apiUrl, input);

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('[fal] API request failed:', {
        status: resp.status,
        statusText: resp.statusText,
        body: errorText,
        url: apiUrl,
        inputKeys: Object.keys(input),
      });
      throw new Error(`request failed with status: ${resp.status} - ${errorText}`);
    }

    const data = await resp.json();
    console.log('[fal] API response data:', JSON.stringify(data, null, 2));
    console.log('[fal] API response keys:', Object.keys(data));

    // Check if sync_mode was used and response contains results
    // When sync_mode=true, fal.ai returns the complete response directly
    if (data.images !== undefined || data.output !== undefined || data.video !== undefined || data.videos !== undefined) {
      // Synchronous response with results
      let images: AIImage[] | undefined = undefined;
      let videos: AIVideo[] | undefined = undefined;

      // Handle image output - qwen-image-layered returns images array
      if (data.images && Array.isArray(data.images)) {
        console.log('[fal] Found images array in response:', data.images.length);
        console.log('[fal] First image item:', JSON.stringify(data.images[0]));
        // Handle both string URLs (including Base64 data URIs) and { url: string } objects
        images = data.images.map((image: any) => {
          const url = typeof image === 'string' ? image : (image.url || image.image_url);
          console.log('[fal] Processing image:', url ? url.substring(0, 100) : 'undefined');
          return {
            id: '',
            createTime: new Date(),
            imageUrl: url,
          };
        }).filter((img: any) => img.imageUrl);
        console.log('[fal] Processed images count:', images?.length || 0);
      }

      // Also check for output array (some fal.ai models use this)
      if ((!images || images.length === 0) && data.output && Array.isArray(data.output)) {
        console.log('[fal] Found output array:', data.output.length);
        console.log('[fal] First output item:', JSON.stringify(data.output[0]));
        // Check if output contains image URLs or image objects
        const firstOutput = data.output[0];
        // Handle Base64 data URIs (data:image/...) and HTTP(S) URLs
        if (typeof firstOutput === 'string' && (firstOutput.startsWith('http://') || firstOutput.startsWith('https://') || firstOutput.startsWith('data:'))) {
          images = data.output.map((url: string) => ({
            id: '',
            createTime: new Date(),
            imageUrl: url,
          }));
        } else if (firstOutput?.url || firstOutput?.image_url) {
          images = data.output.map((img: any) => ({
            id: '',
            createTime: new Date(),
            imageUrl: img.url || img.image_url || img,
          }));
        }
        console.log('[fal] Processed output images count:', images?.length || 0);
      }

      // Handle video output
      if (data.video && data.video.url) {
        videos = [{
          id: '',
          createTime: new Date(),
          videoUrl: data.video.url,
        }];
      } else if (data.videos && Array.isArray(data.videos)) {
        videos = data.videos.map((video: any) => ({
          id: '',
          createTime: new Date(),
          videoUrl: video.url || video,
        }));
      }

      console.log('[fal] Processed images:', images?.length || 0, 'videos:', videos?.length || 0);

      return {
        taskStatus: AITaskStatus.SUCCESS,
        taskId: data.request_id || '',
        taskInfo: {
          images,
          videos,
          status: 'COMPLETED',
          errorCode: '',
          errorMessage: '',
          createTime: new Date(),
        },
        taskResult: data,
      };
    }

    // Asynchronous response - return pending status
    if (!data || !data.request_id) {
      throw new Error('generate failed: no request_id');
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.request_id,
      taskInfo: {},
      taskResult: data,
    };
  }

  // query task
  async query({
    taskId,
    model,
    mediaType,
  }: {
    taskId: string;
    model?: string;
    mediaType?: AIMediaType;
  }): Promise<AITaskResult> {
    // extract first two parts of model name for query url
    // e.g. fal-ai/bytedance/seedream/v4/edit -> fal-ai/bytedance
    const queryModel = this.getQueryModel(model);

    // first check task status
    const statusUrl = `${this.baseUrl}/${queryModel}/requests/${taskId}/status`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Key ${this.configs.apiKey}`,
    };

    const statusResp = await fetch(statusUrl, {
      method: 'GET',
      headers,
    });

    if (!statusResp.ok) {
      throw new Error(`request failed with status: ${statusResp.status}`);
    }

    const statusData = await statusResp.json();
    const taskStatus = this.mapStatus(statusData.status);

    // if task is not completed, return status only
    if (taskStatus !== AITaskStatus.SUCCESS) {
      return {
        taskId,
        taskStatus,
        taskInfo: {
          status: statusData.status,
          errorCode: '',
          errorMessage: '',
        },
        taskResult: statusData,
      };
    }

    // get result if task is completed
    const resultUrl = `${this.baseUrl}/${queryModel}/requests/${taskId}`;
    const resultResp = await fetch(resultUrl, {
      method: 'GET',
      headers,
    });

    if (!resultResp.ok) {
      throw new Error(`request failed with status: ${resultResp.status}`);
    }

    const data = await resultResp.json();
    console.log('[fal] Query result data:', JSON.stringify(data, null, 2));
    console.log('[fal] Query result keys:', Object.keys(data));

    let images: AIImage[] | undefined = undefined;
    let videos: AIVideo[] | undefined = undefined;

    if (mediaType === AIMediaType.VIDEO) {
      // handle video output
      if (data.video && data.video.url) {
        videos = [
          {
            id: '',
            createTime: new Date(),
            videoUrl: data.video.url,
          },
        ];
      } else if (data.videos && Array.isArray(data.videos)) {
        videos = data.videos.map((video: any) => ({
          id: '',
          createTime: new Date(),
          videoUrl: video.url,
        }));
      }
    } else {
      // handle image output (default)
      // Check for images array first (fal.ai standard format)
      if (data.images && Array.isArray(data.images)) {
        console.log('[fal] Query: Found images array:', data.images.length);
        console.log('[fal] Query: First image:', JSON.stringify(data.images[0]));
        // Handle both string URLs (including Base64 data URIs) and { url: string } objects
        images = data.images.map((image: any) => {
          const url = typeof image === 'string' ? image : (image.url || image.image_url);
          console.log('[fal] Query: Processing image URL:', url ? url.substring(0, 100) : 'undefined');
          return {
            id: '',
            createTime: new Date(),
            imageUrl: url,
          };
        }).filter((img: any) => img.imageUrl);
        console.log('[fal] Query: Processed images count:', images?.length || 0);
      }
      // Also check for output array (some models use this)
      else if (data.output && Array.isArray(data.output)) {
        console.log('[fal] Query: Found output array:', data.output.length);
        console.log('[fal] Query: First output item:', JSON.stringify(data.output[0]));
        const firstOutput = data.output[0];
        // Handle Base64 data URIs (data:image/...) and HTTP(S) URLs
        if (typeof firstOutput === 'string' && (firstOutput.startsWith('http://') || firstOutput.startsWith('https://') || firstOutput.startsWith('data:'))) {
          images = data.output.map((url: string) => ({
            id: '',
            createTime: new Date(),
            imageUrl: url,
          }));
        } else if (firstOutput?.url || firstOutput?.image_url) {
          images = data.output.map((img: any) => ({
            id: '',
            createTime: new Date(),
            imageUrl: img.url || img.image_url || img,
          }));
        }
        console.log('[fal] Query: Processed output images count:', images?.length || 0);
      }
    }

    // save files to custom storage
    if (taskStatus === AITaskStatus.SUCCESS && this.configs.customStorage) {
      // save images
      if (images && images.length > 0) {
        const filesToSave: AIFile[] = [];
        images.forEach((image, index) => {
          if (image.imageUrl) {
            filesToSave.push({
              url: image.imageUrl,
              contentType: 'image/png',
              key: `fal/image/${getUuid()}.png`,
              index: index,
              type: 'image',
            });
          }
        });

        if (filesToSave.length > 0) {
          const uploadedFiles = await saveFiles(filesToSave);
          if (uploadedFiles) {
            uploadedFiles.forEach((file: AIFile) => {
              if (file && file.url && images && file.index !== undefined) {
                const image = images[file.index];
                if (image) {
                  image.imageUrl = file.url;
                }
              }
            });
          }
        }
      }

      // save videos
      if (videos && videos.length > 0) {
        const filesToSave: AIFile[] = [];
        videos.forEach((video, index) => {
          if (video.videoUrl) {
            filesToSave.push({
              url: video.videoUrl,
              contentType: 'video/mp4',
              key: `fal/video/${getUuid()}.mp4`,
              index: index,
              type: 'video',
            });
          }
        });

        if (filesToSave.length > 0) {
          const uploadedFiles = await saveFiles(filesToSave);
          if (uploadedFiles) {
            uploadedFiles.forEach((file: AIFile) => {
              if (file && file.url && videos && file.index !== undefined) {
                const video = videos[file.index];
                if (video) {
                  video.videoUrl = file.url;
                }
              }
            });
          }
        }
      }
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        images,
        videos,
        status: statusData.status,
        errorCode: '',
        errorMessage: '',
        createTime: new Date(),
      },
      taskResult: data,
    };
  }

  // map status
  private mapStatus(status: string): AITaskStatus {
    switch (status) {
      case 'IN_QUEUE':
        return AITaskStatus.PENDING;
      case 'IN_PROGRESS':
        return AITaskStatus.PROCESSING;
      case 'COMPLETED':
        return AITaskStatus.SUCCESS;
      case 'FAILED':
        return AITaskStatus.FAILED;
      default:
        throw new Error(`unknown status: ${status}`);
    }
  }

  // get query model name (first two parts)
  // e.g. fal-ai/bytedance/seedream/v4/edit -> fal-ai/bytedance
  private getQueryModel(model?: string): string {
    if (!model) {
      return '';
    }
    const parts = model.split('/');
    if (parts.length <= 2) {
      return model;
    }
    return `${parts[0]}/${parts[1]}`;
  }

  // format input
  private formatInput({
    mediaType,
    model,
    prompt,
    options,
  }: {
    mediaType: AIMediaType;
    model: string;
    prompt: string;
    options: any;
  }): any {
    // Special handling for qwen-image-layered model (Qwen Image Layered decomposition)
    if (model === 'fal-ai/qwen-image-layered' || model === 'fal-ai/qwen-image-layered/lora') {
      const isLora = model === 'fal-ai/qwen-image-layered/lora';

      const input: any = {
        image_url: options?.image_input?.[0] || '',
        num_layers: options?.num_layers || options?.layer_count || 4,
        num_inference_steps: options?.num_inference_steps || 28,
        guidance_scale: options?.guidance_scale || 5,
        enable_safety_checker: options?.enable_safety_checker !== false,
        output_format: options?.output_format || 'png',
        acceleration: options?.acceleration || 'regular',
      };

      // Handle prompt - can come from main prompt parameter or options
      const finalPrompt = options?.prompt || prompt;
      if (finalPrompt) {
        input.prompt = finalPrompt;
      }
      if (options?.negative_prompt) {
        input.negative_prompt = options.negative_prompt;
      }
      if (options?.seed !== undefined) {
        input.seed = options.seed;
      }
      if (options?.sync_mode !== undefined) {
        input.sync_mode = options.sync_mode;
      }

      // LoRA model specific: support lora_model_url for custom LoRA models
      if (isLora) {
        if (options?.lora_model_url) {
          input.lora_model_url = options.lora_model_url;
        }
        if (options?.lora_strength !== undefined) {
          input.lora_strength = options.lora_strength;
        }
        if (mediaType) {
          input.mediaType = mediaType;
        }
      }

      return input;
    }

    // Default formatting for other models
    let input: any = {
      prompt,
    };

    if (!options) {
      return input;
    }

    // input with all custom options
    input = {
      ...input,
      ...options,
    };

    // image_input is the default options
    if (options.image_input && Array.isArray(options.image_input)) {
      if (['fal-ai/kling-video/o1/video-to-video/edit'].includes(model)) {
        input.input_images = options.image_input;
      } else {
        input.image_url = options.image_input[0];
      }
      delete input.image_input;
    }

    // video_input is the default options
    if (options.video_input && Array.isArray(options.video_input)) {
      input.video_url = options.video_input[0];
      delete input.video_input;
    }

    return input;
  }
}
