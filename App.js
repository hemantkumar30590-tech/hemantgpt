import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

export default function App() {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([{role:'ai', text:'Hi! Mai GPT-OSS-120B hu Groq pe ⚡️ Latest Google ke sath. Pucho kuch bhi!'}]);
  const [loading, setLoading] = useState(false);

  const GROQ_KEY = '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';
  const SERPER_KEY = '7c4ec67ea6920f941a8f8046502e2ef4858728a4';

  const askAI = async () => {
    if(!msg.trim()) return;
    const userMsg = msg;
    setChat(prev => [...prev, {role:'user', text:userMsg}]);
    setMsg('');
    setLoading(true);
    try {
      let googleData = "";
      try{
        const sRes = await fetch('https://google.serper.dev/search',{
          method:'POST',
          headers:{'X-API-KEY': SERPER_KEY, 'Content-Type':'application/json'},
          body: JSON.stringify({q: userMsg})
        });
        const sData = await sRes.json();
        googleData = sData.organic?.slice(0,5).map(r=>r.snippet).join('\n') || "";
      }catch(e){}

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${GROQ_KEY}`},
        body: JSON.stringify({
          model:'openai/gpt-oss-120b', // <-- YE WALA MODEL
          messages:[
            {role:'system', content: `You are helpful AI. Use this latest Google data to answer: ${googleData}. Answer in Hinglish, short.`},
            {role:'user', content: userMsg}
          ],
          temperature: 0.7
        })
      });
      const data = await res.json();
      const ans = data.choices?.[0]?.message?.content || "Error: " + JSON.stringify(data);
      setChat(c => [...c, {role:'ai', text:ans}]);
    } catch(e){
      setChat(c => [...c, {role:'ai', text:'Error: '+e.message}]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.header}>GPT 120B on Groq ⚡️</Text>
      <ScrollView style={s.chat} contentContainerStyle={{padding:10}}>
        {chat.map((c,i)=><View key={i} style={c.role=='user'?s.userBubble:s.aiBubble}><Text style={s.text}>{c.text}</Text></View>)}
        {loading && <Text style={s.loading}>Google + 120B soch raha hai...</Text>}
      </ScrollView>
      <View style={s.row}>
        <TextInput style={s.input} value={msg} onChangeText={setMsg} placeholder="Kuch bhi pucho..." placeholderTextColor="#888" onSubmitEditing={askAI}/>
        <TouchableOpacity style={s.btn} onPress={askAI}><Text style={{color:'#fff',fontWeight:'bold'}}>Send</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#000'},
  header:{color:'#fff',fontSize:18,fontWeight:'bold',textAlign:'center',padding:15,borderBottomWidth:1,borderColor:'#222'},
  chat:{flex:1},
  userBubble:{backgroundColor:'#2563eb',padding:12,margin:6,borderRadius:15,alignSelf:'flex-end',maxWidth:'80%'},
  aiBubble:{backgroundColor:'#1f1f1f',padding:12,margin:6,borderRadius:15,alignSelf:'flex-start',maxWidth:'90%'},
  text:{color:'#fff',fontSize:15},
  row:{flexDirection:'row',padding:10,borderTopWidth:1,borderColor:'#222'},
  input:{flex:1,backgroundColor:'#111',color:'#fff',padding:12,borderRadius:25,marginRight:10,borderWidth:1,borderColor:'#333'},
  btn:{backgroundColor:'#2563eb',paddingHorizontal:20,paddingVertical:12,borderRadius:25},
  loading:{color:'#888',padding:10,fontStyle:'italic'}
});