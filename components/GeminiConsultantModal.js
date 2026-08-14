import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, fetchWithTimeout } from '../auth/api';

export default function GeminiConsultantModal({ visible, onClose, context, title, systemPrompt }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && messages.length === 0) {
      triggerInitialGreeting();
    }
  }, [visible]);

  const triggerInitialGreeting = () => {
    let greeting = 'Halo! Saya NutriOS AI. ';
    if (context?.type === 'child') {
      greeting += `Ada yang bisa saya bantu terkait tumbuh kembang buah hati Anda, ${context.name || 'anak'}? Saya siap memberikan saran pola makan, tidur, dan aktivitas terbaik.`;
    } else if (context?.type === 'adult') {
      greeting += `Saya siap membantu menganalisis indeks massa tubuh (IMT) Anda dan memberikan panduan kebugaran, diet, dan pola tidur yang disesuaikan khusus untuk Anda.`;
    } else {
      greeting += 'Ada yang ingin Anda konsultasikan hari ini mengenai nutrisi, gizi, atau jadwal harian keluarga?';
    }

    setMessages([{ id: 'greet', sender: 'ai', text: greeting }]);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setInputText('');
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text }]);
    setLoading(true);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          context: {
            ...context,
            systemPrompt: systemPrompt
          }
        }),
        timeout: 30000
      });

      const data = await response.json();
      const aiMsgId = (Date.now() + 1).toString();

      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: data.reply.trim() }]);
      } else {
        console.warn('Gemini Server Error:', data);
        const errMsg = `⚠️ Gagal mendapat respon AI (Status ${response.status}):\n${data.message || 'Error tidak diketahui'}\n\nDetail: ${data.error || 'Tidak ada detail tambahan.'}`;
        setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: errMsg }]);
      }
    } catch (e) {
      console.error('Gemini Network/Connection Error:', e);
      const errorId = Date.now().toString();
      const errMsg = `❌ Koneksi terputus ke: ${API_BASE_URL}\n\nDetail: ${e.message}\n\nSolusi: Pastikan server backend berjalan di terminal dan IP target sesuai dengan IP Wi-Fi/Hotspot Anda saat ini.`;
      setMessages(prev => [...prev, { id: errorId, sender: 'ai', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickQuestions = () => {
    let pool = [];
    const type = context?.type;

    if (type === 'calculator' || type === 'child' || type === 'adult') {
      pool = [
        'Bagaimana cara menaikkan berat badan anak secara sehat?',
        'Apakah IMT saya termasuk kategori ideal?',
        'Bagaimana mengukur tinggi badan anak yang akurat?',
        'Tips mengatasi anak dengan status gizi kurang',
        'Berapa berat badan ideal untuk tinggi badan 160 cm?',
        'Makanan apa saja untuk mempercepat tumbuh kembang anak?',
        'Mengapa tinggi badan anak saya di bawah rata-rata?',
        'Cara menghitung kebutuhan kalori harian anak'
      ];
    } else if (type === 'pola_makan') {
      pool = [
        'Mengapa jadwal makan teratur sangat penting?',
        'Tips membatasi konsumsi gula berlebih sehari-hari',
        'Rekomendasi porsi makan gizi seimbang harian',
        'Berapa gelas air putih ideal untuk dikonsumsi harian?',
        'Menu sarapan sehat untuk meningkatkan fokus anak',
        'Bagaimana menyusun porsi Isi Piringku untuk anak?',
        'Dampak melewatkan sarapan pagi bagi kesehatan'
      ];
    } else if (type === 'rekomendasi_makanan') {
      pool = [
        'Ide menu sehat penambah berat badan anak yang murah',
        'Rekomendasi masakan tinggi protein hewani',
        'Camilan sehat yang aman dimakan malam hari',
        'Bantu buat variasi menu makan tinggi kalsium',
        'Menu diet sehat untuk menurunkan berat badan',
        'Resep sayuran praktis yang disukai anak-anak',
        'Makanan penurun kolesterol alami yang mudah didapat'
      ];
    } else if (type === 'stress') {
      pool = [
        'Bagaimana teknik meditasi pernapasan 4-7-8?',
        'Cara cepat menenangkan pikiran saat cemas',
        'Peregangan otot ringan untuk meredakan stres',
        'Tips tidur nyenyak setelah seharian bekerja',
        'Apakah stres bisa memengaruhi pencernaan?',
        'Cara mengatasi rasa lelah mental (burnout)',
        'Aktivitas rileksasi mandiri di rumah'
      ];
    } else {
      pool = [
        'Bantu susun menu makan sehat hari ini',
        'Cara mengatasi anak yang susah tidur',
        'Pentingnya protein hewani bagi tumbuh kembang',
        'Rekomendasi olahraga kardio ringan di rumah',
        'Tips menjaga hidrasi tubuh agar tetap fit',
        'Bagaimana melatih pola makan sehat pada keluarga?'
      ];
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const clearChat = () => {
    setMessages([]);
    triggerInitialGreeting();
  };

  const renderMessageText = (text, isUser) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <Text style={isUser ? styles.userText : styles.aiText}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={index} style={{ fontWeight: 'bold' }}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.sparkleIcon}>
                <Ionicons name="sparkles" size={16} color="#FFF" />
              </View>
              <Text style={styles.title}>{title || 'Konsultan NutriOS AI'}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={clearChat} style={{ marginRight: 16 }}>
                <Ionicons name="refresh-outline" size={22} color="#4B5563" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.bubbleContainer,
                  msg.sender === 'user' ? styles.userBubbleContainer : styles.aiBubbleContainer
                ]}
              >
                {msg.sender === 'ai' && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles-outline" size={14} color="#2563EB" />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  {renderMessageText(msg.text, msg.sender === 'user')}
                </View>
              </View>
            ))}

            {loading && (
              <View style={[styles.bubbleContainer, styles.aiBubbleContainer]}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles-outline" size={14} color="#2563EB" />
                </View>
                <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={[styles.aiText, { marginLeft: 8 }]}>NutriOS AI sedang merangkum jawaban...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {messages.length <= 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Rekomendasi Pertanyaan:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickQuestionsRow}>
                {getQuickQuestions().map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickQuestionBtn}
                    onPress={() => handleSend(q)}
                  >
                    <Text style={styles.quickQuestionText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Tanyakan rekomendasi kesehatan..."
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '80%',
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    backgroundColor: '#2563EB',
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageList: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messageListContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  aiBubbleContainer: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  userBubbleContainer: {
    alignSelf: 'flex-end',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  userText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  quickQuestionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickQuestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 20,
    marginBottom: 8,
  },
  quickQuestionsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickQuestionBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickQuestionText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 14,
    color: '#1F2937',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
});
