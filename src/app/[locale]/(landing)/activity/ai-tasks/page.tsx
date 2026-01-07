import { getTranslations } from 'next-intl/server';

import { AITaskStatus } from '@/extensions/ai';
import { AudioPlayer, Empty, LazyImage } from '@/shared/blocks/common';
import { TableCard } from '@/shared/blocks/table';
import { AITask, getAITasks, getAITasksCount } from '@/shared/models/ai_task';
import { getUserInfo } from '@/shared/models/user';
import { Button, Tab } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function AiTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: number; pageSize?: number; type?: string }>;
}) {
  const { page: pageNum, pageSize, type } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 20;

  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('activity.ai-tasks');

  const aiTasks = await getAITasks({
    userId: user.id,
    mediaType: type,
    page,
    limit,
  });

  const total = await getAITasksCount({
    userId: user.id,
    mediaType: type,
  });

  // Status badge styles
  const getStatusBadge = (status: AITaskStatus) => {
    const styles: Record<string, string> = {
      [AITaskStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      [AITaskStatus.PROCESSING]: 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse',
      [AITaskStatus.SUCCESS]: 'bg-green-500/20 text-green-400 border-green-500/30',
      [AITaskStatus.FAILED]: 'bg-red-500/20 text-red-400 border-red-500/30',
      [AITaskStatus.CANCELED]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // Get status label
  const getStatusLabel = (status: AITaskStatus) => {
    const labels: Record<string, string> = {
      [AITaskStatus.PENDING]: t('status.pending'),
      [AITaskStatus.PROCESSING]: t('status.processing'),
      [AITaskStatus.SUCCESS]: t('status.completed'),
      [AITaskStatus.FAILED]: t('status.failed'),
      [AITaskStatus.CANCELED]: t('status.canceled'),
    };
    return labels[status] || status;
  };

  // Format cost credits
  const formatCost = (credits: number | null) => {
    if (!credits || credits === 0) return '-';
    return `${credits} credits`;
  };

  // Preview column callback
  const renderPreview = (item: AITask) => {
    if (item.taskInfo) {
      const taskInfo = JSON.parse(item.taskInfo);

      // Image preview
      if (taskInfo.images && taskInfo.images.length > 0) {
        return (
          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-black/40">
            <img
              src={taskInfo.images[0].imageUrl}
              alt="Preview"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {taskInfo.images.length > 1 && (
              <div className="absolute bottom-0 right-0 bg-black/60 px-1 py-0.5 text-[10px] text-white">
                +{taskInfo.images.length - 1}
              </div>
            )}
          </div>
        );
      }

      // Audio/Music preview
      if (taskInfo.songs && taskInfo.songs.length > 0) {
        return (
          <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        );
      }
    }
    return <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">-</div>;
  };

  // Status column callback
  const renderStatus = (item: AITask) => {
    const status = item.status as AITaskStatus;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(status)}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  // Cost column callback
  const renderCost = (item: AITask) => (
    <span className="text-sm text-gray-400 font-mono">
      {formatCost(item.costCredits)}
    </span>
  );

  // Result column callback
  const renderResult = (item: AITask) => {
    if (item.taskInfo) {
      const taskInfo = JSON.parse(item.taskInfo);
      if (taskInfo.errorMessage) {
        return (
          <div className="max-w-xs text-red-400 text-sm truncate" title={taskInfo.errorMessage}>
            Failed: {taskInfo.errorMessage}
          </div>
        );
      } else if (taskInfo.songs && taskInfo.songs.length > 0) {
        const songs: any[] = taskInfo.songs.filter(
          (song: any) => song.audioUrl
        );
        if (songs.length > 0) {
          return (
            <div className="flex flex-col gap-1 max-w-xs">
              <AudioPlayer
                key={songs[0].id}
                src={songs[0].audioUrl}
                title={songs[0].title}
                className="w-64"
              />
              {songs.length > 1 && (
                <span className="text-xs text-gray-500">+ {songs.length - 1} more tracks</span>
              )}
            </div>
          );
        }
      } else if (taskInfo.images && taskInfo.images.length > 0) {
        return (
          <div className="flex gap-1">
            {taskInfo.images.slice(0, 4).map((image: any, index: number) => (
              <LazyImage
                key={index}
                src={image.imageUrl}
                alt={`Generated ${index + 1}`}
                className="h-12 w-12 rounded border border-white/10"
              />
            ))}
            {taskInfo.images.length > 4 && (
              <div className="h-12 w-12 rounded bg-white/5 flex items-center justify-center text-xs text-gray-500">
                +{taskInfo.images.length - 4}
              </div>
            )}
          </div>
        );
      }
    }
    return '-';
  };

  const table: Table = {
    title: t('list.title'),
    columns: [
      {
        name: 'preview',
        title: t('fields.preview'),
        callback: renderPreview,
      },
      {
        name: 'prompt',
        title: t('fields.prompt'),
        type: 'copy',
      },
      {
        name: 'mediaType',
        title: t('fields.media_type'),
        type: 'label',
      },
      {
        name: 'provider',
        title: t('fields.provider'),
        type: 'label',
      },
      {
        name: 'status',
        title: t('fields.status'),
        callback: renderStatus,
      },
      {
        name: 'costCredits',
        title: t('fields.cost_credits'),
        callback: renderCost,
      },
      {
        name: 'result',
        title: t('fields.result'),
        callback: renderResult,
      },
      {
        name: 'createdAt',
        title: t('fields.created_at'),
        type: 'time',
      },
      {
        name: 'action',
        title: t('fields.action'),
        type: 'dropdown',
        callback: (item: AITask) => {
          const items: Button[] = [];

          if (
            item.status === AITaskStatus.PENDING ||
            item.status === AITaskStatus.PROCESSING
          ) {
            items.push({
              title: t('list.buttons.refresh'),
              url: `/activity/ai-tasks/${item.id}/refresh`,
              icon: 'RiRefreshLine',
            });
          }

          return items;
        },
      },
    ],
    data: aiTasks,
    emptyMessage: t('list.empty_message'),
    pagination: {
      total,
      page,
      limit,
    },
  };

  const tabs: Tab[] = [
    {
      name: 'all',
      title: t('list.tabs.all'),
      url: '/activity/ai-tasks',
      is_active: !type || type === 'all',
    },
    {
      name: 'music',
      title: t('list.tabs.music'),
      url: '/activity/ai-tasks?type=music',
      is_active: type === 'music',
    },
    {
      name: 'image',
      title: t('list.tabs.image'),
      url: '/activity/ai-tasks?type=image',
      is_active: type === 'image',
    },
    {
      name: 'video',
      title: t('list.tabs.video'),
      url: '/activity/ai-tasks?type=video',
      is_active: type === 'video',
    },
    {
      name: 'audio',
      title: t('list.tabs.audio'),
      url: '/activity/ai-tasks?type=audio',
      is_active: type === 'audio',
    },
    {
      name: 'text',
      title: t('list.tabs.text'),
      url: '/activity/ai-tasks?type=text',
      is_active: type === 'text',
    },
  ];

  return (
    <div className="space-y-8">
      <TableCard title={t('list.title')} tabs={tabs} table={table} />
    </div>
  );
}
