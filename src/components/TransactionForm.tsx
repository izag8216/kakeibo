import React, { useState, useEffect } from 'react';
import {
  Card,
  NumberInput,
  Select,
  Textarea,
  Button,
  Group,
  Stack,
  SegmentedControl,
  Alert,
  Paper,
  ThemeIcon,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Box,
  Title,
  Divider,
  ColorSwatch,
  Grid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconDeviceFloppy,
  IconX,
  IconAlertCircle,
  IconCoin,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconCreditCard,
  IconFileText,
  IconCheck,
  IconCurrencyYen,
} from '@tabler/icons-react';
import { Transaction, Category } from '../types';
import { DataManager } from '../utils/dataManager';

interface TransactionFormProps {
  categories: Category[];
  editingTransaction?: Transaction | null;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  editingTransaction,
  onSave,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      date: editingTransaction?.date ? new Date(editingTransaction.date) : new Date(),
      type: editingTransaction?.type || 'expense' as 'income' | 'expense',
      amount: editingTransaction?.amount || '',
      category: editingTransaction?.category || '',
      description: editingTransaction?.description || '',
    },
    validate: {
      amount: (value) => {
        if (!value || Number(value) <= 0) {
          return '金額は1円以上を入力してください';
        }
        return null;
      },
      category: (value) => (!value ? 'カテゴリを選択してください' : null),
    },
  });

  // タイプが変更された時にカテゴリをリセット
  useEffect(() => {
    if (form.values.category) {
      const selectedCategory = categories.find(c => c.id === form.values.category);
      if (selectedCategory && selectedCategory.type !== form.values.type) {
        form.setFieldValue('category', '');
      }
    }
  }, [form.values.type]);

  const filteredCategories = categories
    .filter(c => c.type === form.values.type)
    .map(category => ({
      value: category.id,
      label: category.name,
      color: category.color,
    }));

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);

    try {
      const transactionData = {
        ...values,
        date: values.date.toISOString().split('T')[0],
        amount: Number(values.amount),
      };

      await onSave(transactionData);
      
      notifications.show({
        title: '保存完了',
        message: editingTransaction ? '取引を更新しました' : '新しい取引を追加しました',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      if (!editingTransaction) {
        form.reset();
      }
    } catch (error) {
      notifications.show({
        title: 'エラー',
        message: '保存中にエラーが発生しました',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Box className="fade-in-up">
      <Paper shadow="md" radius="lg" p="xl" style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* ヘッダー */}
        <Group justify="space-between" mb="xl">
          <Group gap="md">
            <ThemeIcon
              size={50}
              radius="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              <IconCoin size={28} />
            </ThemeIcon>
            <div>
              <Title order={2} mb={4}>
                {editingTransaction ? '取引を編集' : '新しい取引を追加'}
              </Title>
              <Text c="dimmed" size="sm">
                {editingTransaction ? '既存の取引情報を編集できます' : '収入または支出を記録しましょう'}
              </Text>
            </div>
          </Group>
          
          <Tooltip label="キャンセル">
            <ActionIcon 
              color="gray" 
              variant="subtle" 
              size="lg"
              onClick={onCancel}
            >
              <IconX size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider mb="xl" />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            {/* 取引タイプ選択 */}
            <Box>
              <Text fw={500} mb="sm" size="sm">
                取引タイプ
              </Text>
              <SegmentedControl
                fullWidth
                size="md"
                data={[
                  {
                    label: (
                      <Group gap="sm" justify="center">
                        <ThemeIcon variant="light" color="teal" size="sm">
                          <IconTrendingUp size={14} />
                        </ThemeIcon>
                        <Text fw={500}>収入</Text>
                      </Group>
                    ),
                    value: 'income',
                  },
                  {
                    label: (
                      <Group gap="sm" justify="center">
                        <ThemeIcon variant="light" color="red" size="sm">
                          <IconTrendingDown size={14} />
                        </ThemeIcon>
                        <Text fw={500}>支出</Text>
                      </Group>
                    ),
                    value: 'expense',
                  },
                ]}
                {...form.getInputProps('type')}
              />
            </Box>

            <Grid gutter="md">
              {/* 金額入力 */}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="金額"
                  placeholder="0"
                  leftSection={<IconCurrencyYen size={16} />}
                  size="md"
                  min={1}
                  max={10000000}
                  thousandSeparator=","
                  required
                  styles={{
                    input: {
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    },
                  }}
                  {...form.getInputProps('amount')}
                />
              </Grid.Col>

              {/* 日付選択 */}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DateInput
                  label="日付"
                  placeholder="日付を選択"
                  leftSection={<IconCalendar size={16} />}
                  size="md"
                  valueFormat="YYYY年MM月DD日"
                  clearable
                  required
                  {...form.getInputProps('date')}
                />
              </Grid.Col>
            </Grid>

            {/* カテゴリ選択 */}
            <Select
              label="カテゴリ"
              placeholder="カテゴリを選択してください"
              leftSection={<IconCreditCard size={16} />}
              size="md"
              data={filteredCategories}
              searchable
              clearable
              required
              {...form.getInputProps('category')}
            />

            {/* 選択されたカテゴリの表示 */}
            {form.values.category && (
              <Card withBorder radius="md" p="sm" bg="gray.0">
                <Group gap="sm">
                  <ColorSwatch
                    color={categories.find(c => c.id === form.values.category)?.color || '#6b7280'}
                    size={20}
                  />
                  <Text size="sm" fw={500}>
                    選択中: {categories.find(c => c.id === form.values.category)?.name}
                  </Text>
                  <Badge 
                    variant="light" 
                    color={form.values.type === 'income' ? 'teal' : 'red'}
                    size="sm"
                  >
                    {form.values.type === 'income' ? '収入' : '支出'}
                  </Badge>
                </Group>
              </Card>
            )}

            {/* 説明入力 */}
            <Textarea
              label="説明（任意）"
              placeholder="取引の詳細を入力してください"
              leftSection={<IconFileText size={16} />}
              size="md"
              minRows={3}
              maxRows={5}
              autosize
              {...form.getInputProps('description')}
            />

            {/* 金額プレビュー */}
            {form.values.amount && (
              <Alert
                icon={form.values.type === 'income' ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
                title="プレビュー"
                color={form.values.type === 'income' ? 'teal' : 'red'}
                variant="light"
                radius="md"
              >
                <Group justify="space-between">
                  <Text size="sm">
                    {form.values.type === 'income' ? '収入として' : '支出として'}
                    <Text span fw={700} mx={4}>
                      {DataManager.formatAmount(Number(form.values.amount))}
                    </Text>
                    を記録します
                  </Text>
                  <Badge 
                    variant="filled" 
                    color={form.values.type === 'income' ? 'teal' : 'red'}
                    size="lg"
                  >
                    {form.values.type === 'income' ? '+' : '-'}
                    {DataManager.formatAmount(Number(form.values.amount))}
                  </Badge>
                </Group>
              </Alert>
            )}
          </Stack>

          <Divider my="xl" />

          {/* ボタン */}
          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={onCancel}
              disabled={isSubmitting}
              leftSection={<IconX size={16} />}
            >
              キャンセル
            </Button>
            
            <Button
              type="submit"
              loading={isSubmitting}
              leftSection={<IconDeviceFloppy size={16} />}
              gradient={{ from: 'blue', to: 'cyan' }}
              variant="gradient"
              size="md"
            >
              {isSubmitting 
                ? '保存中...' 
                : editingTransaction 
                  ? '更新する' 
                  : '保存する'
              }
            </Button>
          </Group>
        </form>
      </Paper>
    </Box>
  );
};

export default TransactionForm;