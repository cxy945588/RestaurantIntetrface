import React, { useState, useMemo } from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Badge, FAB, Subheading, Text, Portal, Modal, Dialog, Menu, TextInput, PaperProvider } from 'react-native-paper';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Product {
  id: string;
  name: string;
  status: '充足' | '稀少' | '缺貨' | '剩食';
  lastUpdated: Date;
  price: number;
}

const initialProducts: Product[] = [
  { id: '1', name: '蘋果派', status: '充足', lastUpdated: new Date(Date.now() - 30000), price: 120 },
  { id: '2', name: '藍莓慕斯', status: '稀少', lastUpdated: new Date(Date.now() - 20000), price: 150 },
  { id: '3', name: '巧克力蛋糕', status: '缺貨', lastUpdated: new Date(Date.now() - 10000), price: 170 },
  { id: '4', name: '草莓蛋糕', status: '稀少', lastUpdated: new Date(Date.now() - 40000), price: 200 },

];

const PRODUCT_STATUSES: Product['status'][] = ['剩食', '稀少', '缺貨', '充足'];

export default function ProductSupplyScreen() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogVisible, setDialogVisible] = useState(false); // 用來控制 Dialog 顯示
  const [newProductName, setNewProductName] = useState(''); // 新增商品的名稱
  const [newProductStatus, setNewProductStatus] = useState<Product['status']>('充足'); // 新增商品的狀態
  const [menuVisible, setMenuVisible] = useState(false); // 控制下拉式選單的顯示
  const [newProductPrice, setNewProductPrice] = useState<string>(''); // 價格狀態



  const groupedProducts = useMemo(() => {
    const grouped = products.reduce((acc, product) => {
      if (!acc[product.status]) {
        acc[product.status] = [];
      }
      acc[product.status].push(product);
      return acc;
    }, {} as Record<Product['status'], Product[]>);

    return PRODUCT_STATUSES.map(status => ({
      title: status,
      data: (grouped[status] || []).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
    }));
  }, [products]);

  const updateProductStatus = (id: string, newStatus: Product['status']) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? { ...product, status: newStatus, lastUpdated: new Date() } : product
      )
    );
  };

  // 處理新增商品
  const addNewProduct = () => {
    if (newProductName.trim()) {
      const newProduct: Product = {
        id: (products.length + 1).toString(),
        name: newProductName,
        status: newProductStatus,
        lastUpdated: new Date(),
        price: parseFloat(newProductPrice),
      };
      setProducts([...products, newProduct]);  // 新增商品
      setDialogVisible(false);  // 隱藏對話框
      setNewProductName('');  // 清空表單
      setNewProductPrice(''); // 清空價格欄位

    }
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

  const renderProductItem = ({ item }: { item: Product }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.name}  ${item.price}</Title>
          <Badge style={getBadgeStyle(item.status)}>{item.status}</Badge>
        </View>
        <Paragraph>定價: ${item.price}</Paragraph>
        <Paragraph>最後更新時間: {formatDate(item.lastUpdated)}</Paragraph>
        <View style={styles.buttonContainer}>
          {item.status !== '充足' && (
            <Button mode="contained" onPress={() => updateProductStatus(item.id, '充足')} style={styles.buttonSufficient}>
              標記充足
            </Button>
          )}
          {item.status !== '缺貨' && (
            <Button mode="outlined" onPress={() => updateProductStatus(item.id, '缺貨')} style={styles.buttonEmpty}>
              標記缺貨
            </Button>
          )}
          {item.status !== '稀少' && (
            <Button mode="contained" onPress={() => updateProductStatus(item.id, '稀少')} style={styles.buttonScarce}>
              標記稀少
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderSectionHeader = ({ section: { title, data } }: { section: { title: string; data: Product[] } }) => (
    <Subheading style={styles.sectionHeader}>
      {title} ({data.length})
    </Subheading>
  );

  const renderEmptyComponent = (title: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>當前沒有{title}的商品</Text>
    </View>
  );

  return (
    <PaperProvider>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={<Ionicons size={310} name="fast-food" style={styles.headerImage} />}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">商品供應情況</ThemedText>
        </ThemedView>
        <View style={styles.container}>
          <SectionList
            sections={groupedProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderProductItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={({ section: { data, title } }) =>
              data.length === 0 ? renderEmptyComponent(title) : null
            }
            stickySectionHeadersEnabled={false}
          />
        </View>
        {/* 新增商品的對話框 */}
        <Dialog visible={isDialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>新增商品</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="商品名稱"
              value={newProductName}
              onChangeText={text => setNewProductName(text)}
              style={styles.input}
            />
            <TextInput
              label="價格"
              value={newProductPrice}
              onChangeText={setNewProductPrice}
              style={styles.textInput}
              keyboardType="numeric" // 設置輸入數字鍵盤
            />
            {/* 商品狀態的下拉選單 */}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  contentStyle={styles.dropdown}
                >
                  {newProductStatus}
                </Button>
              }
            >
              {PRODUCT_STATUSES.map(status => (
                <Menu.Item
                  key={status}
                  onPress={() => {
                    setNewProductStatus(status);
                    setMenuVisible(false); // 關閉選單
                  }}
                  title={status}
                />
              ))}
            </Menu>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>取消</Button>
            <Button onPress={addNewProduct}>上架</Button>
          </Dialog.Actions>
        </Dialog>

        {/* 浮動按鈕：觸發顯示新增商品的對話框 */}
        <FAB
          icon="plus"
          style={styles.fabAdd}
          onPress={() => setDialogVisible(true)}  // 點擊後顯示對話框
          label="新增商品"
        />
      </ParallaxScrollView>
    </PaperProvider>

  );
}

const getBadgeStyle = (status: Product['status']) => {
  switch (status) {
    case '充足':
      return styles.badgeSufficient;
    case '稀少':
      return styles.badgeScarce;
    case '缺貨':
      return styles.badgeEmpty;
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
  badgeSufficient: {
    backgroundColor: '#4CAF50', // 綠色
  },
  badgeScarce: {
    backgroundColor: '#FFA500', // 橙色
  },
  badgeEmpty: {
    backgroundColor: '#FF0000', // 紅色
  },
  buttonSufficient: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginRight: 8,
  },
  buttonScarce: {
    //backgroundColor: '#FFA500',
    borderColor: '#FFA500',
    flex: 1,
    marginLeft: 8,
  },
  buttonEmpty: {
    borderColor: '#FF0000',
    flex: 1,
    marginLeft: 8,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  fabRefresh: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
  fabAdd: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 10,
  },
  dropdown: {
    justifyContent: 'space-between',
  },
  textInput: {
    marginBottom: 16,
  },

});