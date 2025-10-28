import React, {useEffect, useState} from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, Image, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from './config';

export default function App(){
  const [recipes, setRecipes] = useState([]);
  const [people, setPeople] = useState('2');
  const [budget, setBudget] = useState('30');
  const [allergies, setAllergies] = useState('');
  const [plan, setPlan] = useState(null);

  useEffect(()=>{ fetchRecipes(); },[]);

  async function fetchRecipes(){
    try{
      const res = await axios.get(API_URL + '/api/recipes');
      setRecipes(res.data || []);
    }catch(e){
      Alert.alert('Chyba','Nepodarilo sa načítať recepty. Skontroluj backend URL v config.js');
    }
  }

  async function generatePlan(){
    try{
      const payload = { people: Number(people), days:7, mealTypes:{breakfast:true,lunch:true,dinner:true}, allergies, budget: Number(budget) };
      const res = await axios.post(API_URL + '/api/plan', payload);
      setPlan(res.data.plan);
      Alert.alert('Hotovo','Týždenný plán je pripravený');
    }catch(e){
      Alert.alert('Chyba','Nepodarilo sa vygenerovať plán');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={{uri:'https://freeimage.host/i/KryEnmx'}} style={styles.logo} />
          <View style={{flex:1}}>
            <Text style={styles.title}>MealMind</Text>
            <Text style={styles.subtitle}>Tvoj inteligentný jedálniček</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Počet osôb</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={people} onChangeText={setPeople} />
          <Text style={{marginTop:8}}>Rozpočet (€ / týždeň)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={budget} onChangeText={setBudget} />
          <Text style={{marginTop:8}}>Alergény (čiarkou)</Text>
          <TextInput style={styles.input} value={allergies} onChangeText={setAllergies} placeholder="napr. orechy, mlieko" />
        </View>

        <TouchableOpacity style={styles.button} onPress={generatePlan}><Text style={styles.buttonText}>Generovať týždenný plán</Text></TouchableOpacity>

        <Text style={{fontSize:18, fontWeight:'700', marginTop:12}}>Ukážka receptov</Text>
        <FlatList data={recipes} keyExtractor={item=>String(item.id)} renderItem={({item})=>(
          <View style={styles.recipeCard}>
            <Image source={{uri:item.image}} style={styles.recipeImage} />
            <View style={{flex:1, paddingLeft:10}}>
              <Text style={styles.recipeTitle}>{item.name}</Text>
              <Text style={styles.recipeMeta}>{item.time} min • {item.servings} porcie • {item.estimatedCost} €</Text>
            </View>
          </View>
        )} />

        {plan && (<View style={{width:'100%', marginTop:12}}>
          <Text style={{fontSize:18,fontWeight:'700'}}>Týždenný plán</Text>
          {plan.map(d=>(<View key={d.day} style={styles.dayCard}><Text style={{fontWeight:'700'}}>Deň {d.day}</Text>{d.meals.map(m=>(<Text key={m.slot}>• {m.slot}: {m.name} {m.perMealCost ? `(${m.perMealCost} €)` : ''}</Text>))}</View>))}
        </View>)}

        <View style={{height:40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = { teal:'#0aa3a3', orange:'#ff6b35', dark:'#1f2937', light:'#ffffff' };
const styles = StyleSheet.create({
  safe:{flex:1, backgroundColor:COLORS.light},
  container:{padding:16, alignItems:'center'},
  header:{flexDirection:'row', alignItems:'center', marginBottom:12},
  logo:{width:72,height:72,borderRadius:12,marginRight:12},
  title:{fontSize:26,fontWeight:'800',color:COLORS.dark},
  subtitle:{color:'#666'},
  card:{width:'100%', backgroundColor:'#fff', padding:12, borderRadius:12, marginVertical:8, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:8},
  label:{fontWeight:'600', marginBottom:6},
  input:{borderWidth:1,borderColor:'#e6e6e6', padding:8, borderRadius:8},
  button:{backgroundColor:COLORS.teal,padding:14,borderRadius:12,width:'100%',alignItems:'center',marginTop:8},
  buttonText:{color:'#fff',fontWeight:'700'},
  recipeCard:{flexDirection:'row',backgroundColor:'#fff',padding:10,borderRadius:10,marginTop:10,width:350},
  recipeImage:{width:100,height:70,borderRadius:8},
  recipeTitle:{fontWeight:'700'},
  recipeMeta:{color:'#666',marginTop:4},
  dayCard:{backgroundColor:'#fff',padding:10,borderRadius:8,marginTop:8,width:'100%'}
});
