import React, { useState, useMemo } from 'react';
import { View, SectionList, StyleSheet } from 'react-native';

import { Card, Title, Paragraph, Button, Badge, FAB, Subheading, Text } from 'react-native-paper';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Order {
  id: string;
  item: string;
  status: '新訂單' | '準備中' | '準備完成';
  createdAt: Date;
}

const initialOrders: Order[] = [
  { id: '1', item: '#orderE78C', status: '新訂單', createdAt: new Date(Date.now() - 30000) },
  { id: '2', item: '#order62A6', status: '準備中', createdAt: new Date(Date.now() - 20000) },
  { id: '3', item: '#order588D', status: '準備完成', createdAt: new Date(Date.now() - 10000) },
];

const ORDER_STATUSES: Order['status'][] = ['新訂單', '準備中', '準備完成'];

export default function HomeScreen() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const groupedOrders = useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
      if (!acc[order.status]) {
        acc[order.status] = [];
      }
      acc[order.status].push(order);
      return acc;
    }, {} as Record<Order['status'], Order[]>);

    return ORDER_STATUSES.map(status => ({
      title: status,
      data: (grouped[status] || []).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }));
  }, [orders]);

  const updateOrderStatus = (id: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const generateMockOrder = () => {
    const newOrder: Order = {
      id: Date.now().toString(),
      item: `#order${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      status: '新訂單',
      createdAt: new Date()
    };
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.item}</Title>
          <Badge style={getBadgeStyle(item.status)}>{item.status}</Badge>
        </View>
        <Paragraph>訂單成立時間: {formatDate(item.createdAt)}</Paragraph>
        {item.status === '新訂單' && (
          <Button mode="contained" onPress={() => updateOrderStatus(item.id, '準備中')} style={getButtonStyle(item.status)}>
            接受訂單
          </Button>
        )}
        {item.status === '準備中' && (
          <Button mode="contained" onPress={() => updateOrderStatus(item.id, '準備完成')} style={getButtonStyle(item.status)}>
            完成準備
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderSectionHeader = ({ section: { title, data } }: { section: { title: string; data: Order[] } }) => (
    <Subheading style={styles.sectionHeader}>
      {title} ({data.length})
    </Subheading>
  );

  const renderEmptyComponent = (title: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>當前沒有{title}的項目</Text>
    </View>
  );

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Ionicons size={310} name="clipboard" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">當前訂單</ThemedText>
      </ThemedView>
      <View style={styles.container}>
        <SectionList
          sections={groupedOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          renderSectionHeader={renderSectionHeader}
          renderSectionFooter={({ section: { data, title } }) => 
            data.length === 0 ? renderEmptyComponent(title) : null
          }
          stickySectionHeadersEnabled={false}
        />
      </View>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={generateMockOrder}
        label="生成新訂單"
      />
    </ParallaxScrollView>
  );
}

const getBadgeStyle = (status: Order['status']) => {
  switch (status) {
    case '新訂單':
      return styles.badgeNew;
    case '準備中':
      return styles.badgePreparing;
    case '準備完成':
      return styles.badgeComplete;
  }
};

const getButtonStyle = (status: Order['status']) => {
  switch (status) {
    case '新訂單':
      return styles.buttonNew;
    case '準備中':
      return styles.buttonPreparing;
  }
};


const styles = StyleSheet.create({
  headerImage: {
    bottom: -120,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  badgeNew: {
    backgroundColor: '#007BFF',
  },
  badgePreparing: {
    backgroundColor: '#FFA500',
  },
  badgeComplete: {
    backgroundColor: '#4CAF50',
  },


  buttonNew: {
    backgroundColor: '#007BFF',
    marginTop: 8,
  },
  buttonPreparing: {
    backgroundColor: '#FFA500',
    marginTop: 8,
  },

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});