import {
  Layers, Key, Users, Tag, CreditCard, MessageSquare, Timer,
  Webhook, FolderLock, Variable, Scale, ScrollText,
  CloudDownload, Users2, Settings,
} from 'lucide-react';

/* KeyAuth v4 dashboard navigation (app nav + fixed bottom links) */
export const navItems = [
  { to: '/app/manage-apps', icon: Layers, label: 'Manage Apps' },
  { to: '/app/licenses', icon: Key, label: 'Licenses' },
  { to: '/app/users', icon: Users, label: 'Users' },
  { to: '/app/tokens', icon: Tag, label: 'Tokens' },
  { to: '/app/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/app/chats', icon: MessageSquare, label: 'Chats', premium: true },
  { to: '/app/sessions', icon: Timer, label: 'Sessions' },
  { to: '/app/webhooks', icon: Webhook, label: 'Webhooks', premium: true },
  { to: '/app/files', icon: FolderLock, label: 'Files', premium: true },
  { to: '/app/variables', icon: Variable, label: 'Variables', premium: true },
  { to: '/app/rules', icon: Scale, label: 'Rules', premium: true },
  { to: '/app/logs', icon: ScrollText, label: 'Event Logs' },
  { to: '/app/web-loader', icon: CloudDownload, label: 'Web Loader', premium: true },
  { to: '/app/team', icon: Users2, label: 'Team', premium: true },
];

export const bottomItems = [
  { to: '/app/app-settings', icon: Settings, label: 'Settings' },
];
