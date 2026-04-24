import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { supabase } from '../utils/supabase';

type Todo = {
  id: number;
  name: string;
};

export default function TodosScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      try {
        const { data, error } = await supabase.from('todos').select();

        if (error) {
          console.error('Error fetching todos:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setTodos(data as Todo[]);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching todos:', error.message);
        } else {
          console.error('Error fetching todos:', String(error));
        }
      }
    };

    getTodos();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>Todo List</Text>
      <FlatList
        style={{ width: '100%' }}
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text key={item.id}>{item.name}</Text>}
        ListEmptyComponent={<Text>No todos found.</Text>}
      />
    </View>
  );
}
