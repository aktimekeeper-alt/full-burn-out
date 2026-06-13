import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

interface Results {
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
}

export default function CalculatorScreen() {
  const [price, setPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Results | null>(null);

  const calculate = () => {
    const principal = parseFloat(price) - parseFloat(downPayment || '0');
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const months = parseInt(term);

    if (isNaN(principal) || isNaN(monthlyRate) || isNaN(months) || months <= 0 || principal <= 0) {
      setResults(null);
      return;
    }

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalCost = monthlyPayment * months + parseFloat(downPayment || '0');
    const totalInterest = totalCost - parseFloat(price);

    setResults({ monthlyPayment, totalCost, totalInterest });
  };

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>LOAN CALCULATOR</Text>
        <Text style={styles.subtitle}>Estimate your monthly payments</Text>

        <View style={styles.card}>
          <Field label="Vehicle Price ($)" value={price} onChange={setPrice} placeholder="e.g. 35000" />
          <Field label="Down Payment ($)" value={downPayment} onChange={setDownPayment} placeholder="e.g. 5000" />
          <Field label="Interest Rate (% APR)" value={rate} onChange={setRate} placeholder="e.g. 6.5" />
          <Field label="Loan Term (months)" value={term} onChange={setTerm} placeholder="e.g. 60" />

          <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
            <Text style={styles.calcBtnText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {results && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Results</Text>
            <ResultRow label="Monthly Payment" value={fmt(results.monthlyPayment)} highlight />
            <ResultRow label="Total Loan Cost" value={fmt(results.totalCost)} />
            <ResultRow label="Total Interest Paid" value={fmt(results.totalInterest)} />
            <ResultRow label="Loan Amount" value={fmt(parseFloat(price) - parseFloat(downPayment || '0'))} />
          </View>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tip}>• 20% down reduces interest significantly</Text>
          <Text style={styles.tip}>• 60-month terms are most common for auto loans</Text>
          <Text style={styles.tip}>• Credit score directly impacts your APR</Text>
          <Text style={styles.tip}>• Shop multiple lenders before committing</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#555"
        keyboardType="decimal-pad"
      />
    </View>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={[styles.resultValue, highlight && styles.resultHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  title: { color: '#FF4500', fontSize: 22, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 24 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  label: { color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#2A2A2A', color: '#fff', borderRadius: 10,
    padding: 12, fontSize: 16,
  },
  calcBtn: { backgroundColor: '#FF4500', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  calcBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  resultsCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#FF4500' },
  resultsTitle: { color: '#FF4500', fontSize: 16, fontWeight: '800', marginBottom: 16, letterSpacing: 1 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultLabel: { color: '#aaa', fontSize: 14 },
  resultValue: { color: '#fff', fontSize: 15, fontWeight: '600' },
  resultHighlight: { color: '#FF4500', fontSize: 22, fontWeight: '900' },
  tipsCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20 },
  tipsTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 12 },
  tip: { color: '#888', fontSize: 13, marginBottom: 6, lineHeight: 20 },
});
