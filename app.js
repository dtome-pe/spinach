// App.js (React Native with Expo)
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const API_URL = 'http://localhost:3001/api/recipes/today';

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('metric'); // or 'us'
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const toggleCheck = (category, ingredient) => {
    const key = `${category}_${ingredient.name}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView style={styles.container}>
      {recipes.map(({ category, recipe }) => (
        <View key={category} style={styles.card}>
          <Text style={styles.title}>{recipe.title} ({category})</Text>
          <Image source={{ uri: recipe.image }} style={styles.image} />

          <Text style={styles.section}>🛒 Shopping List</Text>
          {recipe.extendedIngredients.map(ing => {
            const measure = ing.measures[unit];
            const key = `${category}_${ing.name}`;
            return (
              <TouchableOpacity
                key={ing.id}
                onPress={() => toggleCheck(category, ing)}
              >
                <Text style={[styles.ingredient, checkedItems[key] && styles.crossed]}>
                  [ {checkedItems[key] ? '✔' : ' '} ] {measure.amount} {measure.unitShort} {ing.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.section}>👨‍🍳 Instructions</Text>
          {recipe.analyzedInstructions[0]?.steps.map(step => (
            <Text key={step.number} style={styles.instruction}>
              {step.number}. {step.step}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  image: {
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  section: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 16,
  },
  ingredient: {
    fontSize: 16,
    marginVertical: 3,
  },
  crossed: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  instruction: {
    marginBottom: 5,
    lineHeight: 20,
  },
});