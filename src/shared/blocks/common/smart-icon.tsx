import type { ComponentType, SVGProps } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BarChart2,
  BookOpenText,
  Bot,
  Brain,
  CheckSquare2,
  Clapperboard,
  Clock,
  Cloud,
  Coins,
  Code2,
  CreditCard,
  Database,
  DollarSign,
  Edit3,
  Eraser,
  Expand,
  Eye,
  FileText,
  Folder,
  Github,
  HelpCircle,
  History,
  Home,
  Image,
  ImagePlus,
  Key,
  KeyRound,
  Layers,
  Layers3,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Shirt,
  Sparkles,
  User,
  Users,
  RefreshCw,
  Trash2,
  Zap,
} from 'lucide-react';

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: string | number }
>;

const lucideIcons: Record<string, IconComponent> = {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BookOpenText,
  Brain,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  Folder,
  Github,
  HelpCircle,
  History,
  Home,
  Key,
  Layers,
  Mail,
  Menu,
  MessageCircle,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Zap,
};

const legacyRemixIcons: Record<string, IconComponent> = {
  RiAddLine: Plus,
  RiBarChart2Line: BarChart2,
  RiChat2Line: MessageSquare,
  RiClapperboardAiLine: Clapperboard,
  RiCloudy2Fill: Cloud,
  RiCloudyFill: Cloud,
  RiCodeFill: Code2,
  RiDatabase2Line: Database,
  RiDeleteBinLine: Trash2,
  RiEditLine: Edit3,
  RiEraserLine: Eraser,
  RiExpandDiagonalLine: Expand,
  RiEyeLine: Eye,
  RiFlashlightFill: Zap,
  RiImage2Line: Image,
  RiImageEditLine: ImagePlus,
  RiKey2Fill: KeyRound,
  RiKeyLine: Key,
  RiLockPasswordLine: LockKeyhole,
  RiNextjsFill: Layers3,
  RiQuestionLine: HelpCircle,
  RiRefreshLine: RefreshCw,
  RiRobot2Line: Bot,
  RiShirtLine: Shirt,
  RiTaskLine: CheckSquare2,
};

export function SmartIcon({
  name,
  size = 24,
  className,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  [key: string]: unknown;
}) {
  const IconComponent = name.startsWith('Ri')
    ? (legacyRemixIcons[name] ?? HelpCircle)
    : (lucideIcons[name] ?? HelpCircle);

  return (
    <IconComponent
      size={size}
      className={className}
      {...(props as SVGProps<SVGSVGElement>)}
    />
  );
}
