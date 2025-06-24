import React from 'react';
import {
  AppShell,
  Text,
  Burger,
  useMantineTheme,
  Group,
  Avatar,
  Box,
  Stack,
  Badge,
  ActionIcon,
  Tooltip,
  ThemeIcon,
  Divider,
  Paper,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconHome2,
  IconPlus,
  IconList,
  IconChartBar,
  IconSettings,
  IconWallet,
  IconBell,
  IconSearch,
  IconSun,
  IconMoon,
  IconUser,
  IconLogout,
  IconCreditCard,
} from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useTheme();
  const [opened, { toggle }] = useDisclosure(false);

  const navigationData = [
    { 
      id: 'dashboard', 
      label: 'ダッシュボード', 
      icon: IconHome2, 
      color: 'blue',
      description: '概要を確認'
    },
    { 
      id: 'add-transaction', 
      label: '取引追加', 
      icon: IconPlus, 
      color: 'green',
      description: '新しい取引を記録'
    },
    { 
      id: 'transactions', 
      label: '取引履歴', 
      icon: IconList, 
      color: 'violet',
      description: '全ての取引を表示'
    },
    { 
      id: 'categories', 
      label: 'カテゴリ管理', 
      icon: IconCreditCard, 
      color: 'orange',
      description: 'カテゴリを管理'
    },
    { 
      id: 'statistics', 
      label: '統計・分析', 
      icon: IconChartBar, 
      color: 'teal',
      description: '詳細な分析を表示'
    },
    { 
      id: 'settings', 
      label: '設定', 
      icon: IconSettings, 
      color: 'gray',
      description: 'アプリの設定'
    },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    if (opened) toggle();
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          background: colorScheme === 'light'
            ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            : 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
          minHeight: '100vh',
        },
      }}
    >
      <AppShell.Header>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 var(--mantine-spacing-md)' }}>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />

          <Group justify="space-between" style={{ flex: 1 }}>
            <Group gap="md" visibleFrom="sm">
              <ThemeIcon 
                size={40} 
                radius="md" 
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                <IconWallet size={22} />
              </ThemeIcon>
              <div>
                <Text size="xl" fw={700}>
                  かけいぼ
                </Text>
              </div>
            </Group>

            <Group gap="md">
              <Tooltip label="検索">
                <ActionIcon size="lg" variant="subtle" color="gray">
                  <IconSearch size={20} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="通知">
                <ActionIcon size="lg" variant="subtle" color="gray" pos="relative">
                  <IconBell size={20} />
                  <Badge
                    size="xs"
                    color="red"
                    variant="filled"
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                    }}
                  >
                    3
                  </Badge>
                </ActionIcon>
              </Tooltip>

              <Tooltip label={colorScheme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}>
                <ActionIcon
                  size="lg"
                  variant="outline"
                  color="blue"
                  onClick={toggleColorScheme}
                >
                  {colorScheme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
                </ActionIcon>
              </Tooltip>

              <Avatar size="md" color="blue" radius="xl">
                <IconUser size={18} />
              </Avatar>
            </Group>
          </Group>
        </div>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        styles={{
          navbar: {
            background: colorScheme === 'light' 
              ? 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
              : 'linear-gradient(180deg, #374151 0%, #4b5563 100%)',
            border: colorScheme === 'light' 
              ? '1px solid #e2e8f0'
              : '1px solid #6b7280',
          },
        }}
      >
        {/* Logo Section - Simplified */}
        <Group justify="center" mb="xl">
          <ThemeIcon 
            size={50} 
            radius="md" 
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            className="pulse-animation"
          >
            <IconWallet size={28} />
          </ThemeIcon>
        </Group>

        {/* Navigation Links */}
        <AppShell.Section grow>
          <Stack gap="xs">
            {navigationData.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              
              return (
                <Box
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: theme.radius.md,
                    marginBottom: 4,
                    backgroundColor: isActive 
                      ? (colorScheme === 'light' 
                          ? 'rgba(59, 130, 246, 0.1)' 
                          : 'rgba(255, 255, 255, 0.2)')
                      : 'transparent',
                    border: isActive 
                      ? (colorScheme === 'light'
                          ? '1px solid rgba(59, 130, 246, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.5)')
                      : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                  className="sidebar-nav-link-custom"
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = colorScheme === 'light'
                        ? 'rgba(59, 130, 246, 0.05)'
                        : 'rgba(255, 255, 255, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Group gap="sm">
                    <ThemeIcon 
                      color={isActive 
                        ? (colorScheme === 'light' ? 'blue' : 'white')
                        : item.color
                      } 
                      variant={isActive ? 'light' : 'outline'}
                      size={28}
                      style={{
                        backgroundColor: isActive && colorScheme === 'light' 
                          ? 'rgba(59, 130, 246, 0.1)'
                          : undefined
                      }}
                    >
                      <Icon size={16} />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Text 
                        size="sm" 
                        fw={700}
                        style={{ 
                          lineHeight: 1.2,
                          color: colorScheme === 'light' 
                            ? (isActive ? '#1d4ed8' : '#1f2937')
                            : '#ffffff',
                          fontWeight: 700,
                          textShadow: 'none',
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text 
                        size="xs"
                        style={{ 
                          lineHeight: 1.2,
                          marginTop: 2,
                          color: colorScheme === 'light' 
                            ? (isActive ? '#2563eb' : '#6b7280')
                            : '#e5e7eb',
                          textShadow: 'none',
                        }}
                      >
                        {item.description}
                      </Text>
                    </Box>
                    {item.id === 'add-transaction' && (
                      <Badge size="xs" variant="light" color="yellow">
                        NEW
                      </Badge>
                    )}
                  </Group>
                </Box>
              );
            })}
          </Stack>
        </AppShell.Section>

        {/* Bottom Section */}
        <AppShell.Section>
          <Divider 
            mb="md" 
            color={colorScheme === 'light' 
              ? 'rgba(148, 163, 184, 0.3)'
              : 'rgba(255,255,255,0.3)'
            } 
          />
          <Group justify="space-between">
            <Group gap="xs">
              <Avatar size="sm" color="blue" radius="xl">
                <IconUser size={16} />
              </Avatar>
              <div>
                <Text 
                  size="sm" 
                  fw={500}
                  style={{
                    color: colorScheme === 'light' ? '#374151' : '#ffffff',
                    fontWeight: 500,
                  }}
                >
                  ユーザー
                </Text>
                <Text 
                  size="xs" 
                  style={{
                    color: colorScheme === 'light' ? '#6b7280' : '#e5e7eb',
                  }}
                >
                  無料プラン
                </Text>
              </div>
            </Group>
            <Tooltip label="ログアウト">
              <ActionIcon 
                color="red" 
                variant={colorScheme === 'light' ? 'light' : 'subtle'}
              >
                <IconLogout size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box p="md" className="fade-in-up">
          <Paper
            shadow="md"
            radius="lg"
            p="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              minHeight: 'calc(100vh - 140px)',
            }}
          >
            {children}
          </Paper>
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;