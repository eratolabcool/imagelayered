import { getUuid } from '@/shared/lib/hash';

import { saveFiles } from '.';
import {
  AIConfigs,
  AIFile,
  AIGenerateParams,
  AIImage,
  AIMediaType,
  AIProvider,
  AISong,
  AITaskResult,
  AITaskStatus,
  AIVideo,
} from './types';

/**
 * Kie configs
 * @docs https://kie.ai/
 */
export interface KieConfigs extends AIConfigs {
  apiKey: string;
  customStorage?: boolean; // use custom storage to save files
}

/**
 * Kie provider
 * @docs https://kie.ai/
 */
export class KieProvider implements AIProvider {
  // provider name
  readonly name = 'kie';
  // provider configs
  configs: KieConfigs;

  // api base url
  private baseUrl = 'https://api.kie.ai/api/v1';

  // init provider
  constructor(configs: KieConfigs) {
    this.configs = configs;
  }

  private async parseResponse(response: Response, action: string) {
    const raw = await response.text();
    let payload: any = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      // Keep the raw response below when the provider returns non-JSON text.
    }

    if (!response.ok) {
      const detail = payload?.msg || payload?.message || payload?.error || raw;
      throw new Error(
        `${action} failed (${response.status})${detail ? `: ${String(detail).slice(0, 500)}` : ''}`
      );
    }
    return payload;
  }

  /**
   * Kie's layer endpoint fetches image_url from its own network. Uploading the
   * source through Kie's temporary file API avoids failures with private or
   * signed storage URLs and gives the model a stable public URL.
   */
  private async prepareLayerInputUrl(sourceUrl: string) {
    if (sourceUrl.startsWith('data:image/')) return sourceUrl;

    let sourceResponse: Response;
    try {
      sourceResponse = await fetch(sourceUrl, {
        redirect: 'follow',
        signal: AbortSignal.timeout(30_000),
        headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif' },
      });
    } catch (error) {
      throw new Error(
        `Unable to fetch the source image for Kie: ${error instanceof Error ? error.message : 'network error'}`
      );
    }
    if (!sourceResponse.ok) {
      throw new Error(`Unable to fetch the source image (${sourceResponse.status})`);
    }

    const sourceBytes = new Uint8Array(await sourceResponse.arrayBuffer());
    if (sourceBytes.byteLength === 0) {
      throw new Error('The source image is empty. Please upload it again.');
    }
    if (sourceBytes.byteLength > 30 * 1024 * 1024) {
      throw new Error('The source image exceeds Kie\'s 30 MB limit.');
    }

    const contentType =
      sourceResponse.headers.get('content-type')?.split(';')[0].trim() ||
      'image/png';
    const extension = contentType === 'image/jpeg' ? 'jpg' : 'png';
    const form = new FormData();
    form.append(
      'file',
      new Blob([sourceBytes], { type: contentType }),
      `image-layered-source.${extension}`
    );
    form.append('uploadPath', 'images/image-layered');

    const uploadResponse = await fetch(
      'https://kieai.redpandaai.co/api/file-stream-upload',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.configs.apiKey}` },
        body: form,
        signal: AbortSignal.timeout(30_000),
      }
    );
    const upload = await this.parseResponse(uploadResponse, 'Kie image upload');
    const uploadedUrl = upload?.data?.downloadUrl || upload?.data?.fileUrl;
    if (typeof uploadedUrl !== 'string' || !uploadedUrl.startsWith('http')) {
      throw new Error('Kie image upload returned no usable image URL.');
    }
    return uploadedUrl;
  }

  async generateMusic({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/generate`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    // todo: check model
    if (!params.model) {
      params.model = 'V5';
    }

    // build request params
    let payload: any = {
      prompt: params.prompt,
      model: params.model,
      callBackUrl: params.callbackUrl,
    };

    if (params.options && params.options.customMode) {
      // custom mode
      payload.customMode = true;
      payload.title = params.options.title;
      payload.style = params.options.style;
      payload.instrumental = params.options.instrumental;
      if (!params.options.instrumental) {
        // not instrumental, lyrics is used as prompt
        payload.prompt = params.options.lyrics;
      }
    } else {
      // not custom mode
      payload.customMode = false;
      payload.prompt = params.prompt;
      payload.instrumental = params.options?.instrumental;
    }

    // const params = {
    //   customMode: false,
    //   instrumental: false,
    //   style: "",
    //   title: "",
    //   prompt: prompt || "",
    //   model: model || "V4_5",
    //   callBackUrl,
    //   negativeTags: "",
    //   vocalGender: "m", // m or f
    //   styleWeight: 0.65,
    //   weirdnessConstraint: 0.65,
    //   audioWeight: 0.65,
    // };

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const { code, msg, data } = await this.parseResponse(resp, 'Kie layer task status');

    if (code !== 200) {
      throw new Error(`generate music failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate music failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  async generateImage({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/createTask`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    if (!params.model) {
      throw new Error('model is required');
    }

    if (!params.prompt) {
      throw new Error('prompt is required');
    }

    // Layer-decomposition models take a single image_url + size; other image
    // models use image_input/aspect_ratio/resolution.
    if (params.model === 'seedream/5-pro-layer-decomposition') {
      const options = params.options || {};
      const sourceUrls: string[] =
        (Array.isArray(options.image_urls) && options.image_urls) ||
        (Array.isArray(options.image_input) && options.image_input) ||
        [];
      if (sourceUrls.length === 0) {
        throw new Error('image_urls is required for layer decomposition');
      }

      const input: Record<string, unknown> = {
        image_url: await this.prepareLayerInputUrl(sourceUrls[0]),
        prompt: params.prompt,
        output_format: 'png',
      };

      // Kie documents `auto` as the default for this model. The Studio's
      // legacy auto_2K hint should not force a provider-specific resolution.
      if (options.size === '2K') {
        input.size = '2K';
      } else if (options.image_size === 'auto_2K') {
        input.size = 'auto';
      } else if (typeof options.size === 'string') {
        input.size = options.size;
      }

      const resp = await fetch(`${this.baseUrl}/jobs/createTask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: params.model, callBackUrl: params.callbackUrl, input }),
      });
      const { code, msg, data } = await this.parseResponse(resp, 'Kie layer task');
      if (code !== 200) {
        throw new Error(`Kie layer task rejected: ${msg || 'unknown provider error'}`);
      }
      if (!data || !data.taskId) {
        throw new Error(`generate image failed: no taskId`);
      }
      return {
        taskStatus: AITaskStatus.PENDING,
        taskId: data.taskId,
        taskInfo: {},
        taskResult: data,
      };
    }

    // build request params
    let payload: any = {
      model: params.model,
      callBackUrl: params.callbackUrl,
      input: {
        prompt: params.prompt,
      },
    };

    if (params.options) {
      const options = params.options;
      if (options.image_input && Array.isArray(options.image_input)) {
        payload.input.image_input = options.image_input;
      }
      if (options.aspect_ratio) {
        payload.input.aspect_ratio = options.aspect_ratio;
      }
      if (options.resolution) {
        payload.input.resolution = options.resolution;
      }
      if (options.output_format) {
        payload.input.output_format = options.output_format;
      }
    }

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const { code, msg, data } = await this.parseResponse(resp, 'Kie image task');

    if (code !== 200) {
      throw new Error(`generate image failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate image failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  async generateVideo({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/createTask`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    if (!params.model) {
      throw new Error('model is required');
    }

    // build request params
    let payload: any = {
      model: params.model,
      callBackUrl: params.callbackUrl,
      input: {
        aspect_ratio: 'landscape',
        n_frames: '10',
        size: 'standard',
      },
    };

    if (params.prompt) {
      payload.input.prompt = params.prompt;
    }

    if (params.options) {
      const options = params.options;
      // text-to-video: use prompt
      // image-to-video: use image_input
      // video-to-video: use video_input
      if (options.image_input && Array.isArray(options.image_input)) {
        payload.input.image_urls = options.image_input;
      }
      if (options.aspect_ratio) {
        payload.input.aspect_ratio = options.aspect_ratio;
      }
      if (options.duration) {
        payload.input.n_frames = options.duration;
      }
      if (!payload.input.n_frames) {
        payload.input.n_frames = '10';
      }
    }

    console.log('kie input', apiUrl, payload);

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const { code, msg, data } = await this.parseResponse(resp, 'Kie image task status');

    if (code !== 200) {
      throw new Error(`generate video failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate video failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  // generate task
  async generate({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    if (
      ![AIMediaType.MUSIC, AIMediaType.IMAGE, AIMediaType.VIDEO].includes(
        params.mediaType
      )
    ) {
      throw new Error(`mediaType not supported: ${params.mediaType}`);
    }

    if (params.mediaType === AIMediaType.MUSIC) {
      return this.generateMusic({ params });
    } else if (params.mediaType === AIMediaType.IMAGE) {
      return this.generateImage({ params });
    } else if (params.mediaType === AIMediaType.VIDEO) {
      return this.generateVideo({ params });
    }

    throw new Error(`mediaType not supported: ${params.mediaType}`);
  }

  async queryImage({ taskId }: { taskId: string }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    const { code, msg, data } = await this.parseResponse(resp, 'Kie layer task status');

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.state) {
      throw new Error(`query failed`);
    }

    let images: AIImage[] | undefined;
    if (data.resultJson) {
      let resultJson: any = data.resultJson;
      if (typeof resultJson === 'string') {
        try {
          resultJson = JSON.parse(resultJson);
        } catch {
          resultJson = null;
        }
      }
      const resultUrls = [
        ...(Array.isArray(resultJson?.resultUrls) ? resultJson.resultUrls : []),
        ...(Array.isArray(resultJson?.result_urls) ? resultJson.result_urls : []),
        ...(Array.isArray(resultJson?.images) ? resultJson.images : []),
        ...(Array.isArray(resultJson?.output) ? resultJson.output : []),
      ];
      if (resultUrls.length > 0) {
        images = resultUrls
          .map((image: any) =>
            typeof image === 'string'
              ? image
              : image?.imageUrl || image?.url || image?.downloadUrl
          )
          .filter((image): image is string => typeof image === 'string' && image.length > 0)
          .map((image) => ({
            id: '',
            createTime: new Date(data.createTime),
            imageUrl: image,
          }));
      }
    }

    const taskStatus = this.mapImageStatus(data.state);

    // use custom storage to save images
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      images &&
      images.length > 0 &&
      this.configs.customStorage
    ) {
      const filesToSave: AIFile[] = [];
      images.forEach((image, index) => {
        if (image.imageUrl) {
          filesToSave.push({
            url: image.imageUrl,
            contentType: 'image/png',
            key: `kie/image/${getUuid()}.png`,
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

    return {
      taskId,
      taskStatus,
      taskInfo: {
        images,
        status: data.state,
        errorCode: data.failCode,
        errorMessage: data.failMsg,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  async queryVideo({ taskId }: { taskId: string }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await this.parseResponse(resp, 'Kie video task status');

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.state) {
      throw new Error(`query failed`);
    }

    let videos: AIVideo[] | undefined = undefined;

    if (data.resultJson) {
      const resultJson = JSON.parse(data.resultJson);
      const resultUrls = resultJson.resultUrls;
      if (Array.isArray(resultUrls)) {
        videos = resultUrls.map((video: any) => ({
          id: '',
          createTime: new Date(data.createTime),
          videoUrl: video,
        }));
      }
    }

    const taskStatus = this.mapImageStatus(data.state);

    // use custom storage to save videos
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      videos &&
      videos.length > 0 &&
      this.configs.customStorage
    ) {
      const filesToSave: AIFile[] = [];
      videos.forEach((video, index) => {
        if (video.videoUrl) {
          filesToSave.push({
            url: video.videoUrl,
            contentType: 'video/mp4',
            key: `kie/video/${getUuid()}.mp4`,
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

    return {
      taskId,
      taskStatus,
      taskInfo: {
        videos,
        status: data.state,
        errorCode: data.failCode,
        errorMessage: data.failMsg,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  // query task
  async query({
    taskId,
    mediaType,
  }: {
    taskId: string;
    mediaType?: AIMediaType;
  }): Promise<AITaskResult> {
    if (mediaType === AIMediaType.IMAGE) {
      return this.queryImage({ taskId });
    }

    if (mediaType === AIMediaType.VIDEO) {
      return this.queryVideo({ taskId });
    }

    const apiUrl = `${this.baseUrl}/generate/record-info?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.status) {
      throw new Error(`query failed`);
    }

    const songs: AISong[] = data?.response?.sunoData?.map((song: any) => ({
      id: song.id,
      createTime: new Date(song.createTime),
      audioUrl: song.audioUrl,
      imageUrl: song.imageUrl,
      duration: song.duration,
      prompt: song.prompt,
      title: song.title,
      tags: song.tags,
      style: song.style,
      model: song.modelName,
      artist: song.artist,
      album: song.album,
    }));

    const taskStatus = this.mapStatus(data.status);

    // save files if custom storage is enabled
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      songs &&
      songs.length > 0 &&
      this.configs.customStorage
    ) {
      const audioFilesToSave: AIFile[] = [];
      const imageFilesToSave: AIFile[] = [];

      songs.forEach((song, index) => {
        if (song.audioUrl) {
          audioFilesToSave.push({
            url: song.audioUrl,
            contentType: 'audio/mpeg',
            key: `kie/audio/${getUuid()}.mp3`,
            index: index,
            type: 'audio',
          });
        }
        if (song.imageUrl) {
          imageFilesToSave.push({
            url: song.imageUrl,
            contentType: 'image/png',
            key: `kie/image/${getUuid()}.png`,
            index: index,
            type: 'image',
          });
        }
      });

      if (audioFilesToSave.length > 0) {
        const uploadedFiles = await saveFiles(audioFilesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && songs && file.index !== undefined) {
              const song = songs[file.index];
              song.audioUrl = file.url;
            }
          });
        }
      }

      if (imageFilesToSave.length > 0) {
        const uploadedFiles = await saveFiles(imageFilesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && songs && file.index !== undefined) {
              const song = songs[file.index];
              song.imageUrl = file.url;
            }
          });
        }
      }
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        songs,
        status: data.status,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  // map image task status
  private mapImageStatus(status: string): AITaskStatus {
    switch (status.toLowerCase()) {
      case 'waiting':
      case 'pending':
        return AITaskStatus.PENDING;
      case 'queuing':
      case 'queued':
        return AITaskStatus.PENDING;
      case 'generating':
      case 'processing':
      case 'running':
        return AITaskStatus.PROCESSING;
      case 'success':
      case 'succeeded':
      case 'completed':
      case 'complete':
        return AITaskStatus.SUCCESS;
      case 'fail':
      case 'failed':
      case 'error':
        return AITaskStatus.FAILED;
      default:
        throw new Error(`unknown status: ${status}`);
    }
  }

  // map music task status
  private mapStatus(status: string): AITaskStatus {
    switch (status) {
      case 'PENDING':
        return AITaskStatus.PENDING;
      case 'TEXT_SUCCESS':
        return AITaskStatus.PROCESSING;
      case 'FIRST_SUCCESS':
        return AITaskStatus.PROCESSING;
      case 'SUCCESS':
        return AITaskStatus.SUCCESS;
      case 'CREATE_TASK_FAILED':
      case 'GENERATE_AUDIO_FAILED':
      case 'CALLBACK_EXCEPTION':
      case 'SENSITIVE_WORD_ERROR':
        return AITaskStatus.FAILED;
      default:
        throw new Error(`unknown status: ${status}`);
    }
  }
}
