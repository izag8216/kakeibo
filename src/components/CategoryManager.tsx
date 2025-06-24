import React, { useState } from 'react';
import {
  Card,
  Group,
  Stack,
  Text,
  Title,
  Button,
  ActionIcon,
  Badge,
  ColorSwatch,
  TextInput,
  Select,
  ColorInput,
  Modal,
  Box,
  Alert,
  Center,
  ThemeIcon,
  Grid,
  Menu,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconFolder,
  IconFolderOpen,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconDots,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';
import { Category, AppData } from '../types';
import { DataManager } from '../utils/dataManager';

interface CategoryManagerProps {
  categories: Category[];
  data: AppData;
  onSave: (updatedData: AppData) => Promise<void>;
}

interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  data,
  onSave,
}) => {
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');

  const form = useForm<CategoryFormData>({
    initialValues: {
      name: '',
      type: 'expense',
      color: '#ef4444',
      icon: '',
    },
    validate: {
      name: (value) => (!value ? 'カテゴリ名は必須です' : null),
      color: (value) => (!value ? '色は必須です' : null),
    },
  });

  const predefinedColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f43f5e', '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
  ];

  const handleSubmit = async (formData: CategoryFormData) => {
    try {
      let updatedData: AppData;

      if (editingCategory) {
        // 編集モード
        updatedData = DataManager.updateCategory(data, editingCategory.id, formData);
        notifications.show({
          title: '更新完了',
          message: 'カテゴリを更新しました',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        // 新規作成モード
        updatedData = DataManager.addCategory(data, formData);
        notifications.show({
          title: '作成完了',
          message: 'カテゴリを作成しました',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      await onSave(updatedData);
      closeModal();
      resetForm();
    } catch (error) {
      notifications.show({
        title: 'エラー',
        message: 'カテゴリの保存に失敗しました',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setValues({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon || '',
    });
    openModal();
  };

  const handleDelete = (category: Category) => {
    // カテゴリが使用されているかチェック
    const isUsed = data.transactions.some(t => t.category === category.id);
    const usageCount = data.transactions.filter(t => t.category === category.id).length;

    if (isUsed) {
      modals.openConfirmModal({
        title: 'カテゴリの削除',
        children: (
          <Stack gap="sm">
            <Alert icon={<IconInfoCircle size={16} />} color="orange">
              このカテゴリは{usageCount}件の取引で使用されています。
            </Alert>
            <Text size="sm">
              カテゴリを削除すると、関連する取引が「未分類」として表示される可能性があります。
              本当に削除しますか？
            </Text>
          </Stack>
        ),
        labels: { confirm: '削除', cancel: 'キャンセル' },
        confirmProps: { color: 'red' },
        onConfirm: () => deleteCategory(category),
      });
    } else {
      modals.openConfirmModal({
        title: 'カテゴリの削除',
        children: (
          <Text size="sm">
            「{category.name}」を削除しますか？この操作は元に戻せません。
          </Text>
        ),
        labels: { confirm: '削除', cancel: 'キャンセル' },
        confirmProps: { color: 'red' },
        onConfirm: () => deleteCategory(category),
      });
    }
  };

  const deleteCategory = async (category: Category) => {
    try {
      const updatedData = DataManager.deleteCategory(data, category.id);
      await onSave(updatedData);
      notifications.show({
        title: '削除完了',
        message: 'カテゴリを削除しました',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'エラー',
        message: 'カテゴリの削除に失敗しました',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    form.reset();
  };

  const handleNewCategory = (type: 'income' | 'expense') => {
    resetForm();
    form.setValues({
      name: '',
      type,
      color: type === 'income' ? '#10b981' : '#ef4444',
      icon: '',
    });
    openModal();
  };

  const getCategoryUsageCount = (categoryId: string) => {
    return data.transactions.filter(t => t.category === categoryId).length;
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
    const usageCount = getCategoryUsageCount(category.id);
    
    return (
      <Card withBorder radius="md" p="md">
        <Group justify="space-between" mb="sm">
          <Group gap="sm">
            <ColorSwatch color={category.color} size={24} />
            <div>
              <Text fw={500} size="sm">
                {category.name}
              </Text>
              <Text size="xs" c="dimmed">
                {usageCount}件の取引で使用
              </Text>
            </div>
          </Group>
          
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => handleEdit(category)}
              >
                編集
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => handleDelete(category)}
              >
                削除
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Badge
          variant="light"
          color={category.type === 'income' ? 'teal' : 'red'}
          size="sm"
        >
          {category.type === 'income' ? '収入' : '支出'}
        </Badge>
      </Card>
    );
  };

  return (
    <Stack gap="lg">
      {/* ヘッダー */}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} mb="xs">
            カテゴリ管理
          </Title>
          <Text c="dimmed">
            収入・支出のカテゴリを管理できます
          </Text>
        </Box>
      </Group>

      {/* タブ切り替え */}
      <Group gap="md">
        <Button
          variant={activeTab === 'expense' ? 'filled' : 'light'}
          leftSection={<IconArrowDown size={16} />}
          color="red"
          onClick={() => setActiveTab('expense')}
        >
          支出カテゴリ ({expenseCategories.length})
        </Button>
        <Button
          variant={activeTab === 'income' ? 'filled' : 'light'}
          leftSection={<IconArrowUp size={16} />}
          color="teal"
          onClick={() => setActiveTab('income')}
        >
          収入カテゴリ ({incomeCategories.length})
        </Button>
      </Group>

      {/* カテゴリリスト */}
      <Card shadow="md" radius="lg" p="xl">
        <Group justify="space-between" mb="lg">
          <Text size="lg" fw={600}>
            {activeTab === 'income' ? '収入' : '支出'}カテゴリ
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => handleNewCategory(activeTab)}
            color={activeTab === 'income' ? 'teal' : 'red'}
          >
            新規作成
          </Button>
        </Group>

        {activeTab === 'expense' ? (
          expenseCategories.length > 0 ? (
            <Grid gutter="md">
              {expenseCategories.map((category) => (
                <Grid.Col key={category.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <CategoryCard category={category} />
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Center py="xl">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} variant="light" color="red">
                  <IconFolder size={30} />
                </ThemeIcon>
                <Text c="dimmed">支出カテゴリがありません</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => handleNewCategory('expense')}
                  color="red"
                >
                  最初のカテゴリを作成
                </Button>
              </Stack>
            </Center>
          )
        ) : (
          incomeCategories.length > 0 ? (
            <Grid gutter="md">
              {incomeCategories.map((category) => (
                <Grid.Col key={category.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <CategoryCard category={category} />
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Center py="xl">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} variant="light" color="teal">
                  <IconFolderOpen size={30} />
                </ThemeIcon>
                <Text c="dimmed">収入カテゴリがありません</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => handleNewCategory('income')}
                  color="teal"
                >
                  最初のカテゴリを作成
                </Button>
              </Stack>
            </Center>
          )
        )}
      </Card>

      {/* カテゴリ作成・編集モーダル */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingCategory ? 'カテゴリを編集' : 'カテゴリを作成'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="カテゴリ名"
              placeholder="例: 食費、給与など"
              required
              {...form.getInputProps('name')}
            />

            <Select
              label="種類"
              required
              data={[
                { value: 'income', label: '収入' },
                { value: 'expense', label: '支出' },
              ]}
              {...form.getInputProps('type')}
            />

            <div>
              <Text size="sm" fw={500} mb="xs">
                色
              </Text>
              <Group gap="xs" mb="sm">
                {predefinedColors.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    size={32}
                    style={{ cursor: 'pointer' }}
                    onClick={() => form.setFieldValue('color', color)}
                  />
                ))}
              </Group>
              <ColorInput
                placeholder="カスタム色を選択"
                {...form.getInputProps('color')}
              />
            </div>

            <Group justify="flex-end" gap="md">
              <Button variant="light" onClick={closeModal}>
                キャンセル
              </Button>
              <Button type="submit" color={form.values.type === 'income' ? 'teal' : 'red'}>
                {editingCategory ? '更新' : '作成'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
};

export default CategoryManager;